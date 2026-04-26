const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadFile, deleteFile } = require("../services/drive.service");

exports.getAll = async (req, res) => {
  const { category, search, title, page = 1, limit = 12, featured, inStock, minPrice, maxPrice, dateFrom, dateTo } = req.query;
  const query = {};

  if (category) query.category = category;
  if (featured === "true") query.featured = true;
  if (inStock === "true") query.inStock = true;
  if (inStock === "false") query.inStock = false;
  if (title) query.title = { $regex: title, $options: "i" };
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo)   query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
};

exports.getById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Produit introuvable" });
  res.json(product);
};

exports.getCategories = async (req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories);
};

exports.create = async (req, res) => {
  const { title, description, category, price, cost, inStock, featured, isPromo, promoPrice } = req.body;

  // Upload product images
  const images = [];
  const imageFiles = req.files?.['images'] || [];
  for (const file of imageFiles) {
    const result = await uploadFile(file.buffer, file.mimetype, file.originalname);
    if (result) images.push(result);
  }

  // Auto-create or update category with image if provided
  const catImageFiles = req.files?.['categoryImage'] || [];
  if (catImageFiles.length > 0) {
    const catImg = await uploadFile(catImageFiles[0].buffer, catImageFiles[0].mimetype, catImageFiles[0].originalname);
    const existing = await Category.findOne({ name: category });
    if (existing) { if (catImg) { existing.image = catImg; await existing.save(); } }
    else { await Category.create({ name: category, image: catImg }); }
  } else {
    // Ensure category exists (without image)
    const exists = await Category.findOne({ name: category });
    if (!exists) await Category.create({ name: category });
  }

  const product = await Product.create({
    title,
    description,
    category,
    price: Number(price),
    cost: cost ? Number(cost) : 0,
    images,
    inStock: inStock !== "false",
    featured: featured === "true",
    isPromo: isPromo === "true",
    promoPrice: promoPrice ? Number(promoPrice) : null,
  });

  res.status(201).json(product);
};

exports.update = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Produit introuvable" });

  const {
    title,
    description,
    category,
    price,
    cost,
    inStock,
    featured,
    isPromo,
    promoPrice,
    deletedImages,
  } = req.body;

  // Delete removed images from Drive
  if (deletedImages) {
    const toDelete = JSON.parse(deletedImages);
    for (const fileId of toDelete) {
      await deleteFile(fileId);
    }
    product.images = product.images.filter(
      (img) => !toDelete.includes(img.fileId),
    );
  }

  // Reorder existing images if imageOrder provided
  if (req.body.imageOrder) {
    const order = JSON.parse(req.body.imageOrder);
    product.images = order
      .map(id => product.images.find(img => img.fileId === id))
      .filter(Boolean);
  }

  // Upload new images
  const newImageFiles = req.files?.['images'] || [];
  for (const file of newImageFiles) {
    const result = await uploadFile(file.buffer, file.mimetype, file.originalname);
    if (result) product.images.push(result);
  }

  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (cost !== undefined) product.cost = cost ? Number(cost) : 0;
  if (inStock !== undefined) product.inStock = inStock !== "false";
  if (featured !== undefined) product.featured = featured === "true";
  if (isPromo !== undefined) product.isPromo = isPromo === "true";
  if (promoPrice !== undefined) product.promoPrice = promoPrice ? Number(promoPrice) : null;

  await product.save();
  res.json(product);
};

exports.delete = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Produit introuvable" });

  // Delete all images from Drive
  for (const img of product.images) {
    if (img.fileId) await deleteFile(img.fileId);
  }

  await product.deleteOne();
  res.json({ message: "Produit supprimé" });
};
