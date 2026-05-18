const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
  phone:      { type: String, required: true },
  purpose:    { type: String, enum: ['register', 'login', 'change_password', 'verify'], default: 'register' },
  status:     { type: String, enum: ['sent', 'verified', 'failed', 'expired'], default: 'sent' },
  attempts:   { type: Number, default: 0 },
  ipAddress:  { type: String },
  msg91RequestId: { type: String },
}, { timestamps: true });

// TTL index — auto delete OTP logs after 7 days
otpLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
otpLogSchema.index({ phone: 1 });

module.exports = mongoose.model('OTPLog', otpLogSchema);
