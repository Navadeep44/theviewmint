const mongoose = require('mongoose');

/**
 * Application: Creator applies to join a campaign (before submission)
 */
const applicationSchema = new mongoose.Schema({
  creator:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign:   { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },

  // Creator accepts campaign terms
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },

  // Application status
  status: {
    type: String,
    enum: ['applied', 'approved', 'rejected', 'withdrawn'],
    default: 'applied'
  },

  // Admin action
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  adminNote:  { type: String },

  // Notes from creator
  note: { type: String, trim: true },

}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ creator: 1, campaign: 1 }, { unique: true });
applicationSchema.index({ campaign: 1, status: 1 });
applicationSchema.index({ creator: 1 });

module.exports = mongoose.model('Application', applicationSchema);
