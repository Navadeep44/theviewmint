const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const { auth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/campaigns
 * Get all published active campaigns (public)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { platform, category, search, page = 1, limit = 20 } = req.query;

  const filter = { isPublished: true, status: 'active' };
  if (platform) filter.platform = platform;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { brandName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'),
    Campaign.countDocuments(filter),
  ]);

  res.json({
    campaigns,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    }
  });
}));

/**
 * GET /api/campaigns/:id
 * Get single campaign details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

  // Check if user has already applied (if logged in)
  let hasApplied = false;
  let applicationStatus = null;
  const authHeader = req.header('Authorization');
  if (authHeader) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET);
      const app = await Application.findOne({ creator: decoded.id, campaign: campaign._id });
      if (app) {
        hasApplied = true;
        applicationStatus = app.status;
      }
    } catch {}
  }

  res.json({ campaign, hasApplied, applicationStatus });
}));

/**
 * POST /api/campaigns
 * Create campaign (Admin only — brands submit via brand routes)
 */
router.post('/', auth, requireAdmin, asyncHandler(async (req, res) => {
  const campaign = new Campaign({ ...req.body });
  await campaign.save();

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) io.emit('new_campaign', { campaign });

  res.status(201).json(campaign);
}));

/**
 * PUT /api/campaigns/:id
 * Update campaign (Admin only)
 */
router.put('/:id', auth, requireAdmin, asyncHandler(async (req, res) => {
  const campaign = await Campaign.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

  const io = req.app.get('io');
  if (io) io.emit('campaign_updated', { campaign });

  res.json(campaign);
}));

/**
 * DELETE /api/campaigns/:id
 * Delete campaign (Admin only)
 */
router.delete('/:id', auth, requireAdmin, asyncHandler(async (req, res) => {
  const campaign = await Campaign.findByIdAndDelete(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
  res.json({ message: 'Campaign deleted.' });
}));

// ─── Creator Campaign Actions ─────────────────────────────────────────────────

/**
 * POST /api/campaigns/:id/apply
 * Creator applies to a campaign
 */
router.post('/:id/apply', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'creator') {
    return res.status(403).json({ error: 'Only creators can apply to campaigns.' });
  }

  const campaign = await Campaign.findById(req.params.id);
  if (!campaign || !campaign.isPublished || campaign.status !== 'active') {
    return res.status(404).json({ error: 'Campaign not found or not active.' });
  }

  // Check if deadline passed
  if (campaign.deadline && new Date() > new Date(campaign.deadline)) {
    return res.status(400).json({ error: 'Campaign deadline has passed.' });
  }

  // Check if already applied
  const existing = await Application.findOne({ creator: req.user.id, campaign: campaign._id });
  if (existing) {
    return res.status(400).json({ error: 'You have already applied to this campaign.' });
  }

  const { termsAccepted, note } = req.body;
  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the campaign terms to apply.' });
  }

  const application = new Application({
    creator: req.user.id,
    campaign: campaign._id,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
    note: note || '',
    status: 'applied',
  });

  await application.save();

  // Increment campaign counter
  await Campaign.findByIdAndUpdate(campaign._id, { $inc: { creatorsApplied: 1 } });

  // Create notification for creator
  const Notification = require('../models/Notification');
  await Notification.create({
    recipient: req.user.id,
    type: 'general',
    title: 'Application Submitted',
    message: `Your application for "${campaign.title}" has been submitted and is under review.`,
    refType: 'Campaign',
    refId: campaign._id,
  });

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('campaign_stats_updated', { campaignId: campaign._id });
  }

  res.status(201).json({ application, message: 'Application submitted successfully.' });
}));

module.exports = router;
