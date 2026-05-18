import { useState, useEffect } from 'react';
import { ArrowLeft, BellOff, Loader2, Bell, CheckCircle2, XCircle, DollarSign, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'submission_approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'submission_rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'payout_processed': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'broadcast': return <Megaphone className="w-5 h-5 text-violet-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type, read) => {
    if (read) return 'bg-white border-gray-100';
    switch (type) {
      case 'submission_approved': return 'bg-emerald-50 border-emerald-100';
      case 'submission_rejected': return 'bg-red-50 border-red-100';
      case 'payout_processed': return 'bg-emerald-50 border-emerald-100';
      case 'broadcast': return 'bg-violet-50 border-violet-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in-up">
      <div className="bg-white px-4 py-6 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <BellOff className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
            <p className="text-gray-500">We'll let you know when campaigns are approved or payouts are processed.</p>
            
            <button 
              onClick={() => navigate('/campaigns')}
              className="mt-8 bg-gray-900 text-white rounded-full py-3 px-8 font-bold hover:bg-black transition-all shadow-md"
            >
              Browse Campaigns
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div 
                key={notif._id} 
                onClick={() => !notif.read && markAsRead(notif._id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${getBgColor(notif.type, notif.read)}`}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                    <p className={`text-sm mt-1 ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>{notif.message}</p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-violet-600 rounded-full shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
