const { uploadFile, deleteFile } = require('../services/drive.service');

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' });
  const result = await uploadFile(req.file.buffer, req.file.mimetype, req.file.originalname);
  res.status(201).json(result);
};

exports.delete = async (req, res) => {
  await deleteFile(req.params.fileId);
  res.json({ message: 'Fichier supprimé' });
};
