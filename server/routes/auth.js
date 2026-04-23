const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, instagramHandle, youtubeChannel } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'creator',
      instagramHandle,
      youtubeChannel
    });
    await user.save();
    
    // Auto-login upon registration
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: 'Invalid phone number or password' });

    if (!user.password) {
      return res.status(400).json({ error: 'Please login with OTP and set a password in your profile, or continue using OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid phone number or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/firebase', async (req, res) => {
  try {
    const { email, name, profileImage } = req.body;
    let user = await User.findOne({ email });
    
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({ 
        name: name || 'Creator', 
        email, 
        password: hashedPassword, 
        role: 'creator',
        profileImage: profileImage || ''
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/msg91', async (req, res) => {
  try {
    const { msg91Token, name, instagramHandle, youtubeChannel, password } = req.body;
    
    const verifyUrl = 'https://api.msg91.com/api/v5/widget/verifyAccessToken';
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        "authkey": process.env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        "access-token": msg91Token
      })
    });
    
    const msg91Data = await verifyRes.json();
    console.log("MSG91 VERIFY RESPONSE:", msg91Data);
    
    if (msg91Data.type === 'error' || !msg91Data.message) {
      return res.status(400).json({ error: 'OTP Verification Failed', details: msg91Data });
    }

    const phone = msg91Data.message; 
    let user = await User.findOne({ phone });
    
    if (!user) {
      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      user = new User({ 
        name: name || 'Creator', 
        phone, 
        password: hashedPassword,
        role: 'creator',
        instagramHandle: instagramHandle || '',
        youtubeChannel: youtubeChannel || ''
      });
      await user.save();
    } else if (password && !user.password) {
      // If user logs in via OTP but provides a password (e.g. from a unified form), we can set it
      // For now, we only set password on creation.
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
