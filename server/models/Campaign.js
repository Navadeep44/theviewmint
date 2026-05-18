const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  // Brand link
  brand:        { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  brandName:    { type: String, required: true, trim: true }, // Denormalized for display

  // Core campaign data
  title:        { type: String, required: true, trim: true },
  description:  { type: String, required: true, trim: true },
  platform:     { type: String, enum: ['Instagram', 'YouTube', 'Both'], required: true },

  // Budget
  totalBudget:        { type: Number, required: true },
  creatorPayout:      { type: Number, required: true }, // Per approved submission
  platformCommission: { type: Number, required: true }, // Platform fee per submission
  payPerView:         { type: Number, default: 0 },     // Optional CPM-style payout

  // Creator targets
  creatorsNeeded:    { type: Number, default: 10 },
  creatorsApplied:   { type: Number, default: 0 },
  creatorsApproved:  { type: Number, default: 0 },

  // Requirements
  requirements: {
    hashtags:     [{ type: String }],
    scripts:      [{ type: String }],
    collabTarget: { type: String },   // Instagram collab handle
    terms:        [{ type: String }],
    guidelines:   { type: String },   // Detailed brief
    minFollowers: { type: Number, default: 0 },
    minViews:     { type: Number, default: 0 },
  },

  // Media assets from brand
  productImages:  [{ type: String }], // Cloudinary URLs
  productVideos:  [{ type: String }],

  // Timeline
  deadline:  { type: Date },
  startDate: { type: Date, default: Date.now },

  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'closed', 'rejected'],
    default: 'pending'
  },
  isPublished:     { type: Boolean, default: false },
  rejectionReason: { type: String },

  // Admin moderation
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // Category / tags for filtering
  category: { type: String, trim: true },
  tags:      [{ type: String }],

}, { timestamps: true });

campaignSchema.index({ status: 1, isPublished: 1 });
campaignSchema.index({ deadline: 1 });
campaignSchema.index({ brand: 1 });
campaignSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
