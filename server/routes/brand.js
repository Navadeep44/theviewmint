const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const { asyncHandler } = require('../middleware/errorHandler');
const { auth, requireAdmin } = require('../middleware/auth');

// ─── Blacklisted categories (auto-reject) ─────────────────────────────────────
const BLACKLISTED_CATEGORIES = [
  'gambling', 'casino', 'betting', 'adult', 'pornography', 'crypto scam',
  'ponzi', 'mlm', 'pyramid scheme', 'illegal', 'drugs', 'weapons',
  'tobacco', 'alcohol', 'loan shark', 'fake medicine',
];

const isBlacklistedCategory = (category = '', description = '') => {
  const text = `${category} ${description}`.toLowerCase();
  return BLACKLISTED_CATEGORIES.some(bad => text.includes(bad));
};

/**
 * POST /api/brands/register
 * Public: Brand submits registration (goes to pending)
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { companyName, contactName, email, phone, website, gstNumber, panNumber,
    category, description, instagramUrl, youtubeUrl, linkedinUrl } = req.body;

  if (!companyName || !contactName || !email) {
    return res.status(400).json({ error: 'Company name, contact name, and email are required.' });
  }

  // Auto-blacklist check
  if (isBlacklistedCategory(category, description)) {
    return res.status(400).json({
      error: 'Your brand/product category is not eligible for campaigns on TheViewMint. We do not allow gambling, adult content, illegal products, or similar categories.'
    });
  }

  const existing = await Brand.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ error: 'A brand with this email already exists.' });

  const brand = new Brand({
    companyName, contactName, email: email.toLowerCase(),
    phone, website, gstNumber, panNumber,
    category, description,
    instagramUrl, youtubeUrl, linkedinUrl,
  });

  await brand.save();

  res.status(201).json({
    brand: { _id: brand._id, companyName: brand.companyName, verificationStatus: brand.verificationStatus },
    message: 'Brand registration submitted. Our team will review and contact you within 2-3 business days.'
  });
}));

/**
 * GET /api/brands
 * Admin: Get all brands with filters
 */
router.get('/', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.verificationStatus = status;
  if (search) filter.$or = [
    { companyName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [brands, total] = await Promise.all([
    Brand.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Brand.countDocuments(filter),
  ]);

  res.json({ brands, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
}));

/**
 * GET /api/brands/:id
 * Admin: Get single brand details
 */
router.get('/:id', auth, requireAdmin, asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id).populate('verifiedBy', 'name');
  if (!brand) return res.status(404).json({ error: 'Brand not found.' });
  res.json(brand);
}));

/**
 * PUT /api/brands/:id/verify
 * Admin: Approve or reject a brand
 */
router.put('/:id/verify', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { status, rejectionReason, adminNote, isBlacklisted, blacklistReason } = req.body;

  if (!['approved', 'rejected', 'under_review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        verificationStatus: status,
        rejectionReason: rejectionReason || '',
        adminNote: adminNote || '',
        isBlacklisted: isBlacklisted || false,
        blacklistReason: blacklistReason || '',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
      }
    },
    { new: true }
  );

  if (!brand) return res.status(404).json({ error: 'Brand not found.' });

  // Log admin action
  const AdminLog = require('../models/AdminLog');
  await AdminLog.create({
    admin: req.user.id,
    action: `brand_${status}`,
    target: 'Brand',
    targetId: brand._id,
    details: `Brand "${brand.companyName}" ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
    ipAddress: req.ip,
  });

  const io = req.app.get('io');
  if (io) io.emit('brand_verified', { brandId: brand._id, status });

  res.json({ brand, message: `Brand ${status}.` });
}));

module.exports = router;
