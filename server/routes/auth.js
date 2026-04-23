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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
      // Create user if they don't exist
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
    const { msg91Token, name, instagramHandle, youtubeChannel } = req.body;
    
    // Verify MSG91 Token
    const verifyUrl = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        "authkey": process.env.MSG91_AUTH_KEY,
        "access-token": msg91Token
      })
    });
    
    const msg91Data = await verifyRes.json();
    
    if (msg91Data.type === 'error' || !msg91Data.message) {
      return res.status(400).json({ error: 'OTP Verification Failed', details: msg91Data });
    }

    // MSG91 returns the mobile number upon successful verification
    const phone = msg91Data.message; 
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create user if they don't exist
      user = new User({ 
        name: name || 'Creator', 
        phone, 
        role: 'creator',
        instagramHandle: instagramHandle || '',
        youtubeChannel: youtubeChannel || ''
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
