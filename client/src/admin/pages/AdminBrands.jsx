import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { CheckCircle2, XCircle, Clock, Eye, RefreshCw, Building2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  under_review: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  approved:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected:     'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function AdminBrands() {
  const [brands, setBrands]           = useState([]);
  const [pagination, setPagination]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected]       = useState(null);
  const [verifyForm, setVerifyForm]   = useState({
    status: '', rejectionReason: '', adminNote: '', isBlacklisted: false, blacklistReason: ''
  });
  const [processing, setProcessing]   = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/brands' /* uses admin route that calls /brands internally */
        .replace('/admin/brands', '/brands'), {
        params: { page, limit: 15, status: statusFilter || undefined }
      });
      setBrands(res.data.brands);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load brands.'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openVerify = (brand) => {
    setSelected(brand);
    setVerifyForm({ status: brand.verificationStatus, rejectionReason: '', adminNote: '', isBlacklisted: false, blacklistReason: '' });
  };

  const handleVerify = async () => {
    if (!verifyForm.status) { toast.error('Select a verification status.'); return; }
    if (verifyForm.status === 'rejected' && !verifyForm.rejectionReason.trim()) {
      toast.error('Provide a rejection reason.'); return;
    }
    setProcessing(true);
    try {
      await api.put(`/brands/${selected._id}/verify`, verifyForm);
      toast.success(`Brand ${verifyForm.status === 'approved' ? 'verified ✓' : verifyForm.status}!`);
      setSelected(null);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Verification</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} brands</p>
        </div>
        <button onClick={fetchBrands} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'pending', 'under_review', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === s ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}>
            {s === '' ? 'All' : s === 'under_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Brand Cards */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a28] border border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-48 mb-2" />
              <div className="h-3 bg-white/5 rounded w-32 mb-4" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))
        ) : brands.length === 0 ? (
          <div className="bg-[#1a1a28] border border-white/5 rounded-2xl p-16 text-center">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No brands found.</p>
          </div>
        ) : brands.map(brand => (
          <div key={brand._id} className="bg-[#1a1a28] border border-white/5 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_BADGE[brand.verificationStatus]}`}>
                    {brand.verificationStatus === 'under_review' ? 'In Review' : brand.verificationStatus}
                  </span>
                  {brand.isBlacklisted && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-700/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Blacklisted
                    </span>
                  )}
                  {brand.category && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                      {brand.category}
                    </span>
                  )}
                </div>

                {/* Company name */}
                <h3 className="text-white font-bold text-lg">{brand.companyName}</h3>
                <p className="text-gray-400 text-sm">{brand.contactName} · {brand.email}</p>
                {brand.phone && <p className="text-gray-500 text-xs mt-0.5">{brand.phone}</p>}

                {/* Description */}
                {brand.description && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{brand.description}</p>
                )}

                {/* Details grid */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                  {brand.website && <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{brand.website}</a>}
                  {brand.gstNumber && <span>GST: <span className="text-gray-300">{brand.gstNumber}</span></span>}
                  {brand.panNumber && <span>PAN: <span className="text-gray-300">{brand.panNumber}</span></span>}
                </div>

                {/* Social links */}
                <div className="flex gap-3 mt-2 text-xs">
                  {brand.instagramUrl && <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">Instagram</a>}
                  {brand.youtubeUrl && <a href={brand.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">YouTube</a>}
                  {brand.linkedinUrl && <a href={brand.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                </div>

                <p className="text-xs text-gray-600 mt-2">
                  Submitted: {new Date(brand.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Action button */}
              <button
                onClick={() => openVerify(brand)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-sm text-violet-300 font-medium transition-all flex-shrink-0"
              >
                <Eye className="w-4 h-4" />
                Review
              </button>
            </div>

            {/* Rejection reason if rejected */}
            {brand.rejectionReason && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-red-400">Rejection reason: {brand.rejectionReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Verify Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Verify Brand: {selected.companyName}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              {/* Checklist */}
              <div className="bg-black/20 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Verification Checklist</p>
                {[
                  ['Company legitimacy', !!selected.companyName],
                  ['GST/PAN provided', !!(selected.gstNumber || selected.panNumber)],
                  ['Social presence', !!(selected.instagramUrl || selected.youtubeUrl || selected.linkedinUrl)],
                  ['Website provided', !!selected.website],
                  ['Category specified', !!selected.category],
                ].map(([label, ok]) => (
                  <div key={label} className="flex items-center gap-2">
                    {ok
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    }
                    <span className={ok ? 'text-gray-300' : 'text-gray-500'}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Verification Decision *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['under_review', 'approved', 'rejected'].map(s => (
                    <button key={s}
                      onClick={() => setVerifyForm(f => ({ ...f, status: s }))}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                        verifyForm.status === s
                          ? s === 'approved'  ? 'bg-emerald-600 border-emerald-600 text-white'
                          : s === 'rejected' ? 'bg-red-600 border-red-600 text-white'
                          :                   'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}>
                      {s === 'under_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rejection reason */}
              {verifyForm.status === 'rejected' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Rejection Reason *</label>
                  <textarea rows={3} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Insufficient documentation, blacklisted category..."
                    value={verifyForm.rejectionReason}
                    onChange={e => setVerifyForm(f => ({ ...f, rejectionReason: e.target.value }))} />
                </div>
              )}

              {/* Blacklist option */}
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                <input type="checkbox" id="blacklist" className="w-4 h-4 accent-red-500"
                  checked={verifyForm.isBlacklisted}
                  onChange={e => setVerifyForm(f => ({ ...f, isBlacklisted: e.target.checked }))} />
                <label htmlFor="blacklist" className="text-sm text-red-300 cursor-pointer">Blacklist this brand (permanent block)</label>
              </div>
              {verifyForm.isBlacklisted && (
                <input className="w-full bg-black/30 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  placeholder="Reason for blacklisting..."
                  value={verifyForm.blacklistReason}
                  onChange={e => setVerifyForm(f => ({ ...f, blacklistReason: e.target.value }))} />
              )}

              {/* Admin note */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Admin Note (internal)</label>
                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  placeholder="Internal reference note..."
                  value={verifyForm.adminNote}
                  onChange={e => setVerifyForm(f => ({ ...f, adminNote: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all">Cancel</button>
              <button onClick={handleVerify} disabled={processing}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                {processing ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
