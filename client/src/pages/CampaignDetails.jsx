import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Dot, Activity, ArrowLeft, Building2, Flame, DollarSign, Target, CheckCircle2, ShieldCheck, Users, Copy, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [note, setNote] = useState('');

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
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
              <div className="bg-gray-900 p-6 md:p-8 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-emerald-400"/> Campaign Guidelines</h2>
                <p className="text-gray-400 mt-2">Strictly adhere to the following elements to ensure approval.</p>
              </div>
              
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Terms & Regulations</h4>
                  <ul className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <li className="flex gap-3 items-start text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Content must be original and created specifically for this campaign.</span>
                    </li>
                    <li className="flex gap-3 items-start text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Do not delete the post or reel for at least 30 days after approval.</span>
                    </li>
                    <li className="flex gap-3 items-start text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Ensure good lighting, clear audio, and professional presentation.</span>
                    </li>
                  </ul>
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

              <div className="mt-8">
                {hasApplied ? (
                  <button disabled className="w-full text-center bg-gray-100 text-emerald-600 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" /> Applied ({applicationStatus})
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
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
                className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
