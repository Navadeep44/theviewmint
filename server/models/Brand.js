const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  // Contact
  companyName:    { type: String, required: true, trim: true },
  contactName:    { type: String, required: true, trim: true },
  email:          { type: String, required: true, trim: true, lowercase: true },
  phone:          { type: String, trim: true },
  website:        { type: String, trim: true },

  // Verification
  gstNumber:      { type: String, trim: true },
  panNumber:      { type: String, trim: true },
  category:       { type: String, trim: true }, // e.g., Fashion, Tech, Food
  description:    { type: String, trim: true },

  // Social presence
  instagramUrl:   { type: String, trim: true },
  youtubeUrl:     { type: String, trim: true },
  linkedinUrl:    { type: String, trim: true },

  // Verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String },

  // Products flagged as illegal/scam/adult
  isBlacklisted:  { type: Boolean, default: false },
  blacklistReason:{ type: String },

  // Moderation
  verifiedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt:     { type: Date },
  adminNote:      { type: String },

  // Documents
  documents: [{
    label: String,
    url:   String,
  }],

  // Stats
  totalCampaigns: { type: Number, default: 0 },
  totalSpent:     { type: Number, default: 0 },

}, { timestamps: true });

brandSchema.index({ verificationStatus: 1 });
brandSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Brand', brandSchema);
