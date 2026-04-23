import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Edit, FileText, MapPin, CreditCard, Bell, HelpCircle, LogOut, Activity } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const userId = user.id || user._id;
        const subRes = await axios.get(`${import.meta.env.VITE_API_URL}/submissions/creator/${userId}`, config);
        setSubmissions(subRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user && (user.id || user._id)) {
      fetchProfileData();
    } else {
      navigate('/login');
    }
  }, [user.id, user._id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const totalEarnings = submissions.reduce((acc, sub) => acc + (sub.earnings || 0), 0);
  const totalViews = submissions.reduce((acc, sub) => acc + (sub.views || 0), 0);
  const activeCampaigns = submissions.length;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Activity className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 px-4 pt-12 animate-fade-in-up">
      <div className="max-w-md mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg">
            <User className="w-12 h-12" />
          </div>
          <button className="absolute top-0 right-4 p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-primary transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Campaigns</p>
            <p className="text-3xl font-black text-emerald-600">{activeCampaigns}</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Views</p>
            <p className="text-3xl font-black text-emerald-600">{totalViews >= 1000 ? (totalViews/1000).toFixed(1) + 'k' : totalViews}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-10 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Wallet Earnings</p>
          <p className="text-4xl font-black text-emerald-600">₹{totalEarnings.toLocaleString('en-IN')}</p>
        </div>

        {/* Account Management */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-2">Account Management</h2>
          <div className="space-y-3">
            
            <div className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/creator-dashboard')}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px]">My Submissions</h3>
                <p className="text-sm text-gray-500">Track and manage campaigns</p>
              </div>
              <div className="text-gray-300 pr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/edit-profile')}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px]">Edit Profile</h3>
                <p className="text-sm text-gray-500">Update socials and bio</p>
              </div>
              <div className="text-gray-300 pr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/payment-methods')}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px]">Payment Methods</h3>
                <p className="text-sm text-gray-500">Manage bank and UPI</p>
              </div>
              <div className="text-gray-300 pr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/notifications')}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px]">Notifications</h3>
                <p className="text-sm text-gray-500">Preferences and history</p>
              </div>
              <div className="text-gray-300 pr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>

            <a href="mailto:supportteam@theviewmint.in" className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer block">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px]">Support</h3>
                <p className="text-sm text-gray-500">Help center and live chat</p>
              </div>
              <div className="text-gray-300 pr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </a>

          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full mt-6 bg-white border border-red-100 rounded-3xl p-4 flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 shadow-sm transition-colors"
        >
          <LogOut className="w-5 h-5" /> Log Out
        </button>

      </div>
    </div>
  );
}
