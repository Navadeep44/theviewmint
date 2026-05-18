import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { FileText, RefreshCw, Megaphone, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_COLOR = {
  campaign_active:    'bg-emerald-500/10 text-emerald-400',
  campaign_rejected:  'bg-red-500/10 text-red-400',
  brand_approved:     'bg-emerald-500/10 text-emerald-400',
  brand_rejected:     'bg-red-500/10 text-red-400',
  user_banned:        'bg-red-900/20 text-red-400',
  user_suspended:     'bg-amber-500/10 text-amber-400',
  user_active:        'bg-emerald-500/10 text-emerald-400',
  payout_processed:   'bg-blue-500/10 text-blue-400',
};

export default function AdminLogs() {
  const [logs, setLogs]             = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [processing, setProcessing] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs', { params: { page, limit: 30 } });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load audit logs.'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Title and message are required.'); return;
    }
    setProcessing(true);
    try {
      const res = await api.post('/admin/broadcast', broadcastForm);
      toast.success(res.data.message);
      setShowBroadcast(false);
      setBroadcastForm({ title: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Broadcast failed.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Full admin activity trail</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLogs} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm text-white font-medium transition-all"
          >
            <Megaphone className="w-4 h-4" /> Broadcast
          </button>
        </div>
      </div>

      {/* Log Timeline */}
      <div className="bg-[#1a1a28] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-4">
                <div className="w-2 h-2 bg-white/10 rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-64" />
                  <div className="h-3 bg-white/5 rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No audit logs yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => (
              <div key={log._id} className="p-4 flex items-start gap-4 hover:bg-white/2 transition-colors">
                {/* Action badge */}
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0 mt-0.5 ${ACTION_COLOR[log.action] || 'bg-white/5 text-gray-400'}`}>
                  {log.action?.replace(/_/g, ' ')}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{log.details || '—'}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>By: <span className="text-gray-400">{log.admin?.name || 'Admin'}</span></span>
                    {log.ipAddress && <span>· IP: {log.ipAddress}</span>}
                    <span>· {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
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

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">📣 Broadcast to All Creators</h3>
              <button onClick={() => setShowBroadcast(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Notification Title *</label>
                <input required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="e.g. New Campaign Alert!"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Message *</label>
                <textarea required rows={4}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                  placeholder="Message to send to all active creators..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBroadcast(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={processing}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  {processing ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
