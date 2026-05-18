import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { DollarSign, RefreshCw, Search, CheckCircle2, Clock, CreditCard, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayouts() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [typeFilter, setTypeFilter]     = useState('');
  const [creators, setCreators]         = useState([]);
  const [showPayout, setShowPayout]     = useState(false);
  const [payoutForm, setPayoutForm]     = useState({ creatorId: '', amount: '', upiId: '', note: '' });
  const [creatorBalance, setCreatorBalance] = useState(null);
  const [processing, setProcessing]     = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/transactions', { params: { page, limit: 20, type: typeFilter || undefined } });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load transactions.'); }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Load creators for payout form
  const loadCreators = async () => {
    try {
      const res = await api.get('/admin/users', { params: { limit: 200, status: 'active' } });
      setCreators(res.data.users);
    } catch {}
  };

  const handleOpenPayout = () => {
    loadCreators();
    setShowPayout(true);
  };

  // When creator is selected, load their balance
  const handleCreatorSelect = async (creatorId) => {
    setPayoutForm(f => ({ ...f, creatorId }));
    if (!creatorId) { setCreatorBalance(null); return; }
    try {
      // Use profile endpoint - admin can see user data
      const creator = creators.find(c => c._id === creatorId);
      if (creator) {
        setCreatorBalance({ withdrawable: creator.withdrawableAmount || 0, upiId: creator.upiId || '' });
        setPayoutForm(f => ({ ...f, upiId: creator.upiId || '' }));
      }
    } catch {}
  };

  const handlePayout = async (e) => {
    e.preventDefault();
    if (!payoutForm.creatorId || !payoutForm.amount || !payoutForm.upiId) {
      toast.error('All fields are required.'); return;
    }
    if (creatorBalance && Number(payoutForm.amount) > creatorBalance.withdrawable) {
      toast.error('Amount exceeds creator\'s withdrawable balance.'); return;
    }
    setProcessing(true);
    try {
      await api.post('/admin/payout', {
        creatorId: payoutForm.creatorId,
        amount: Number(payoutForm.amount),
        upiId: payoutForm.upiId,
        note: payoutForm.note,
      });
      toast.success(`Payout of ₹${payoutForm.amount} processed! 💸`);
      setShowPayout(false);
      setPayoutForm({ creatorId: '', amount: '', upiId: '', note: '' });
      setCreatorBalance(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payout failed.');
    } finally { setProcessing(false); }
  };

  const STATUS_COLOR = {
    completed: 'text-emerald-400',
    pending:   'text-amber-400',
    processing:'text-blue-400',
    failed:    'text-red-400',
    reversed:  'text-gray-400',
  };

  const TYPE_BADGE = {
    earning:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    withdrawal: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    bonus:      'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    deduction:  'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payout Management</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} transactions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchTransactions} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenPayout}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm text-white font-medium transition-all"
          >
            <Send className="w-4 h-4" /> Process Payout
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'earning', 'withdrawal', 'bonus'].map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              typeFilter === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}>
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1a1a28] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="grid grid-cols-5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <span>Creator</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse grid grid-cols-5 gap-4 items-center">
                {[...Array(5)].map((_, j) => <div key={j} className="h-3 bg-white/5 rounded" />)}
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map(tx => (
              <div key={tx._id} className="p-4 grid grid-cols-5 gap-4 items-center hover:bg-white/2 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{tx.creator?.name || '—'}</p>
                  <p className="text-xs text-gray-500 truncate">{tx.upiId || tx.creator?.username || ''}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border w-fit ${TYPE_BADGE[tx.type] || ''}`}>
                  {tx.type}
                </span>
                <div>
                  <p className={`text-sm font-bold ${tx.type === 'withdrawal' || tx.type === 'deduction' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.type === 'withdrawal' || tx.type === 'deduction' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className={`text-xs font-medium capitalize ${STATUS_COLOR[tx.status] || 'text-gray-400'}`}>
                  {tx.status}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}

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

      {/* Process Payout Modal */}
      {showPayout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Process Manual Payout</h3>
              <button onClick={() => { setShowPayout(false); setCreatorBalance(null); }} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePayout} className="space-y-4">
              {/* Creator select */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Select Creator *</label>
                <select
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  value={payoutForm.creatorId}
                  onChange={e => handleCreatorSelect(e.target.value)}
                >
                  <option value="">— Choose creator —</option>
                  {creators.map(c => (
                    <option key={c._id} value={c._id}>{c.name} (@{c.username || c.phone}) — ₹{(c.withdrawableAmount || 0).toLocaleString('en-IN')} withdrawable</option>
                  ))}
                </select>
              </div>

              {/* Creator balance info */}
              {creatorBalance !== null && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm">
                  <p className="text-emerald-300">
                    Withdrawable Balance: <span className="font-bold">₹{(creatorBalance.withdrawable || 0).toLocaleString('en-IN')}</span>
                  </p>
                  {creatorBalance.upiId && (
                    <p className="text-gray-400 text-xs mt-1">UPI: {creatorBalance.upiId}</p>
                  )}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Amount (₹) *</label>
                <input
                  required type="number" min="1"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="Enter amount"
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>

              {/* UPI ID */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">UPI ID *</label>
                <input
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="creator@upi"
                  value={payoutForm.upiId}
                  onChange={e => setPayoutForm(f => ({ ...f, upiId: e.target.value }))}
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Note (optional)</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  placeholder="e.g. Campaign payout - April batch"
                  value={payoutForm.note}
                  onChange={e => setPayoutForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowPayout(false); setCreatorBalance(null); }}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={processing}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                  {processing ? 'Processing...' : '💸 Send Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
