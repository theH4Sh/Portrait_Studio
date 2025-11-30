const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  walkInName: { 
    type: String, 
    required: function() {
      return !this.user
  }},
  phoneNumber: { type: String, required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled', 'rejected', 'returned'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
