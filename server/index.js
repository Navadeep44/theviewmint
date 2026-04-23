require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaign');
const submissionRoutes = require('./routes/submission');
const userRoutes = require('./routes/user');
const User = require('./models/User');
const Campaign = require('./models/Campaign');

const app = express();

app.use(cors());
app.use(express.json());

// Standard Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);

// Fallback Routes (Handles incorrect VITE_API_URL on Render missing /api)
app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/submissions', submissionRoutes);
app.use('/users', userRoutes);

app.get('/api/stats', async (req, res) => {
  try {
    const creatorCount = await User.countDocuments({ role: 'creator' });
    const campaignCount = await Campaign.countDocuments();
    res.json({ creators: creatorCount, brands: 50, campaigns: campaignCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
