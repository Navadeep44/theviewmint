const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  platform: { type: String, enum: ['Instagram', 'YouTube'], required: true },
  budget: { type: Number, required: true },
  payPerView: { type: Number, required: true },
  requirements: { 
    hashtags: [{ type: String }],
    scripts: [{ type: String }],
    collabTarget: { type: String },
    terms: [{ type: String }]
  },
  deadline: { type: Date },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
