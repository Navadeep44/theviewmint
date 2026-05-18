import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { User, Edit, FileText, CreditCard, Bell, HelpCircle, LogOut, Activity, Instagram, Youtube, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/users/dashboard-stats')
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Activity className="w-10 h-10 animate-spin text-violet-600" /></div>;
  }

  const s = stats || {};
  const p = profile || {};

  return (
    <div className="bg-gray-50 min-h-screen pb-24 px-4 pt-12 animate-fade-in-up">
      <div className="max-w-md mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg overflow-hidden">
            {p.profileImage ? (
              <img src={p.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
          <button onClick={() => navigate('/edit-profile')} className="absolute top-0 right-4 p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-violet-600 transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
          <p className="text-gray-500 text-sm">@{p.username || p.phone}</p>
          
          <div className="flex gap-3 mt-4">
            {p.instagramHandle && <div className="bg-white p-2 rounded-full shadow-sm text-pink-600"><Instagram className="w-4 h-4"/></div>}
            {p.youtubeChannel && <div className="bg-white p-2 rounded-full shadow-sm text-red-600"><Youtube className="w-4 h-4"/></div>}
            {p.twitterHandle && <div className="bg-white p-2 rounded-full shadow-sm text-blue-400"><Twitter className="w-4 h-4"/></div>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Performance Score</p>
            <p className="text-3xl font-black text-violet-600">{p.performanceScore || 0}%</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Views</p>
            <p className="text-3xl font-black text-blue-600">{(s.totalViews || 0) >= 1000 ? ((s.totalViews || 0)/1000).toFixed(1) + 'k' : (s.totalViews || 0)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-10 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Earnings</p>
          <p className="text-4xl font-black text-emerald-600">₹{(p.totalEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-2">Available to withdraw: <span className="font-bold text-gray-900">₹{(p.withdrawableAmount || 0).toLocaleString('en-IN')}</span></p>
        </div>

        {/* Account Management */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-2">Account Management</h2>
          <div className="space-y-3">
            
            <div className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/creator-dashboard')}>
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-violet-600" />
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
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
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
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-600" />
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
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-rose-600" />
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
