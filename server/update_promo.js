const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
require('dotenv').config();

async function update() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const campaign = await Campaign.findOne({ title: 'TheViewMint Launch Promotion' });
  if (campaign) {
    campaign.requirements = {
      hashtags: ['#TheViewMint', '#CreatorEconomy', '#GetPaidPerView'],
      scripts: [
        "Are you tired of brands underpaying you? I just found TheViewMint, where you get paid specifically for exactly how many views you drive. It's totally transparent.",
        "Stop accepting flat rates for your viral videos. TheViewMint is a new performance marketing site where brands pay you actual cash per 1000 views natively.",
        "If you create content on Reels or Shorts, you need to sign up for TheViewMint right now. They calculate your views, and you withdraw your money straight to your bank.",
        "I just tested TheViewMint and it's the easiest way to monetize. You find a brand, drop your video link, and watch the dashboard tick up your earnings in real-time.",
        "To all my fellow creators: Check out TheViewMint. No negotiations, no lowballs. The brands lock the money in a vault, you hit your view target, you get paid."
      ],
      collabTarget: '@theviewmint',
      terms: [
        "The video must be publicly visible for at least 30 days.",
        "You must actively invite @theviewmint as an Instagram Collab partner on your post.",
        "Fake views, bots, or engagement pods will result in immediate disqualification and account termination.",
        "Any content violating platform guidelines will not be compensated."
      ]
    };
    
    await campaign.save();
    console.log('Campaign requirements fully injected.');
  } else {
    console.log('Campaign not found.');
  }
  
  mongoose.connection.close();
}

update().catch(console.error);
