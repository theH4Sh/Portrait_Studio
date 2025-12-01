const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  approved: { type: Boolean, default: false }, // admin moderates
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
