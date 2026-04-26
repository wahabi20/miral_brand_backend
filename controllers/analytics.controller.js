const Visit = require('../models/Visit');
const Order = require('../models/Order');

function detectDevice(ua = '') {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

exports.recordVisit = async (req, res) => {
  const { page, referrer = '' } = req.body;
  if (!page) return res.status(400).json({ message: 'page required' });

  const ua     = req.headers['user-agent'] || '';
  const ip     = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const device = detectDevice(ua);

  await Visit.create({ page, ip, device, referrer });
  res.json({ ok: true });
};

exports.getStats = async (req, res) => {
  const days   = Math.min(parseInt(req.query.days) || 30, 365);
  const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Pipeline to extract product ID from URL and join with Product collection
  const productVisitsPipeline = (urlPrefix) => [
    { $match: { page: { $regex: `^${urlPrefix}` }, createdAt: { $gte: since } } },
    { $addFields: { rawId: { $arrayElemAt: [{ $split: ['$page', '/'] }, 2] } } },
    { $group: { _id: '$rawId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    { $addFields: {
      productOid: { $convert: { input: '$_id', to: 'objectId', onError: null } }
    }},
    { $lookup: { from: 'products', localField: 'productOid', foreignField: '_id', as: 'product' } },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
    { $project: {
      _id: 0, productId: '$_id', count: 1,
      title: '$product.title',
      image: { $arrayElemAt: ['$product.images.url', 0] }
    }}
  ];

  const [
    total, todayVisits, weekVisits,
    visitsPerDay, deviceBreakdown, topReferrers,
    topVisitedProducts, topClickedProducts, periodOrders, topSoldProducts
  ] = await Promise.all([
    Visit.countDocuments(),
    Visit.countDocuments({ createdAt: { $gte: today } }),
    Visit.countDocuments({ createdAt: { $gte: weekAgo } }),

    Visit.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),

    Visit.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]),

    Visit.aggregate([
      { $match: { referrer: { $nin: ['', null] } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),

    Visit.aggregate(productVisitsPipeline('/products/')),

    Visit.aggregate(productVisitsPipeline('/order/')),

    Order.countDocuments({ deletedAt: null, createdAt: { $gte: since } }),

    Order.aggregate([
      { $match: { deletedAt: null, status: { $in: ['confirmed', 'shipped'] } } },
      { $group: {
        _id: '$product',
        title:    { $first: '$productTitle' },
        image:    { $first: { $arrayElemAt: ['$productImages', 0] } },
        orders:   { $sum: 1 },
        quantity: { $sum: '$quantity' }
      }},
      { $sort: { quantity: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, productId: '$_id', title: 1, image: 1, orders: 1, quantity: 1 } }
    ])
  ]);

  res.json({
    total,
    todayVisits,
    weekVisits,
    visitsPerDay,
    deviceBreakdown,
    topReferrers,
    topVisitedProducts,
    topClickedProducts,
    topSoldProducts,
    periodVisits: visitsPerDay.reduce((s, d) => s + d.count, 0),
    periodOrders,
    conversionRate: total > 0
      ? +((periodOrders / total) * 100).toFixed(2)
      : 0,
  });
};
