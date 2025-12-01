const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true }, // frontend uploads + sends URL
  category: { type: String, enum: ["wedding", "birthday", "product", "fashion", "other"], default: "other" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
