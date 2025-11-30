const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true }, // how many units are available
  pricePerDay: { type: Number, required: true }, // rental rate
  images: { type: String, required: true },
  isActive: { type: Boolean, default: true }, // active for rental
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
