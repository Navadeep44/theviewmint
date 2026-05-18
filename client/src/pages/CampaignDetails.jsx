import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Dot, Activity, ArrowLeft, Building2, Flame, DollarSign, Target, CheckCircle2, ShieldCheck, Users, Copy, Sparkles, MessageSquare, AlertCircle, Video, Upload, Link as LinkIcon } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SCRIPT_SUGGESTIONS = {
  Telugu: `“Thakkuva followers unnaya meeku…? 😶\nKani meeku money kavala? 💸\n\nNijam cheptaa…\nChala mandi creators daily reels chestunnaru…\nViews kuda vastunnayi…\nKani income ZERO 😞\n\nEnduku ante…\nVallaki correct platform ledu.\n\nKani ippudu solution vachindi 🔥\nTheViewMint ane website…\n\nIkkada em chestaru ante👇\nBrands campaigns create chestaru\nMeeru aa campaigns ni select chesukoni\nMee reel create chesi post chestaru\n\nAnd best part enti ante…\nMee reel ki vachina views batti direct ga MONEY vasthundi 💰🔥\n\nExample cheptaa👇\nOka reel ki 10,000 views vachindi anukondi\nMeeru easy ga ₹500–₹1000 earn cheyyachu 💸\n\nMari important point👇\nFollowers ekkuva undali ani avasaram ledu\nMee content bagunte chalu!\n\nStudents, small creators, beginners…\nAndhariki idi perfect opportunity 🚀\n\nSo ippati varaku free ga content create chesthe…\nIppudu ade content tho income start cheyandi 🔥\n\nIppude join avvu 👇\nLink bio lo undi 🔗\nTheViewMint — Mee reels ni income ga marchuko 💸🔥”`,
  Hindi: `“Aapke followers kam hain…? 😶\nLekin aapko paise kamaane hain? 💸\n\nSach bolu…\nBahut saare creators daily reels bana rahe hain…\nViews bhi aa rahe hain…\nLekin income ZERO hai 😞\n\nKyuki unke paas sahi platform nahi hai.\n\nAb solution aa gaya hai 🔥\nTheViewMint naam ka platform…\n\nYahan kya hota hai👇\nBrands campaigns daalte hain\nAap un campaigns ko select karte ho\nReel banate ho aur post karte ho\n\nAur sabse important👇\nAapko views ke hisaab se direct PAISA milta hai 💰🔥\n\nExample👇\nAgar aapki reel pe 10,000 views aaye…\nToh aap ₹500–₹1000 easily kama sakte ho 💸\n\nAur sabse badi baat👇\nZyada followers ki zarurat nahi hai\nSirf content accha hona chahiye!\n\nStudents ho, beginners ho, ya small creators…\nSabke liye perfect opportunity 🚀\n\nAb free mein content mat banao…\nUsse income banao 🔥\n\nAbhi join karo 👇\nLink bio mein hai 🔗\nTheViewMint — reels se paise kamao 💸🔥”`,
  English: `“Got low followers…? 😶\nBut still want to make money? 💸\n\nLet me be honest…\nThousands of creators post reels every day…\nThey get views…\nBut earn NOTHING 😞\n\nBecause they don’t have the right platform.\n\nNow there’s a solution 🔥\nIt’s called TheViewMint\n\nHere’s how it works👇\nBrands create campaigns\nYou select a campaign\nCreate a reel and post it\n\nAnd the best part👇\nYou get paid based on your views 💰🔥\n\nFor example👇\nIf your reel gets 10,000 views…\nYou can easily earn ₹500–₹1000 💸\n\nAnd here’s the game-changer👇\nYou don’t need big followers\nGood content is enough!\n\nWhether you’re a student, beginner, or small creator…\nThis is a huge opportunity 🚀\n\nSo stop posting content for free…\nStart earning from it 🔥\n\nJoin now 👇\nLink in bio 🔗\nTheViewMint — turn your reels into income 💸🔥”`
};

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Application State
  const [applying, setApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [note, setNote] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [videoLink, setVideoLink] = useState('');
  
  // Script State
  const [activeLanguage, setActiveLanguage] = useState('Telugu');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await api.get(`/campaigns/${id}`);
        setCampaign(res.data.campaign);
        setHasApplied(res.data.hasApplied);
        setApplicationStatus(res.data.applicationStatus);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load campaign details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('You must accept the terms to apply.');
      return;
    }
    setApplying(true);
    try {
      await api.post(`/campaigns/${id}/apply`, { termsAccepted, note });
      toast.success('Application submitted successfully! 🚀');
      setHasApplied(true);
      setApplicationStatus('applied');
      setApplyModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const handleSubmitContent = async (e) => {
    e.preventDefault();
    if (!videoLink) {
      toast.error('Please provide a video link.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/submissions', { campaignId: id, videoLink });
      toast.success('Content submitted successfully for review!');
      navigate('/creator-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit content.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SCRIPT_SUGGESTIONS[activeLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Activity className="w-12 h-12 text-violet-600 animate-spin" /></div>;
  }

  if (!campaign) {
    return <div className="text-center pt-32"><h2 className="text-2xl font-bold">Campaign not found.</h2></div>;
  }

  const isInsta = campaign.platform === 'Instagram';
  const deadlinePassed = campaign.deadline && new Date(campaign.deadline) < new Date();

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
              {!deadlinePassed ? (
                <span className="bg-emerald-500/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-400/50">
                  <Dot className="w-5 h-5 text-white animate-pulse" /> Live Now
                </span>
              ) : (
                <span className="bg-red-500/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-1 border border-red-400/50">
                  <AlertCircle className="w-4 h-4 text-white" /> Closed
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{campaign.title}</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-medium">by {campaign.brandName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 md:-mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="text-violet-600"/> The Objective</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Campaign Guidelines */}
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
                        <p className="text-gray-600">You must invite <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold cursor-pointer active:bg-blue-100 transition-colors" onClick={() => {navigator.clipboard.writeText(campaign.requirements.collabTarget); toast.success('Collab target copied!')}}>{campaign.requirements.collabTarget}</span> as a dual-collaborator on Instagram before posting.</p>
                      </div>
                    </div>
                  )}

                  {campaign.requirements.hashtags?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Required Hashtags</h4>
                      <div className="flex flex-wrap gap-3">
                        {campaign.requirements.hashtags.map((tag, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100" onClick={() => {navigator.clipboard.writeText(tag); toast.success('Hashtag copied!')}}>
                            <span className="font-bold text-gray-700">{tag}</span>
                            <Copy className="w-3 h-3 text-gray-400" />
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
              <div className="bg-violet-50 border-b border-violet-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-violet-700 flex items-center gap-2"><MessageSquare className="w-6 h-6"/> Suggested Scripts</h2>
                <p className="text-violet-600 mt-2 text-sm md:text-base">Use these proven scripts as a reference for your reel to maximize engagement and payouts.</p>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {Object.keys(SCRIPT_SUGGESTIONS).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
                        activeLanguage === lang 
                        ? 'bg-violet-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {lang === 'Telugu' ? '🇮🇳 TELUGU' : lang === 'Hindi' ? '🇮🇳 HINDI' : '🌍 ENGLISH'}
                    </button>
                  ))}
                </div>

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
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-violet-100">
              <h3 className="font-bold text-lg text-gray-900 mb-6 uppercase tracking-wider text-center">Reward Details</h3>
              
              <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100 mb-4">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-emerald-700 font-semibold mb-1">Max Payout per Creator</p>
                <p className="text-4xl font-black text-emerald-900">₹{(campaign.creatorPayout || 0).toLocaleString('en-IN')}</p>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Target className="w-5 h-5"/> Total Target Pool</div>
                <div className="font-bold text-gray-900">₹{(campaign.totalBudget || 0).toLocaleString('en-IN')}</div>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Building2 className="w-5 h-5"/> Brand Sponsor</div>
                <div className="font-bold text-gray-900">{campaign.brandName}</div>
              </div>

              {/* Action Area */}
              <div className="mt-8 pt-4">
                {applicationStatus === 'approved' ? (
                  <form onSubmit={handleSubmitContent} className="space-y-4">
                    <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                      <h4 className="font-bold text-violet-900 flex items-center gap-2 mb-1"><Video className="w-4 h-4"/> Submit Your Content</h4>
                      <p className="text-sm text-violet-700 mb-3">Your application is approved. Submit your video link below.</p>
                      <input 
                        type="url"
                        placeholder="https://instagram.com/reel/..."
                        required
                        className="w-full border border-violet-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 mb-3"
                        value={videoLink}
                        onChange={e => setVideoLink(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-violet-600 text-white rounded-lg py-3 font-bold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : <><Upload className="w-4 h-4"/> Submit Content</>}
                      </button>
                    </div>
                  </form>
                ) : applicationStatus === 'applied' || applicationStatus === 'pending' ? (
                  <button disabled className="w-full text-center bg-amber-50 text-amber-600 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-amber-200">
                    <Activity className="w-5 h-5 animate-pulse" /> Application Pending
                  </button>
                ) : applicationStatus === 'rejected' ? (
                  <button disabled className="w-full text-center bg-red-50 text-red-600 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-red-200">
                    <XCircle className="w-5 h-5" /> Application Rejected
                  </button>
                ) : deadlinePassed ? (
                  <button disabled className="w-full text-center bg-gray-100 text-red-500 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-red-200">
                    <AlertCircle className="w-5 h-5" /> Deadline Passed
                  </button>
                ) : (
                  <button onClick={() => setApplyModalOpen(true)} className="w-full text-center bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl">
                    Apply for Campaign
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 text-center">
              <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-blue-900 mb-2">Vault Secured</h4>
              <p className="text-sm text-blue-700">The total budget is held securely in the platform vault to guarantee immediate payouts when view targets are hit.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setApplyModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">✕</button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Apply to Campaign</h3>
            <p className="text-gray-500 mb-6">Submit your application to collaborate with {campaign.brandName}.</p>
            
            <form onSubmit={handleApply} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Why are you a good fit? (Optional)</label>
                <textarea 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                  placeholder="Share a brief note about your audience or content style..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1 w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I have read and agree to the campaign guidelines. I understand that my content must be original and meet all requirements to receive payout.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={applying || !termsAccepted} 
                className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {applying ? <Activity className="w-5 h-5 animate-spin" /> : null}
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
