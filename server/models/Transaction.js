const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  creator:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  campaign:   { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },

  type: {
    type: String,
    enum: ['earning', 'withdrawal', 'bonus', 'deduction'],
    required: true
  },

  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'reversed'],
    default: 'pending'
  },

  // Payout info
  upiId:            { type: String },
  razorpayPayoutId: { type: String },
  paymentGateway:   { type: String, default: 'manual' }, // 'razorpay', 'manual'

  // Notes
  description:  { type: String },
  adminNote:    { type: String },

  // Processing
  processedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt:  { type: Date },

}, { timestamps: true });

transactionSchema.index({ creator: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
