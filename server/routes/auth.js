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

router.post('/send-otp', async (req, res) => {
  try {
    let { phone } = req.body;
    
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    
    // Clean phone number
    phone = phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    if (phone.length !== 12) return res.status(400).json({ error: 'Invalid phone number format. Must be 10 digits.' });

    const authKey = process.env.MSG91_AUTH_KEY || "511174ADI1xwzb4WHr69ea1ff9P1";
    const templateId = process.env.MSG91_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
    const sendOtpUrl = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${phone}&authkey=${authKey}`;

    const response = await fetch(sendOtpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log("MSG91 SEND OTP RESPONSE:", data);

    if (data.type === 'error') {
      return res.status(400).json({ error: data.message || 'Failed to send OTP. Try again.' });
    }

    res.json({ message: 'OTP sent successfully', type: 'success' });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ error: 'Server Error while sending OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    let { phone, otp, name, instagramHandle, youtubeChannel, password } = req.body;
    
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });
    
    phone = phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const authKey = process.env.MSG91_AUTH_KEY || "511174ADI1xwzb4WHr69ea1ff9P1";
    const verifyOtpUrl = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${phone}&authkey=${authKey}`;

    const response = await fetch(verifyOtpUrl, {
      method: 'GET' // Verify OTP is a GET request as per MSG91 docs for this endpoint
    });

    const data = await response.json();
    console.log("MSG91 VERIFY OTP RESPONSE:", data);

    if (data.type === 'error') {
      let errorMessage = 'Invalid OTP';
      if (data.message === 'otp not match') errorMessage = 'Invalid OTP code';
      if (data.message === 'otp expired') errorMessage = 'OTP expired. Please try again.';
      return res.status(400).json({ error: errorMessage, details: data });
    }

    // OTP Verified Successfully
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new user
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
      // Set password if logging in via unified form
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ error: 'Server Error while verifying OTP' });
  }
});

module.exports = router;
