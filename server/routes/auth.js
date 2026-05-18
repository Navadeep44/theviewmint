const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const OTPLog = require('../models/OTPLog');
const { asyncHandler } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');

// ─── Rate Limiters ────────────────────────────────────────────────────────────

const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { error: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

const cleanPhone = (phone) => {
  let p = String(phone).replace(/\D/g, '');
  if (p.length === 10) p = '91' + p;
  return p;
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Full OTP-verified registration with username + password
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { name, phone, password, username, upiId, instagramHandle, youtubeChannel } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanedPhone = cleanPhone(phone);

  // Duplicate checks
  const existingPhone = await User.findOne({ phone: cleanedPhone });
  if (existingPhone) return res.status(400).json({ error: 'Phone number already registered.' });

  if (username) {
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) return res.status(400).json({ error: 'Username already taken.' });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    phone: cleanedPhone,
    username: username ? username.toLowerCase() : undefined,
    password: hashedPassword,
    upiId: upiId || '',
    instagramHandle: instagramHandle || '',
    youtubeChannel: youtubeChannel || '',
    isPhoneVerified: true, // OTP was already verified in send-otp flow
    role: 'creator',
  });

  await user.save();

  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.status(201).json({
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    }
  });
}));

/**
 * POST /api/auth/login
 * Login with phone + password OR username + password
 */
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { phone, username, password } = req.body;

  if (!password) return res.status(400).json({ error: 'Password is required.' });
  if (!phone && !username) return res.status(400).json({ error: 'Phone number or username is required.' });

  let user;
  if (phone) {
    const cleanedPhone = cleanPhone(phone);
    user = await User.findOne({ phone: cleanedPhone });
  } else {
    user = await User.findOne({ username: username.toLowerCase() });
  }

  if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

  if (user.status === 'banned') {
    return res.status(403).json({ error: 'Your account has been banned. Contact support.' });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account is suspended. Contact support.' });
  }

  if (!user.password) {
    return res.status(400).json({ error: 'No password set. Please login with OTP or Google.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token (limit to 5 devices)
  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push(refreshToken);
  user.lastActive = new Date();
  await user.save();

  res.json({
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      upiId: user.upiId,
    }
  });
}));

/**
 * POST /api/auth/refresh
 * Exchange refresh token for new access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required.' });

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    return res.status(401).json({ error: 'Refresh token revoked.' });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.json({ token: accessToken, refreshToken: newRefreshToken });
}));

/**
 * POST /api/auth/logout
 * Logout current device (revoke one refresh token)
 */
router.post('/logout', auth, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findById(req.user.id);
  if (user && refreshToken) {
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await user.save();
  }
  res.json({ message: 'Logged out successfully.' });
}));

/**
 * POST /api/auth/logout-all
 * Logout from all devices (revoke all refresh tokens)
 */
router.post('/logout-all', auth, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshTokens: [] });
  res.json({ message: 'Logged out from all devices.' });
}));

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshTokens');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
}));

/**
 * POST /api/auth/firebase
 * Google/Firebase OAuth login or register
 */
router.post('/firebase', asyncHandler(async (req, res) => {
  const { email, name, profileImage, firebaseUid } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name: name || 'Creator',
      email,
      profileImage: profileImage || '',
      firebaseUid: firebaseUid || undefined,
      role: 'creator',
      isEmailVerified: true,
    });
    await user.save();
  } else {
    // Update profile image if not set
    if (profileImage && !user.profileImage) {
      user.profileImage = profileImage;
      await user.save();
    }
  }

  if (user.status === 'banned') {
    return res.status(403).json({ error: 'Your account has been banned.' });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push(refreshToken);
  user.lastActive = new Date();
  await user.save();

  res.json({
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    }
  });
}));

/**
 * POST /api/auth/send-otp
 * Send OTP via MSG91
 */
router.post('/send-otp', otpSendLimiter, asyncHandler(async (req, res) => {
  let { phone, purpose } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });

  const cleanedPhone = cleanPhone(phone);
  if (cleanedPhone.length !== 12) {
    return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits (Indian number).' });
  }

  // Check for existing user when purpose is 'register'
  if (purpose === 'register') {
    const existing = await User.findOne({ phone: cleanedPhone });
    if (existing) return res.status(400).json({ error: 'Phone number already registered. Please login.' });
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  const sendOtpUrl = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanedPhone}&authkey=${authKey}`;

  const response = await fetch(sendOtpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();

  // Log OTP send attempt
  await OTPLog.create({
    phone: cleanedPhone,
    purpose: purpose || 'register',
    status: data.type === 'success' ? 'sent' : 'failed',
    ipAddress: req.ip,
    msg91RequestId: data.request_id,
  });

  if (data.type === 'error') {
    return res.status(400).json({ error: data.message || 'Failed to send OTP. Try again.' });
  }

  res.json({ message: 'OTP sent successfully.', type: 'success' });
}));

/**
 * POST /api/auth/verify-otp
 * Verify OTP and auto-create account if needed
 */
router.post('/verify-otp', asyncHandler(async (req, res) => {
  let { phone, otp, name, instagramHandle, youtubeChannel, password, username, upiId, purpose } = req.body;

  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required.' });

  const cleanedPhone = cleanPhone(phone);

  const authKey = process.env.MSG91_AUTH_KEY;
  const verifyOtpUrl = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${cleanedPhone}&authkey=${authKey}`;

  const response = await fetch(verifyOtpUrl, { method: 'GET' });
  const data = await response.json();

  if (data.type === 'error') {
    let errorMessage = 'Invalid OTP. Please try again.';
    if (data.message === 'otp not match') errorMessage = 'Incorrect OTP code.';
    if (data.message === 'otp expired') errorMessage = 'OTP expired. Please request a new one.';
    return res.status(400).json({ error: errorMessage });
  }

  // OTP verified — find or create user
  let user = await User.findOne({ phone: cleanedPhone });

  if (!user) {
    if (!name) return res.status(400).json({ error: 'Name is required for registration.' });

    let hashedPassword = null;
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername) return res.status(400).json({ error: 'Username already taken.' });
    }

    user = new User({
      name,
      phone: cleanedPhone,
      username: username ? username.toLowerCase() : undefined,
      password: hashedPassword,
      upiId: upiId || '',
      instagramHandle: instagramHandle || '',
      youtubeChannel: youtubeChannel || '',
      role: 'creator',
      isPhoneVerified: true,
    });
    await user.save();
  } else {
    // Existing user — OTP login
    user.isPhoneVerified = true;
    if (password && !user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
  }

  if (user.status === 'banned') {
    return res.status(403).json({ error: 'Your account has been banned. Contact support.' });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push(refreshToken);
  user.lastActive = new Date();
  await user.save();

  // Update OTP log
  await OTPLog.findOneAndUpdate(
    { phone: cleanedPhone, status: 'sent' },
    { status: 'verified' },
    { sort: { createdAt: -1 } }
  );

  res.json({
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      upiId: user.upiId,
    }
  });
}));

/**
 * POST /api/auth/change-password
 * Change password (requires current password or OTP)
 */
router.post('/change-password', auth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (user.password) {
    if (!currentPassword) return res.status(400).json({ error: 'Current password is required.' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  user.refreshTokens = []; // Revoke all sessions on password change
  await user.save();

  res.json({ message: 'Password changed successfully. Please login again.' });
}));

module.exports = router;
