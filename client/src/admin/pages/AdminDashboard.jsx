import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../lib/api';
import {
  Users, Megaphone, FileVideo, Building2, TrendingUp,
  Clock, CheckCircle2, XCircle, DollarSign, Activity,
  RefreshCw, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className={`bg-[#1a1a28] border border-white/5 rounded-2xl p-5 flex items-start gap-4`}>
    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { socket } = useSocket();
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/analytics?days=30'),
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('[Admin Dashboard] Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_admin_room');
    const handleUpdate = () => fetchData(false);
    socket.on('admin_stats_updated', handleUpdate);
    socket.on('new_submission', handleUpdate);
    socket.on('campaign_status_changed', handleUpdate);
    return () => {
      socket.off('admin_stats_updated', handleUpdate);
      socket.off('new_submission', handleUpdate);
      socket.off('campaign_status_changed', handleUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const s = stats || {};
  const a = analytics || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Live platform overview</p>
        </div>
        <button
          onClick={() => fetchData(false)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Attention cards */}
      {(s.submissions?.pending > 0 || s.campaigns?.pending > 0 || s.brands?.pending > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {s.submissions?.pending > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-300">
                <span className="font-bold">{s.submissions.pending}</span> submissions awaiting review
              </p>
            </div>
          )}
          {s.campaigns?.pending > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-300">
                <span className="font-bold">{s.campaigns.pending}</span> campaigns need approval
              </p>
            </div>
          )}
          {s.brands?.pending > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <p className="text-sm text-purple-300">
                <span className="font-bold">{s.brands.pending}</span> brand verifications pending
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Creators"    value={s.creators?.total}    sub={`${s.creators?.active} active`}            color="text-violet-400"  bg="bg-violet-500/10" />
        <StatCard icon={Megaphone}    label="Active Campaigns"  value={s.campaigns?.active}   sub={`${s.campaigns?.pending} pending`}          color="text-blue-400"    bg="bg-blue-500/10" />
        <StatCard icon={FileVideo}    label="Total Submissions" value={s.submissions?.total}  sub={`${s.submissions?.approved} approved`}       color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={Building2}    label="Brands"            value={s.brands?.total}       sub={`${s.brands?.pending} pending verification`} color="text-orange-400"  bg="bg-orange-500/10" />
        <StatCard icon={Clock}        label="Pending Reviews"   value={s.submissions?.pending} sub="Need action"                                color="text-amber-400"   bg="bg-amber-500/10" />
        <StatCard icon={CheckCircle2} label="Approved"          value={s.submissions?.approved} sub="All time"                                  color="text-green-400"   bg="bg-green-500/10" />
        <StatCard icon={DollarSign}   label="Total Revenue"     value={`₹${(s.revenue?.total || 0).toLocaleString('en-IN')}`} sub="Platform earnings" color="text-pink-400" bg="bg-pink-500/10" />
        <StatCard icon={Activity}     label="Pending Campaigns"  value={s.campaigns?.pending} sub="Awaiting approval"                           color="text-cyan-400"    bg="bg-cyan-500/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creator Growth */}
        <div className="bg-[#1a1a28] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Creator Growth (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={a.creatorGrowth || []}>
              <defs>
                <linearGradient id="creatorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"   stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%"  stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#creatorGrad)" name="New Creators" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings Trend */}
        <div className="bg-[#1a1a28] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Earnings Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={a.earningsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }} formatter={v => [`₹${v}`, 'Earnings']} />
              <Bar dataKey="amount" fill="#10b981" radius={[4,4,0,0]} name="Earnings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Creators */}
      {a.topCreators?.length > 0 && (
        <div className="bg-[#1a1a28] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Creators by Earnings</h3>
          <div className="space-y-3">
            {a.topCreators.slice(0, 5).map((c, i) => (
              <div key={c._id} className="flex items-center gap-4">
                <span className="w-6 text-gray-500 text-sm font-bold flex-shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(c.name || 'C')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">@{c.username || 'creator'} · {c.approvedSubmissions || 0} approved</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-400">₹{(c.totalEarnings || 0).toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${c.performanceScore || 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{c.performanceScore || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
