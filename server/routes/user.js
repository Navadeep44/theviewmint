const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users/profile
 * Get authenticated user's full profile
 */
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshTokens');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
}));

/**
 * PUT /api/users/profile
 * Update profile fields (name, bio, socials, upiId, profileImage)
 */
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const {
    name, bio, instagramHandle, youtubeChannel,
    twitterHandle, tiktokHandle, upiId, profileImage, username
  } = req.body;

  // Username uniqueness check if changing
  if (username) {
    const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user.id } });
    if (existing) return res.status(400).json({ error: 'Username already taken.' });
  }

  const updates = {};
  if (name !== undefined)            updates.name = name;
  if (bio !== undefined)             updates.bio = bio;
  if (instagramHandle !== undefined) updates.instagramHandle = instagramHandle;
  if (youtubeChannel !== undefined)  updates.youtubeChannel = youtubeChannel;
  if (twitterHandle !== undefined)   updates.twitterHandle = twitterHandle;
  if (tiktokHandle !== undefined)    updates.tiktokHandle = tiktokHandle;
  if (upiId !== undefined)           updates.upiId = upiId;
  if (profileImage !== undefined)    updates.profileImage = profileImage;
  if (username !== undefined)        updates.username = username.toLowerCase();

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json(user);
}));

/**
 * GET /api/users/dashboard-stats
 * Get creator dashboard stats (submissions, earnings breakdown)
 */
router.get('/dashboard-stats', auth, asyncHandler(async (req, res) => {
  const Submission = require('../models/Submission');
  const Application = require('../models/Application');

  const userId = req.user.id;

  const [submissions, applications, user] = await Promise.all([
    Submission.find({ creator: userId }).populate('campaign', 'title platform brandName deadline'),
    Application.find({ creator: userId }).populate('campaign', 'title status'),
    User.findById(userId).select('totalEarnings withdrawableAmount totalWithdrawn performanceScore totalCampaigns'),
  ]);

  const stats = {
    totalSubmissions:     submissions.length,
    pendingSubmissions:   submissions.filter(s => s.status === 'pending').length,
    approvedSubmissions:  submissions.filter(s => s.status === 'approved').length,
    rejectedSubmissions:  submissions.filter(s => s.status === 'rejected').length,
    underReviewSubmissions: submissions.filter(s => s.status === 'under_review').length,
    totalViews:           submissions.reduce((a, s) => a + (s.views || 0), 0),
    totalEarnings:        submissions.reduce((a, s) => a + (s.earnings || 0), 0),
    totalApplications:    applications.length,
    activeApplications:   applications.filter(a => a.status === 'approved').length,
    withdrawableAmount:   user?.withdrawableAmount || 0,
    totalWithdrawn:       user?.totalWithdrawn || 0,
    performanceScore:     user?.performanceScore || 0,
  };

  res.json({ stats, submissions, applications });
}));

module.exports = router;
