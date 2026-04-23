const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, default: 'creator', enum: ['creator'] },
  profileImage: { type: String },
  bio: { type: String },
  instagramHandle: { type: String },
  youtubeChannel: { type: String },
  upiId: { type: String },
  totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
