const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  creator:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign:   { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  application:{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' },

  // Content
  videoLink:  { type: String, required: true, trim: true },
  uploadedFiles: [{ type: String }], // Cloudinary URLs for file uploads

  // Metrics (populated by admin or scraping)
  views:    { type: Number, default: 0 },
  likes:    { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares:   { type: Number, default: 0 },

  // Earnings
  earnings:       { type: Number, default: 0 },
  earningsCredited: { type: Boolean, default: false }, // Prevent double-credit

  // Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },

  // Admin review
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:      { type: Date },
  rejectionReason: { type: String },
  adminNote:       { type: String },

  // Payout
  payoutStatus: {
    type: String,
    enum: ['unpaid', 'processing', 'paid'],
    default: 'unpaid'
  },
  paidAt: { type: Date },

}, { timestamps: true });

// One submission per creator per campaign
submissionSchema.index({ creator: 1, campaign: 1 }, { unique: true });
submissionSchema.index({ campaign: 1, status: 1 });
submissionSchema.index({ creator: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
