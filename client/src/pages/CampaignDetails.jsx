import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dot, Activity, ArrowLeft, Building2, Flame, DollarSign, Target, CheckCircle2, ShieldCheck, Users, Copy, Sparkles, MessageSquare } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';

const SCRIPT_SUGGESTIONS = {
  Telugu: `“Thakkuva followers unnaya meeku…? 😶
Kani meeku money kavala? 💸

Nijam cheptaa…
Chala mandi creators daily reels chestunnaru…
Views kuda vastunnayi…
Kani income ZERO 😞

Enduku ante…
Vallaki correct platform ledu.

Kani ippudu solution vachindi 🔥
TheViewMint ane website…

Ikkada em chestaru ante👇
Brands campaigns create chestaru
Meeru aa campaigns ni select chesukoni
Mee reel create chesi post chestaru

And best part enti ante…
Mee reel ki vachina views batti direct ga MONEY vasthundi 💰🔥

Example cheptaa👇
Oka reel ki 10,000 views vachindi anukondi
Meeru easy ga ₹500–₹1000 earn cheyyachu 💸

Mari important point👇
Followers ekkuva undali ani avasaram ledu
Mee content bagunte chalu!

Students, small creators, beginners…
Andhariki idi perfect opportunity 🚀

So ippati varaku free ga content create chesthe…
Ippudu ade content tho income start cheyandi 🔥

Ippude join avvu 👇
Link bio lo undi 🔗
TheViewMint — Mee reels ni income ga marchuko 💸🔥”`,
  Hindi: `“Aapke followers kam hain…? 😶
Lekin aapko paise kamaane hain? 💸

Sach bolu…
Bahut saare creators daily reels bana rahe hain…
Views bhi aa rahe hain…
Lekin income ZERO hai 😞

Kyun?
Kyuki unke paas sahi platform nahi hai.

Ab solution aa gaya hai 🔥
TheViewMint naam ka platform…

Yahan kya hota hai👇
Brands campaigns daalte hain
Aap un campaigns ko select karte ho
Reel banate ho aur post karte ho

Aur sabse important👇
Aapko views ke hisaab se direct PAISA milta hai 💰🔥

Example👇
Agar aapki reel pe 10,000 views aaye…
Toh aap ₹500–₹1000 easily kama sakte ho 💸

Aur sabse badi baat👇
Zyada followers ki zarurat nahi hai
Sirf content accha hona chahiye!

Students ho, beginners ho, ya small creators…
Sabke liye perfect opportunity 🚀

Ab free mein content mat banao…
Usse income banao 🔥

Abhi join karo 👇
Link bio mein hai 🔗
TheViewMint — reels se paise kamao 💸🔥”`,
  English: `“Got low followers…? 😶
But still want to make money? 💸

Let me be honest…
Thousands of creators post reels every day…
They get views…
But earn NOTHING 😞

Why?
Because they don’t have the right platform.

Now there’s a solution 🔥
It’s called TheViewMint

Here’s how it works👇
Brands create campaigns
You select a campaign
Create a reel and post it

And the best part👇
You get paid based on your views 💰🔥

For example👇
If your reel gets 10,000 views…
You can easily earn ₹500–₹1000 💸

And here’s the game-changer👇
You don’t need big followers
Good content is enough!

Whether you’re a student, beginner, or small creator…
This is a huge opportunity 🚀

So stop posting content for free…
Start earning from it 🔥

Join now 👇
Link in bio 🔗
TheViewMint — turn your reels into income 💸🔥”`
};

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState('Telugu');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/campaigns/${id}`);
        setCampaign(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SCRIPT_SUGGESTIONS[activeLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Activity className="w-12 h-12 text-primary animate-spin" /></div>;
  }

  if (!campaign) {
    return <div className="text-center pt-32"><h2 className="text-2xl font-bold">Campaign not found.</h2></div>;
  }

  const isInsta = campaign.platform === 'Instagram';

  return (
    <div className="animate-fade-in-up pb-24">
      {/* Premium Hero Banner */}
      <div className={`w-full pt-28 pb-16 md:pt-32 md:pb-24 px-4 relative overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] ${isInsta ? 'bg-gradient-to-tr from-purple-700 via-pink-600 to-orange-500' : 'bg-gradient-to-tr from-red-700 to-red-500'}`}>
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-white">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5"/> Back to directory
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-2 border border-white/30">
                {isInsta ? <FaInstagram className="w-4 h-4"/> : <FaYoutube className="w-4 h-4"/>}
                {campaign.platform}
              </span>
              <span className="bg-emerald-500/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-400/50">
                <Dot className="w-5 h-5 text-white animate-pulse" /> Live Now
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{campaign.title}</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-medium">by Premium Brand</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 md:-mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="text-primary"/> The Objective</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Rich Requirements Engine */}
            {campaign.requirements && (
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
                <div className="bg-gray-900 p-6 md:p-8 text-white">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-emerald-400"/> Campaign Guidelines</h2>
                  <p className="text-gray-400 mt-2">Strictly adhere to the following elements to secure your payout.</p>
                </div>
                
                <div className="p-6 md:p-8 space-y-10">
                  
                  {campaign.requirements.collabTarget && (
                    <div className="flex border-l-4 border-blue-500 pl-6 py-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-blue-500"/> Partner Collab</h4>
                        <p className="text-gray-600">You must invite <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold cursor-copy active:bg-blue-100 transition-colors" onClick={() => navigator.clipboard.writeText(campaign.requirements.collabTarget)}>{campaign.requirements.collabTarget}</span> as a dual-collaborator on Instagram before posting.</p>
                      </div>
                    </div>
                  )}

                  {campaign.requirements.hashtags?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Required Hashtags</h4>
                      <div className="flex flex-wrap gap-3">
                        {campaign.requirements.hashtags.map((tag, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
                            <span className="font-bold text-gray-700">{tag}</span>
                            <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-900" onClick={() => navigator.clipboard.writeText(tag)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {campaign.requirements.terms?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Terms & Regulations</h4>
                      <ul className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        {campaign.requirements.terms.map((term, i) => (
                          <li key={i} className="flex gap-3 items-start text-gray-600">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Suggested Scripts Section */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
              <div className="bg-primary/5 border-b border-primary/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2"><MessageSquare className="w-6 h-6"/> Suggested Scripts</h2>
                <p className="text-gray-600 mt-2 text-sm md:text-base">Use these proven scripts as a reference for your reel to maximize engagement and payouts.</p>
              </div>
              
              <div className="p-6 md:p-8">
                {/* Language Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(SCRIPT_SUGGESTIONS).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
                        activeLanguage === lang 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {lang === 'Telugu' ? '🇮🇳 TELUGU' : lang === 'Hindi' ? '🇮🇳 HINDI' : '🌍 ENGLISH'}
                    </button>
                  ))}
                </div>

                {/* Script Display */}
                <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{activeLanguage} SCRIPT</span>
                    <button 
                      onClick={handleCopyScript}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                      {copied ? 'Copied!' : 'Copy Script'}
                    </button>
                  </div>
                  
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 text-base md:text-lg leading-relaxed">
                    {SCRIPT_SUGGESTIONS[activeLanguage]}
                  </pre>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-primary/10">
              <h3 className="font-bold text-lg text-gray-900 mb-6 uppercase tracking-wider text-center">Reward Details</h3>
              
              <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100 mb-4">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-emerald-700 font-semibold mb-1">Pay per 1k Views</p>
                <p className="text-4xl font-black text-emerald-900">₹{(campaign.payPerView * 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Target className="w-5 h-5"/> Total Target Pool</div>
                <div className="font-bold text-gray-900">₹{campaign.budget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Building2 className="w-5 h-5"/> Brand Sponsor</div>
                <div className="font-bold text-gray-900">Premium Brand</div>
              </div>

              <Link to="/creator-dashboard" className="mt-8 w-full block text-center bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl">
                Apply in Dashboard
              </Link>
            </div>
            
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 text-center">
              <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-blue-900 mb-2">Vault Secured</h4>
              <p className="text-sm text-blue-700">The total budget is held securely in the platform vault to guarantee immediate payouts when view targets are hit.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
