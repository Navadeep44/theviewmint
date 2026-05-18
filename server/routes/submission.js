const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { auth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/submissions
 * Creator submits content for an approved application
 */
router.post('/', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'creator') {
    return res.status(403).json({ error: 'Only creators can submit content.' });
  }

  const { campaignId, videoLink, uploadedFiles } = req.body;

  if (!campaignId || !videoLink) {
    return res.status(400).json({ error: 'Campaign ID and video link are required.' });
  }

  // Check application is approved
  const application = await Application.findOne({
    creator: req.user.id,
    campaign: campaignId,
  });

  if (!application) {
    return res.status(400).json({ error: 'You must apply to this campaign before submitting.' });
  }

  // Prevent duplicate submissions
  const existing = await Submission.findOne({ creator: req.user.id, campaign: campaignId });
  if (existing) {
    return res.status(400).json({ error: 'You have already submitted content for this campaign.' });
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

  const submission = new Submission({
    creator: req.user.id,
    campaign: campaignId,
    application: application._id,
    videoLink,
    uploadedFiles: uploadedFiles || [],
    status: 'pending',
  });

  await submission.save();

  // Notify creator
  await Notification.create({
    recipient: req.user.id,
    type: 'general',
    title: 'Content Submitted',
    message: `Your submission for "${campaign.title}" is now under review. We'll notify you once reviewed.`,
    refType: 'Submission',
    refId: submission._id,
  });

  // Emit socket
  const io = req.app.get('io');
  if (io) io.emit('new_submission', { campaignId, creatorId: req.user.id });

  res.status(201).json({ submission, message: 'Submission received. Under review.' });
}));

/**
 * GET /api/submissions/my
 * Get all submissions for the authenticated creator
 */
router.get('/my', auth, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { creator: req.user.id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate('campaign', 'title platform brandName deadline creatorPayout')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Submission.countDocuments(filter),
  ]);

  res.json({ submissions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
}));

/**
 * GET /api/submissions/creator/:creatorId
 * Legacy route — kept for backward compatibility
 */
router.get('/creator/:creatorId', auth, asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ creator: req.params.creatorId })
    .populate('campaign', 'title platform brandName creatorPayout deadline')
    .sort({ createdAt: -1 });
  res.json(submissions);
}));

/**
 * GET /api/submissions/campaign/:campaignId
 * Get all submissions for a campaign (Admin)
 */
router.get('/campaign/:campaignId', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { campaign: req.params.campaignId };
  if (status) filter.status = status;

  const submissions = await Submission.find(filter)
    .populate('creator', 'name username phone profileImage instagramHandle youtubeChannel')
    .populate('campaign', 'title platform creatorPayout')
    .sort({ createdAt: -1 });

  res.json(submissions);
}));

/**
 * PUT /api/submissions/:id/review
 * Admin: Approve or reject a submission
 * This fixes the original bug of double-counting earnings
 */
router.put('/:id/review', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { status, views, likes, comments, shares, rejectionReason, adminNote } = req.body;

  if (!['approved', 'rejected', 'under_review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const submission = await Submission.findById(req.params.id).populate('campaign');
  if (!submission) return res.status(404).json({ error: 'Submission not found.' });

  // Update metrics
  if (views !== undefined) submission.views = views;
  if (likes !== undefined) submission.likes = likes;
  if (comments !== undefined) submission.comments = comments;
  if (shares !== undefined) submission.shares = shares;

  const previousStatus = submission.status;
  submission.status = status;
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = new Date();
  if (rejectionReason) submission.rejectionReason = rejectionReason;
  if (adminNote) submission.adminNote = adminNote;

  // ─── EARNINGS LOGIC (BUG FIX: Only credit once) ──────────────────────────
  if (status === 'approved' && !submission.earningsCredited) {
    const campaign = submission.campaign;
    let earnings = 0;

    if (campaign.creatorPayout > 0) {
      earnings = campaign.creatorPayout;
    } else if (campaign.payPerView > 0 && submission.views > 0) {
      earnings = submission.views * campaign.payPerView;
    }

    submission.earnings = earnings;
    submission.earningsCredited = true;
    submission.payoutStatus = 'unpaid';

    // Credit user wallet
    await User.findByIdAndUpdate(submission.creator, {
      $inc: {
        totalEarnings: earnings,
        withdrawableAmount: earnings,
        approvedSubmissions: 1,
      }
    });

    // Create earning transaction record
    await Transaction.create({
      creator: submission.creator,
      submission: submission._id,
      campaign: submission.campaign._id,
      type: 'earning',
      amount: earnings,
      status: 'completed',
      description: `Earnings from campaign: ${campaign.title}`,
    });

    // Update campaign approved count
    await Campaign.findByIdAndUpdate(submission.campaign._id, {
      $inc: { creatorsApproved: 1 }
    });
  }

  if (status === 'rejected' && previousStatus !== 'rejected') {
    await User.findByIdAndUpdate(submission.creator, {
      $inc: { rejectedSubmissions: 1 }
    });
  }

  await submission.save();

  // ─── Recalculate performance score ───────────────────────────────────────
  const userStats = await Submission.aggregate([
    { $match: { creator: submission.creator } },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
    }}
  ]);

  if (userStats.length > 0) {
    const { total, approved } = userStats[0];
    const score = total > 0 ? Math.round((approved / total) * 100) : 0;
    await User.findByIdAndUpdate(submission.creator, { performanceScore: score });
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  const notifData = {
    recipient: submission.creator,
    refType: 'Submission',
    refId: submission._id,
  };

  if (status === 'approved') {
    await Notification.create({
      ...notifData,
      type: 'submission_approved',
      title: '🎉 Submission Approved!',
      message: `Your content for "${submission.campaign.title}" was approved. Earnings of ₹${submission.earnings} have been added to your wallet.`,
    });
  } else if (status === 'rejected') {
    await Notification.create({
      ...notifData,
      type: 'submission_rejected',
      title: 'Submission Rejected',
      message: `Your content for "${submission.campaign.title}" was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please review guidelines and try again.'}`,
    });
  }

  // ─── Socket emit ─────────────────────────────────────────────────────────
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${submission.creator}`).emit('submission_updated', {
      submissionId: submission._id,
      status,
      earnings: submission.earnings,
    });
    io.emit('admin_stats_updated');
  }

  res.json({ submission, message: `Submission ${status}.` });
}));

/**
 * GET /api/submissions/:id
 * Get single submission
 */
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('creator', 'name username profileImage')
    .populate('campaign', 'title platform brandName creatorPayout');

  if (!submission) return res.status(404).json({ error: 'Submission not found.' });

  // Only allow creator or admin to view
  if (req.user.role === 'creator' && submission.creator._id.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  res.json(submission);
}));

module.exports = router;
