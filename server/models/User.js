const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Core identity
  name:           { type: String, required: true, trim: true },
  username:       { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  email:          { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  phone:          { type: String, unique: true, sparse: true, trim: true },

  // Auth
  password:       { type: String },
  refreshTokens:  [{ type: String }], // Supports multiple devices / logout-all

  // Role
  role: {
    type: String,
    default: 'creator',
    enum: ['creator', 'admin', 'superadmin']
  },

  // Status
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'suspended', 'banned']
  },

  // Profile
  profileImage:     { type: String, default: '' },
  bio:              { type: String, default: '', trim: true },

  // Social handles
  instagramHandle:  { type: String, default: '', trim: true },
  youtubeChannel:   { type: String, default: '', trim: true },
  twitterHandle:    { type: String, default: '', trim: true },
  tiktokHandle:     { type: String, default: '', trim: true },

  // Payment
  upiId:            { type: String, default: '', trim: true },

  // Earnings wallet
  totalEarnings:      { type: Number, default: 0 },
  withdrawableAmount: { type: Number, default: 0 },
  totalWithdrawn:     { type: Number, default: 0 },

  // Performance
  performanceScore:   { type: Number, default: 0 },  // 0-100
  totalCampaigns:     { type: Number, default: 0 },
  approvedSubmissions:{ type: Number, default: 0 },
  rejectedSubmissions:{ type: Number, default: 0 },

  // Firebase / OAuth
  firebaseUid:  { type: String, unique: true, sparse: true },

  // Email verification
  isEmailVerified:  { type: Boolean, default: false },
  isPhoneVerified:  { type: Boolean, default: false },

  // Admin notes
  adminNote:  { type: String, default: '' },

  // Last active
  lastActive: { type: Date },

}, { timestamps: true });

// Indexes for fast lookups
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
