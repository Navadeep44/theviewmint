const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Submit reel/short link
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can submit to campaigns' });
    }
    const { campaignId, videoLink } = req.body;
    
    const existing = await Submission.findOne({ creatorId: req.user.id, campaignId });
    if (existing) return res.status(400).json({ error: 'Already submitted for this campaign' });

    const submission = new Submission({
      creatorId: req.user.id,
      campaignId,
      videoLink
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get submissions for a creator
router.get('/creator/:creatorId', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ creatorId: req.params.creatorId }).populate('campaignId');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update submission views/earnings (Mock API or manual)
router.put('/:id', async (req, res) => {
  try {
    const { views, status } = req.body;
    const submission = await Submission.findById(req.params.id).populate('campaignId');
    
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    if (views !== undefined) {
      submission.views = views;
      submission.earnings = views * submission.campaignId.payPerView;
    }
    if (status !== undefined) submission.status = status;

    await submission.save();

    // Update user earnings if newly approved with earnings
    if (status === 'approved' && submission.earnings > 0) {
      const user = await User.findById(submission.creatorId);
      user.totalEarnings += submission.earnings;
      await user.save();
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get submissions for a campaign (Admin use)
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    const submissions = await Submission.find({ campaignId: req.params.campaignId }).populate('creatorId', 'name email profileImage instagramHandle youtubeChannel');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
