import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { CheckCircle2, XCircle, Clock, Eye, RefreshCw, FileVideo, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  under_review: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  approved:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected:     'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected]       = useState(null);
  const [reviewForm, setReviewForm]   = useState({ status: '', views: '', rejectionReason: '', adminNote: '' });
  const [processing, setProcessing]   = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/submissions', {
        params: { page, limit: 15, status: statusFilter || undefined }
      });
      setSubmissions(res.data.submissions);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load submissions.'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const openReview = (sub) => {
    setSelected(sub);
    setReviewForm({ status: sub.status, views: sub.views || '', rejectionReason: '', adminNote: '' });
  };

  const handleReview = async () => {
    if (!reviewForm.status) { toast.error('Select a status.'); return; }
    if (reviewForm.status === 'rejected' && !reviewForm.rejectionReason.trim()) {
      toast.error('Provide a rejection reason.');
      return;
    }
    setProcessing(true);
    try {
      await api.put(`/submissions/${selected._id}/review`, {
        status: reviewForm.status,
        views: reviewForm.views ? Number(reviewForm.views) : undefined,
        rejectionReason: reviewForm.rejectionReason,
        adminNote: reviewForm.adminNote,
      });
      toast.success(`Submission ${reviewForm.status}!`);
      setSelected(null);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Review failed.');
    } finally { setProcessing(false); }
  };

  const quickAction = async (subId, status) => {
    setProcessing(true);
    try {
      await api.put(`/submissions/${subId}/review`, { status });
      toast.success(`Submission ${status}!`);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Submission Review</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} submissions</p>
        </div>
        <button onClick={fetchSubmissions} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'pending', 'under_review', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === s ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {s === '' ? 'All' : s === 'under_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a28] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-5 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-48" />
                  <div className="h-3 bg-white/5 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center">
            <FileVideo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No submissions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {submissions.map(sub => (
              <div key={sub._id} className="p-5 hover:bg-white/2 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Creator avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sub.creator?.profileImage
                      ? <img src={sub.creator.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold">{(sub.creator?.name || 'C')[0]}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[sub.status]}`}>
                        {sub.status === 'under_review' ? 'In Review' : sub.status}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(sub.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{sub.creator?.name || 'Creator'}</p>
                    <p className="text-xs text-gray-400">
                      @{sub.creator?.username || sub.creator?.phone} ·{' '}
                      Campaign: <span className="text-gray-300">{sub.campaign?.title}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <a
                        href={sub.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Content <ExternalLink className="w-3 h-3" />
                      </a>
                      {sub.views > 0 && <span className="text-xs text-gray-500">{sub.views.toLocaleString()} views</span>}
                      {sub.earnings > 0 && <span className="text-xs text-emerald-400">₹{sub.earnings}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openReview(sub)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Full Review">
                      <Eye className="w-4 h-4" />
                    </button>
                    {sub.status === 'pending' && (
                      <>
                        <button
                          onClick={() => quickAction(sub._id, 'approved')}
                          disabled={processing}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
                          title="Quick Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openReview({ ...sub, _forceReject: true })}
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

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a28] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Review Submission</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            {/* Creator & Campaign Info */}
            <div className="bg-black/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-white font-semibold">{selected.creator?.name}</p>
              <p className="text-xs text-gray-400">Campaign: {selected.campaign?.title}</p>
              <a href={selected.videoLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2">
                View Submitted Content <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Review Decision *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['under_review', 'approved', 'rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => setReviewForm(f => ({ ...f, status: s }))}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                        reviewForm.status === s
                          ? s === 'approved'  ? 'bg-emerald-600 border-emerald-600 text-white'
                          : s === 'rejected' ? 'bg-red-600 border-red-600 text-white'
                          :                   'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {s === 'under_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Views (for approved) */}
              {reviewForm.status === 'approved' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Views Count (optional)</label>
                  <input
                    type="number" min="0"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="e.g. 50000"
                    value={reviewForm.views}
                    onChange={e => setReviewForm(f => ({ ...f, views: e.target.value }))}
                  />
                  {reviewForm.views && selected.campaign?.creatorPayout > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Creator will earn: ₹{selected.campaign.creatorPayout}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection reason */}
              {reviewForm.status === 'rejected' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Rejection Reason *</label>
                  <textarea
                    rows={3}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Content doesn't meet guidelines, wrong hashtags used..."
                    value={reviewForm.rejectionReason}
                    onChange={e => setReviewForm(f => ({ ...f, rejectionReason: e.target.value }))}
                  />
                </div>
              )}

              {/* Admin note */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Admin Note (internal)</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  placeholder="Internal note for reference..."
                  value={reviewForm.adminNote}
                  onChange={e => setReviewForm(f => ({ ...f, adminNote: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-all">Cancel</button>
              <button onClick={handleReview} disabled={processing}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                {processing ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
