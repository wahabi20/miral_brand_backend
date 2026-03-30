const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderNotification } = require('../services/mail.service');

exports.create = async (req, res) => {
  const { productId, firstName, lastName, address, phone, quantity, notes } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Produit introuvable' });

  const qty = Number(quantity);
  const unitPrice = (product.isPromo && product.promoPrice) ? product.promoPrice : product.price;
  const totalPrice = unitPrice * qty;

  const order = await Order.create({
    product: product._id,
    productTitle: product.title,
    productPrice: unitPrice,
    productOriginalPrice: product.price,
    productCost: product.cost || 0,
    isPromo: product.isPromo && !!product.promoPrice,
    productCategory: product.category,
    productImages: product.images.map(img => img.url),
    firstName,
    lastName,
    address,
    phone,
    quantity: qty,
    totalPrice,
    notes
  });

  // Send email notification (non-blocking)
  sendOrderNotification(order).catch(err => {
    console.error('Email error:', err.message);
  });

  res.status(201).json(order);
};

exports.getStats = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);

  // totalPrice already includes the 7 TND client shipping — do NOT add it again
  // Fixed costs: 7 (shipping) + 0.900 (handling) + 2.115 (dropshipping) + 0.560 (packaging) = 10.575
  const FIXED_COSTS_PER_ORDER = 10.575;

  const monthly = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, deletedAt: null } },
    {
      $group: {
        _id:        { $month: '$createdAt' },
        count:      { $sum: 1 },
        revenue:    { $sum: '$totalPrice' },
        netBenefit: {
          $sum: {
            $subtract: [
              '$totalPrice',
              { $add: [
                { $multiply: [{ $ifNull: ['$productCost', 0] }, '$quantity'] },
                FIXED_COSTS_PER_ORDER
              ]}
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill all 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const found = monthly.find(m => m._id === i + 1);
    return { month: i + 1, count: found?.count || 0, revenue: found?.revenue || 0, netBenefit: found?.netBenefit || 0 };
  });

  // Total net benefit for the year
  const netBenefitAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, deletedAt: null } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $subtract: [
              '$totalPrice',
              { $add: [
                { $multiply: [{ $ifNull: ['$productCost', 0] }, '$quantity'] },
                FIXED_COSTS_PER_ORDER
              ]}
            ]
          }
        }
      }
    }
  ]);
  const totalNetBenefit = netBenefitAgg[0]?.total || 0;

  // Status breakdown for the year
  const statusBreakdown = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, deletedAt: null } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Available years
  const years = await Order.aggregate([
    { $group: { _id: { $year: '$createdAt' } } },
    { $sort: { _id: -1 } }
  ]);

  res.json({
    months,
    totalNetBenefit,
    statusBreakdown,
    years: years.map(y => y._id)
  });
};

exports.getAll = async (req, res) => {
  const { status, page = 1, limit = 20, showDeleted } = req.query;
  const query = { deletedAt: null };
  if (status) query.status = status;
  if (showDeleted === 'true') delete query.deletedAt; // admin can view all
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(query)
  ]);

  res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  res.json(order);
};

exports.update = async (req, res) => {
  const { firstName, lastName, address, phone, quantity, notes, status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });

  if (firstName  !== undefined) order.firstName  = firstName;
  if (lastName   !== undefined) order.lastName   = lastName;
  if (address    !== undefined) order.address    = address;
  if (phone      !== undefined) order.phone      = phone;
  if (notes      !== undefined) order.notes      = notes;
  if (status     !== undefined) order.status     = status;
  if (quantity   !== undefined) {
    order.quantity   = Number(quantity);
    order.totalPrice = order.productPrice * order.quantity;
  }

  await order.save();
  res.json(order);
};

exports.softDelete = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { deletedAt: new Date() },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  res.json({ message: 'Commande supprimée', order });
};

exports.restore = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { deletedAt: null },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  res.json({ message: 'Commande restaurée', order });
};
