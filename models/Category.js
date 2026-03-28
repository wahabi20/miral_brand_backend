const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    fileId: String,
    url: String,
    name: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
