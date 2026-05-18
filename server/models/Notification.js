const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: [
      'campaign_approved',
      'campaign_rejected',
      'submission_approved',
      'submission_rejected',
      'payout_initiated',
      'payout_completed',
      'application_approved',
      'application_rejected',
      'new_campaign',       // Broadcast to all creators
      'admin_announcement', // Broadcast to all
      'general',
    ],
    required: true
  },

  title:    { type: String, required: true },
  message:  { type: String, required: true },

  // Optional reference link
  refType: { type: String, enum: ['Campaign', 'Submission', 'Application', 'Transaction'] },
  refId:   { type: mongoose.Schema.Types.ObjectId },

  isRead:     { type: Boolean, default: false },
  readAt:     { type: Date },

}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
