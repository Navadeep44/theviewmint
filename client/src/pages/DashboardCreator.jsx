import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DollarSign, Eye, Video, PlusCircle, CheckCircle2, XCircle, Clock, Activity, Users } from 'lucide-react';

export default function DashboardCreator() {
  const [campaigns, setCampaigns] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(true);

  // Submitting state
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [videoLink, setVideoLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [campRes, subRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/campaigns`),
        axios.get(`${import.meta.env.VITE_API_URL}/submissions/creator/${user.id}`, config)
      ]);
      setCampaigns(campRes.data);
      setSubmissions(subRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/submissions`, {
        campaignId: selectedCampaign._id,
        videoLink
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSelectedCampaign(null);
      setVideoLink('');
      await fetchDashboardData();
      alert('Submission successful!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEarnings = submissions.reduce((acc, sub) => acc + (sub.earnings || 0), 0);
  const totalViews = submissions.reduce((acc, sub) => acc + (sub.views || 0), 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name} 👋</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Views Tracked</p>
            <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Video className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Available Campaigns */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Available Campaigns</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {campaigns.length === 0 ? (
              <p className="p-6 text-gray-500">No active campaigns available.</p>
            ) : campaigns.map(camp => (
              <div key={camp._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Link to={`/campaign/${camp._id}`} className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors inline-block">{camp.title}</Link>
                    <p className="text-sm text-gray-500">by Premium Brand</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {camp.platform}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{camp.description}</p>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />₹{camp.payPerView} per view
                  </span>
                  <button
                    onClick={() => setSelectedCampaign(camp)}
                    className="text-primary hover:text-blue-600 flex items-center gap-1"
                  >
                    Apply <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Submissions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">My Submissions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {submissions.length === 0 ? (
              <p className="p-6 text-gray-500">You haven't submitted any content yet.</p>
            ) : submissions.map(sub => (
              <div key={sub._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900">{sub.campaignId?.title || 'Campaign'}</h3>
                  <a href={sub.videoLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                    View Uploaded Content
                  </a>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {sub.views}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> ₹{sub.earnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {sub.status === 'approved' && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="w-4 h-4" /> Approved</span>}
                  {sub.status === 'pending' && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium"><Clock className="w-4 h-4" /> Pending</span>}
                  {sub.status === 'rejected' && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-medium"><XCircle className="w-4 h-4" /> Rejected</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Premium Submission & Requirements Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-overlay" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-3xl p-0 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 p-6 md:p-8 flex justify-between items-start">
              <div>
                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-3 inline-block shadow-sm">
                  {selectedCampaign.platform}
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{selectedCampaign.title}</h3>
                <p className="text-gray-500 font-medium mt-1">Payout strictly limited to minimum specified targets.</p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="bg-white p-2 text-gray-400 hover:text-gray-900 rounded-full shadow-sm border border-gray-200">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">

              {selectedCampaign.requirements?.collabTarget && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-md transform rotate-12">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">Mandatory Collab Target</h4>
                    <p className="text-blue-700 text-sm mt-0.5">
                      You MUST invite <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md shadow-sm ml-1 select-all">{selectedCampaign.requirements.collabTarget}</span> as a collaborator on Instagram.
                    </p>
                  </div>
                </div>
              )}

              {selectedCampaign.requirements?.hashtags && selectedCampaign.requirements.hashtags.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-3">Required Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.requirements.hashtags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold select-all">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCampaign.requirements?.scripts && selectedCampaign.requirements.scripts.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-3">Approved Hook Scripts (Use One)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCampaign.requirements.scripts.map((script, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-gray-700 italic select-all leading-relaxed">
                        "{script}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCampaign.requirements?.terms && selectedCampaign.requirements.terms.length > 0 && (
                <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-4">Terms & Conditions</h4>
                  <ul className="space-y-3">
                    {selectedCampaign.requirements.terms.map((term, i) => (
                      <li key={i} className="flex gap-3 items-start text-sm text-gray-600 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr className="border-gray-100 mb-8" />

              <form onSubmit={handleApply}>
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Submit Your Delivery</label>
                  <p className="text-xs text-gray-500 font-medium mb-4">Paste the final live URL of your Reel or Short. Our API will automatically bind and track the views.</p>
                  <input
                    type="url"
                    required
                    placeholder="https://instagram.com/reel/..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:outline-none text-gray-900 placeholder-gray-400"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setSelectedCampaign(null)} className="flex-1 px-4 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors" disabled={isSubmitting}>
                    Cancel / Back
                  </button>
                  <button type="submit" className="flex-1 px-4 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-gray-900 shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] transition-all disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying Link...' : 'Submit URL'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
