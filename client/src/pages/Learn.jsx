import { useState } from 'react';
import { BookOpen, HelpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function Learn() {
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    {
      title: "Getting Started Guide",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      articles: [
        { q: "What is TheViewMint?", a: "TheViewMint is a platform where brands ask for videos, and creators get paid based exactly on how many views their videos get." },
        { q: "Setting up your Creator Profile", a: "Click 'Sign Up', pick the Creator option, and follow the simple steps. Make sure to share your social links!" },
        { q: "How Brands fund campaigns", a: "Brands put money into a total budget pot. They decide the price for 1,000 views, and creators are paid from this pot as people watch." },
        { q: "Connecting your social accounts", a: "Right now, you just paste the link to your finished video into the dashboard. We use that link to track your views automatically." }
      ]
    },
    {
      title: "Payments & Earnings",
      icon: <DollarSignIcon />, 
      articles: [
        { q: "How Pay-Per-View calculation works", a: "If a campaign pays $5 per 1,000 views, and your video hits 10,000 views, you earn $50 straight away." },
        { q: "Withdrawal methods & timelines", a: "You can send your earned money to your bank anytime from the Earnings tab. Transfers take 2 to 3 days." },
        { q: "Tax information for creators", a: "You are responsible for your own taxes. We provide a simple dashboard summary so you know exactly what you earned all year." },
        { q: "Currency conversions", a: "All campaigns use US Dollars ($). If you live outside the US, your bank will automatically convert it when you withdraw." }
      ]
    },
    {
      title: "Content Guidelines",
      icon: <FileText className="w-6 h-6 text-primary" />,
      articles: [
        { q: "Quality standards for approval", a: "Brands want nice videos. Ensure your lighting is bright, your voice is clear, and you actually talk about the product nicely." },
        { q: "Platform-specific rules", a: "For Instagram Reels and YouTube Shorts, hold your phone UP (vertical). If the brand asks for YouTube, film it wide (horizontal)." },
        { q: "What to do if rejected", a: "Don't panic! If a brand rejects your video, they will leave a note. You can fix the video and re-submit it to get approved." },
        { q: "Copyright and music usage", a: "Please use free trending sounds from Instagram or YouTube. Avoid using weird copyrighted songs that might get your video taken down." }
      ]
    },
    {
      title: "Brand Best Practices",
      icon: <HelpCircle className="w-6 h-6 text-primary" />,
      articles: [
        { q: "How to set a competitive Pay-Per-View rate", a: "Look at what other brands are paying. Offering a bit more money gets you the biggest creators and the fastest views." },
        { q: "Writing clear requirements", a: "Be very simple! Tell the creator exactly what hashtags to use and one special point to mention about your product." },
        { q: "Reviewing submissions effectively", a: "When a creator submits a video, click the link to watch it. If it follows your simple rules, hit Approve and let them post it!" },
        { q: "Scaling your campaigns", a: "If a campaign does really well and gets millions of views, create a new one with a bigger budget to keep the hype going." }
      ]
    }
  ];

  const getGlobalIndex = (catIndex, artIndex) => {
    return `${catIndex}-${artIndex}`;
  };

  const toggleQuestion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="bg-white rounded-3xl p-12 md:p-20 text-center border border-gray-100 shadow-sm mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Help & Learning Center</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Everything you need to know written in simple English. No confusing big words!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                {cat.icon}
              </div>
              <h2 className="text-2xl font-bold">{cat.title}</h2>
            </div>
            
            <div className="space-y-4">
              {cat.articles.map((art, artIdx) => {
                const globalIndex = getGlobalIndex(catIdx, artIdx);
                const isOpen = openIndex === globalIndex;
                
                return (
                  <div key={artIdx} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                    <button 
                      onClick={() => toggleQuestion(globalIndex)}
                      className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className={`font-medium ${isOpen ? 'text-primary' : 'text-gray-700'}`}>
                        {art.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-5 bg-white border-t border-gray-100 text-gray-600 leading-relaxed animate-fade-in-overlay">
                        {art.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary text-white p-12 rounded-3xl text-center shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Our support team is available 24/7 to help you resolve any issues with your campaigns or payouts.</p>
        <a href="mailto:supportteam@theviewmint.in" className="inline-block bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
          Contact Support
        </a>
      </div>
    </div>
  );
}

function DollarSignIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
