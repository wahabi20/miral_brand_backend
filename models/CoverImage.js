const mongoose = require('mongoose');

const coverImageSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  subtitle: { type: String, trim: true, default: '' },
  link: { type: String, trim: true, default: '' },
  image: {
    fileId: String,
    url: String,
    name: String
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CoverImage', coverImageSchema);
