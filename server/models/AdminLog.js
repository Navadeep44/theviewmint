const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:   { type: String, required: true },  // e.g., 'approve_campaign', 'ban_user'
  target:   { type: String },                  // e.g., 'Campaign', 'User'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details:  { type: String },
  ipAddress:{ type: String },
}, { timestamps: true });

adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ action: 1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
