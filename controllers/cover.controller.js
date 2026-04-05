const CoverImage = require('../models/CoverImage');
const { uploadFile, deleteFile } = require('../services/drive.service');

// Public: get all active covers sorted by order
exports.getAll = async (req, res) => {
  const covers = await CoverImage.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json(covers);
};

// Admin: get all covers (including inactive)
exports.getAllAdmin = async (req, res) => {
  const covers = await CoverImage.find().sort({ order: 1, createdAt: 1 });
  res.json(covers);
};

// Admin: create cover
exports.create = async (req, res) => {
  const { title, subtitle, link, order, isActive } = req.body;
  const file = req.file;

  let image = null;
  if (file) {
    image = await uploadFile(file.buffer, file.mimetype, file.originalname);
  }

  const cover = await CoverImage.create({
    title: title || '',
    subtitle: subtitle || '',
    link: link || '',
    image,
    order: order !== undefined ? Number(order) : 0,
    isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true
  });

  res.status(201).json(cover);
};

// Admin: update cover
exports.update = async (req, res) => {
  const cover = await CoverImage.findById(req.params.id);
  if (!cover) return res.status(404).json({ message: 'Couverture introuvable' });

  const { title, subtitle, link, order, isActive } = req.body;
  const file = req.file;

  if (title !== undefined) cover.title = title;
  if (subtitle !== undefined) cover.subtitle = subtitle;
  if (link !== undefined) cover.link = link;
  if (order !== undefined) cover.order = Number(order);
  if (isActive !== undefined) cover.isActive = isActive === 'true' || isActive === true;

  if (file) {
    if (cover.image?.fileId) await deleteFile(cover.image.fileId);
    cover.image = await uploadFile(file.buffer, file.mimetype, file.originalname);
  }

  await cover.save();
  res.json(cover);
};

// Admin: delete cover
exports.delete = async (req, res) => {
  const cover = await CoverImage.findById(req.params.id);
  if (!cover) return res.status(404).json({ message: 'Couverture introuvable' });
  if (cover.image?.fileId) await deleteFile(cover.image.fileId);
  await cover.deleteOne();
  res.json({ message: 'Supprimé' });
};
