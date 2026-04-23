import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, BarChart3, Settings, Check, X, Activity, MessageSquare, Phone, Sparkles } from 'lucide-react';

export default function DashboardBrand() {
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [showContact, setShowContact] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contact Form State
  const [contactData, setContactData] = useState({
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/campaigns`);
      // Filter by my brand
      setCampaigns(res.data.filter(c => c.brandId?._id === user.id || c.brandId === user.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate sending email to platform admin
    setTimeout(() => {
      setIsSending(false);
      setContactSuccess(true);
      setTimeout(() => {
        setShowContact(false);
        setContactSuccess(false);
        setContactData({ subject: '', message: '' });
      }, 3000);
    }, 1500);
  };

  const viewSubmissions = async (campaign) => {
    setSelectedCampaign(campaign);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/submissions/campaign/${campaign._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateSubmissionStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/submissions/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      viewSubmissions(selectedCampaign); // refresh
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
          <p className="text-gray-500">Manage active campaigns and review submissions.</p>
        </div>
        <button 
          onClick={() => setShowContact(true)}
          className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md"
        >
          <MessageSquare className="w-5 h-5"/> Request New Campaign
        </button>
      </div>

      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 bg-black/60 backdrop-blur-md animate-fade-in-overlay">
          <div className="bg-white p-0 rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gray-900 p-8 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              <button onClick={() => setShowContact(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                <X className="w-5 h-5"/>
              </button>
              <h2 className="text-3xl font-black mb-2 flex items-center gap-2"><Sparkles className="text-primary w-6 h-6"/> Launch a Campaign</h2>
              <p className="text-gray-400">Our VIP concierge team will configure, optimize, and safely launch your performance marketing campaign to thousands of creators.</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 bg-gray-50/50 overflow-y-auto custom-scrollbar">
              {contactSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-slide-up-overlay">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-black text-2xl text-emerald-900">Request Confirmed</h3>
                  <p className="mt-2 text-emerald-700">Your dedicated account manager will contact you within exactly 2 hours to finalize your vault deposit and set your campaign live.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Campaign Title</label>
                      <input required type="text" className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder-gray-400" placeholder="e.g. Summer Skincare Launch" value={contactData.subject} onChange={e => setContactData({...contactData, subject: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Estimated Budget (₹)</label>
                      <input required type="text" className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder-gray-400" placeholder="e.g. ₹1,00,000" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Target Demographics & Goals</label>
                    <textarea required className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder-gray-400 h-32 resize-none" placeholder="Explain the product, your core audience, and what action you want the creators to drive (e.g. 'Target GenZ makeup enthusiasts requesting 5M total views...')" value={contactData.message} onChange={e => setContactData({...contactData, message: e.target.value})}></textarea>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5"><MessageSquare className="w-4 h-4"/></div>
                    <p className="text-sm text-blue-800 leading-tight">By submitting this request, you agree to connect with a TheViewMint scale expert who will configure the smartest payout mathematics for your specific goals.</p>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 gap-4 mt-8">
                    <button type="button" onClick={() => setShowContact(false)} className="px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSending} className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all">
                      {isSending ? 'Transmitting Request...' : 'Submit Request securely'} 
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Your Active Campaigns</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {campaigns.length === 0 ? (
            <p className="p-6 text-gray-500">You do not have any active campaigns right now.</p>
          ) : campaigns.map(camp => (
            <div key={camp._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50">
              <div>
                <h3 className="font-semibold text-lg">{camp.title}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Settings className="w-4 h-4"/> {camp.platform}</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4"/> Budget: ₹{camp.budget.toLocaleString('en-IN')}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4"/> Pay: ₹{camp.payPerView}/view</span>
                </div>
              </div>
              <button onClick={() => viewSubmissions(camp)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 text-primary">
                View Submissions
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Drawer / Section */}
      {selectedCampaign && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Submissions for: {selectedCampaign.title}</h2>
            <button onClick={() => setSelectedCampaign(null)}><X className="text-gray-400 hover:text-gray-900"/></button>
          </div>
          <div className="divide-y divide-gray-100">
            {submissions.length === 0 ? (
              <p className="p-6 text-gray-500">No submissions yet.</p>
            ) : submissions.map(sub => (
              <div key={sub._id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium">{sub.creatorId?.name || 'Creator'}</p>
                  <a href={sub.videoLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View Delivery</a>
                  <p className="text-sm text-gray-500 mt-1">Current views tracked: {sub.views}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                    sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                    sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {sub.status}
                  </span>
                  
                  {sub.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => updateSubmissionStatus(sub._id, 'approved')} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100" title="Approve">
                        <Check className="w-5 h-5"/>
                      </button>
                      <button onClick={() => updateSubmissionStatus(sub._id, 'rejected')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Reject">
                        <X className="w-5 h-5"/>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
