import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useSocket } from '../context/SocketContext';
import { DollarSign, Eye, Video, Activity, CheckCircle2, XCircle, Clock, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardCreator() {
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/users/dashboard-stats');
      setStats(res.data.stats);
      setSubmissions(res.data.submissions);
      setApplications(res.data.applications);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchDashboard();
    socket.on('submission_updated', handleUpdate);
    socket.on('payout_received', handleUpdate);
    return () => {
      socket.off('submission_updated', handleUpdate);
      socket.off('payout_received', handleUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Activity className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your earnings, submissions, and campaign status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Earnings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">₹{(s.withdrawableAmount || 0).toLocaleString('en-IN')} available to withdraw</p>
          </div>
        </div>

        {/* Views */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">{(s.totalViews || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Across all approved content</p>
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{s.totalSubmissions || 0}</p>
            <p className="text-xs text-gray-400 mt-1">
              <span className="text-emerald-500 font-medium">{s.approvedSubmissions || 0} approved</span> · {s.pendingSubmissions || 0} pending
            </p>
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Performance Score</p>
            <p className="text-2xl font-bold text-gray-900">{s.performanceScore || 0}%</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${s.performanceScore || 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Your Applications</h2>
            <Link to="/campaigns" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              Find More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[500px]">
            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't applied to any campaigns yet.</p>
                <Link to="/campaigns" className="inline-block px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors">
                  Browse Campaigns
                </Link>
              </div>
            ) : (
              applications.map(app => (
                <div key={app._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/campaign/${app.campaign?._id}`} className="font-semibold text-gray-900 hover:text-violet-600 transition-colors">
                      {app.campaign?.title}
                    </Link>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'approved' && (
                    <div className="mt-4">
                      {/* Has user submitted content for this app? */}
                      {submissions.some(sub => sub.application === app._id) ? (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Content Submitted
                        </p>
                      ) : (
                        <Link to={`/campaign/${app.campaign?._id}`} className="inline-block text-xs px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium">
                          Submit Content Now
                        </Link>
                      )}
                    </div>
                  )}
                  {app.status === 'pending' && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Awaiting brand approval
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Submissions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[500px]">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                You haven't submitted any content yet.
              </div>
            ) : (
              submissions.map(sub => (
                <div key={sub._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{sub.campaign?.title}</h3>
                      <a href={sub.videoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-1 font-medium">
                        View Content <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      sub.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      sub.status === 'under_review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {sub.status === 'under_review' ? 'In Review' : sub.status}
                    </span>
                  </div>

                  {sub.status === 'approved' && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">Earnings</span>
                        <span className="font-bold text-emerald-600">₹{sub.earnings || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">Views Recorded</span>
                        <span className="font-bold text-gray-900">{(sub.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">Payout Status</span>
                        <span className={`font-medium ${sub.payoutStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {sub.payoutStatus === 'paid' ? 'Paid to Wallet' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  )}

                  {sub.status === 'rejected' && sub.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                      <span className="font-bold">Reason:</span> {sub.rejectionReason}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Submitted on {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
