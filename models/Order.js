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
  productCost: { type: Number, default: 0 },
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
  email: {
    type: String,
    default: null
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
    enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'returned'],
    default: 'pending'
  },
  notes: String,
  netBenefitOverride: { type: Number, default: null },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
