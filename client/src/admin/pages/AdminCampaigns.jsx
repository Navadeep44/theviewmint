import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { CheckCircle2, XCircle, Clock, Eye, RefreshCw, Search, Plus, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  active:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  paused:   'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  closed:   'bg-gray-500/10 text-gray-500 border border-gray-500/20',
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', brandName: '', description: '', platform: 'Instagram',
    totalBudget: '', creatorPayout: '', platformCommission: '', creatorsNeeded: 10,
    deadline: '', category: '',
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/campaigns', { params: { page, limit: 15, status: statusFilter || undefined } });
      setCampaigns(res.data.campaigns);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load campaigns.'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleApprove = async (campaignId) => {
    setProcessing(true);
    try {
      await api.put(`/admin/campaigns/${campaignId}/approve`, { status: 'active' });
      toast.success('Campaign approved and published! 🚀');
      setSelected(null);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed.');
    } finally { setProcessing(false); }
  };

  const handleReject = async (campaignId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setProcessing(true);
    try {
      await api.put(`/admin/campaigns/${campaignId}/approve`, { status: 'rejected', rejectionReason });
      toast.success('Campaign rejected.');
      setSelected(null);
      setRejectionReason('');
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rejection failed.');
    } finally { setProcessing(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await api.post('/campaigns', {
        ...createForm,
        totalBudget: Number(createForm.totalBudget),
        creatorPayout: Number(createForm.creatorPayout),
        platformCommission: Number(createForm.platformCommission),
        creatorsNeeded: Number(createForm.creatorsNeeded),
        status: 'active',
        isPublished: true,
      });
      toast.success('Campaign created successfully!');
      setShowCreate(false);
      setCreateForm({ title: '', brandName: '', description: '', platform: 'Instagram', totalBudget: '', creatorPayout: '', platformCommission: '', creatorsNeeded: 10, deadline: '', category: '' });
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create campaign.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign Management</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} campaigns</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCampaigns} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'pending', 'active', 'rejected', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <div className="bg-[#1a1a28] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-16 text-center">
            <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No campaigns found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {campaigns.map(camp => (
              <div key={camp._id} className="p-5 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[camp.status] || STATUS_BADGE.pending}`}>
                        {camp.status}
                      </span>
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        {camp.platform}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold">{camp.title}</h3>
                    <p className="text-sm text-gray-400">by {camp.brandName}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{camp.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Budget: <span className="text-white font-medium">₹{(camp.totalBudget || 0).toLocaleString('en-IN')}</span></span>
                      <span>Payout: <span className="text-emerald-400 font-medium">₹{camp.creatorPayout}/creator</span></span>
                      <span>Need: <span className="text-white font-medium">{camp.creatorsNeeded} creators</span></span>
                      {camp.deadline && <span>Deadline: <span className="text-amber-400 font-medium">{new Date(camp.deadline).toLocaleDateString('en-IN')}</span></span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelected(camp)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {camp.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(camp._id)}
                          disabled={processing}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelected({ ...camp, rejecting: true })}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-white/5 flex justify-center gap-2">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Detail / Reject Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selected.rejecting ? 'Reject Campaign' : selected.title}</h3>
              <button onClick={() => { setSelected(null); setRejectionReason(''); }} className="text-gray-500 hover:text-white transition-all">✕</button>
            </div>

            {selected.rejecting ? (
              <>
                <p className="text-gray-400 text-sm mb-4">Provide a clear reason for rejecting <span className="text-white font-medium">"{selected.title}"</span>. This will help the brand understand the issue.</p>
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none mb-4"
                  placeholder="e.g., Product category not eligible, incomplete campaign details..."
                  rows={4}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={() => { setSelected(null); setRejectionReason(''); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all">Cancel</button>
                  <button onClick={() => handleReject(selected._id)} disabled={processing} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                    {processing ? 'Rejecting...' : 'Reject Campaign'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Brand</p><p className="text-white font-medium">{selected.brandName}</p></div>
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Platform</p><p className="text-white font-medium">{selected.platform}</p></div>
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Total Budget</p><p className="text-white font-medium">₹{(selected.totalBudget || 0).toLocaleString('en-IN')}</p></div>
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Creator Payout</p><p className="text-emerald-400 font-medium">₹{selected.creatorPayout}</p></div>
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Creators Needed</p><p className="text-white font-medium">{selected.creatorsNeeded}</p></div>
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Applied</p><p className="text-white font-medium">{selected.creatorsApplied || 0}</p></div>
                </div>
                <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Description</p><p className="text-gray-300 leading-relaxed">{selected.description}</p></div>
                {selected.requirements?.guidelines && (
                  <div className="bg-black/20 rounded-xl p-3"><p className="text-gray-500 text-xs mb-1">Guidelines</p><p className="text-gray-300 leading-relaxed">{selected.requirements.guidelines}</p></div>
                )}
                {selected.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setSelected({ ...selected, rejecting: true })} className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-sm text-red-400 font-medium transition-all">Reject</button>
                    <button onClick={() => handleApprove(selected._id)} disabled={processing} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                      {processing ? 'Approving...' : '✓ Approve & Publish'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Create New Campaign</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-all">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">Campaign Title *</label>
                  <input required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="e.g., Summer Fashion Campaign" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Brand Name *</label>
                  <input required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Brand name" value={createForm.brandName} onChange={e => setCreateForm(f => ({ ...f, brandName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Platform *</label>
                  <select required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" value={createForm.platform} onChange={e => setCreateForm(f => ({ ...f, platform: e.target.value }))}>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Total Budget (₹) *</label>
                  <input required type="number" min="0" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="50000" value={createForm.totalBudget} onChange={e => setCreateForm(f => ({ ...f, totalBudget: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Creator Payout (₹) *</label>
                  <input required type="number" min="0" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="500" value={createForm.creatorPayout} onChange={e => setCreateForm(f => ({ ...f, creatorPayout: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Platform Commission (₹)</label>
                  <input type="number" min="0" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="50" value={createForm.platformCommission} onChange={e => setCreateForm(f => ({ ...f, platformCommission: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Creators Needed</label>
                  <input type="number" min="1" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" value={createForm.creatorsNeeded} onChange={e => setCreateForm(f => ({ ...f, creatorsNeeded: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Deadline</label>
                  <input type="date" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" value={createForm.deadline} onChange={e => setCreateForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">Description *</label>
                  <textarea required rows={3} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" placeholder="Campaign details and objectives..." value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all">Cancel</button>
                <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                  {processing ? 'Creating...' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
