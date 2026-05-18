import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Search, Shield, ShieldX, ShieldCheck, Eye, MoreVertical, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  active:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  suspended: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  banned:    'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionUser, setActionUser] = useState(null); // user being actioned
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load creators.'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async (userId, newStatus) => {
    setProcessing(true);
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus, adminNote: actionNote });
      toast.success(`Creator ${newStatus} successfully.`);
      setActionUser(null);
      setActionNote('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creator Management</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} total creators</p>
        </div>
        <button onClick={fetchUsers} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, username, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-all"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a28] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-40" />
                  <div className="h-3 bg-white/5 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No creators found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map(user => (
              <div key={user._id} className="p-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.profileImage
                    ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-bold">{(user.name || 'C')[0].toUpperCase()}</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    {user.username && <span className="text-xs text-gray-500">@{user.username}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[user.status] || STATUS_STYLES.active}`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user.phone || user.email} · Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
                  <div>
                    <p className="text-sm font-bold text-white">₹{(user.totalEarnings || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">Earnings</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.performanceScore || 0}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.approvedSubmissions || 0}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.status !== 'banned' && (
                    <button
                      onClick={() => setActionUser({ ...user, newStatus: 'banned' })}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Ban User"
                    >
                      <ShieldX className="w-4 h-4" />
                    </button>
                  )}
                  {user.status !== 'suspended' && user.status !== 'banned' && (
                    <button
                      onClick={() => setActionUser({ ...user, newStatus: 'suspended' })}
                      className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Suspend User"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  )}
                  {(user.status === 'suspended' || user.status === 'banned') && (
                    <button
                      onClick={() => handleStatusChange(user._id, 'active')}
                      className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                      title="Activate User"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-white/5 flex justify-center gap-2">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === i + 1
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">
              {actionUser.newStatus === 'banned' ? '🚫 Ban User' : '⚠️ Suspend User'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {actionUser.newStatus === 'banned'
                ? `You are about to permanently ban "${actionUser.name}". They will lose all access.`
                : `You are about to suspend "${actionUser.name}". They can be reactivated later.`
              }
            </p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none mb-4"
              placeholder="Reason for action (optional)"
              rows={3}
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setActionUser(null); setActionNote(''); }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(actionUser._id, actionUser.newStatus)}
                disabled={processing}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                  actionUser.newStatus === 'banned'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {processing ? 'Processing...' : `Confirm ${actionUser.newStatus === 'banned' ? 'Ban' : 'Suspend'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
