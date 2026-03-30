const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  fileId: String,
  url: String,
  name: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix doit être positif']
  },
  images: [imageSchema],
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  isPromo: {
    type: Boolean,
    default: false
  },
  promoPrice: {
    type: Number,
    min: [0, 'Le prix promo doit être positif'],
    default: null
  },
  cost: {
    type: Number,
    min: [0, 'Le coût doit être positif'],
    default: 0
  }
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
