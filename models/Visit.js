const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  page:     { type: String, required: true },
  ip:       { type: String, default: '' },
  device:   { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  referrer: { type: String, default: '' },
}, { timestamps: true });

visitSchema.index({ createdAt: -1 });
visitSchema.index({ page: 1 });
visitSchema.index({ ip: 1 });

module.exports = mongoose.model('Visit', visitSchema);
