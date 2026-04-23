const mongoose = require('mongoose');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Check or create a mock Brand user
  let brand = await User.findOne({ email: 'promo@theviewmint.com' });
  if (!brand) {
    brand = new User({
      name: 'TheViewMint Promo',
      email: 'promo@theviewmint.com',
      password: 'hashed_password_mock', // not actually needed to login for this script
      role: 'brand'
    });
    await brand.save();
    console.log('Created Brand User');
  }

  // 2. Create the Campaign
  // The user wants: Promote website, 1000 views = 100 (currency), min target = 5000 views.
  // payPerView = 100 / 1000 = 0.10.
  // total budget = 5000 views minimum * 0.10 = 500
  const campaign = new Campaign({
    title: 'TheViewMint Launch Promotion',
    description: 'Help us promote our new performance marketing platform! Mention TheViewMint in your video and why creators should sign up to get paid for every view they earn. Minimum target: 5000 views.',
    brandId: brand._id,
    platform: 'Instagram',
    budget: 500, // 500 total budget covers exactly 5000 views at 0.10 per view
    payPerView: 0.10, // representing 100 units per 1000 views
    status: 'active'
  });

  await campaign.save();
  console.log('Successfully created the campaign: ' + campaign.title);
  
  mongoose.connection.close();
}

seed().catch(console.error);
