const Category = require('../models/Category');
const { uploadFile, deleteFile } = require('../services/drive.service');

exports.getAll = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Le nom est requis' });

  let image = null;
  if (req.file) {
    image = await uploadFile(req.file.buffer, req.file.mimetype, req.file.originalname);
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    if (image) existing.image = image;
    await existing.save();
    return res.json(existing);
  }

  const category = await Category.create({ name: name.trim(), image });
  res.status(201).json(category);
};

exports.delete = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
  if (cat.image?.fileId) await deleteFile(cat.image.fileId);
  await cat.deleteOne();
  res.json({ message: 'Catégorie supprimée' });
};
