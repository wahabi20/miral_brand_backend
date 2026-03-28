const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productTitle: String,
  productPrice: Number,
  productOriginalPrice: Number,
  isPromo: { type: Boolean, default: false },
  productCategory: String,
  productImages: [String],
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  address: {
    type: String,
    required: [true, "L'adresse est requise"]
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité minimum est 1']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'cancelled'],
    default: 'pending'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
