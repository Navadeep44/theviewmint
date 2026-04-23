import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, CreditCard, Save, ShieldCheck } from 'lucide-react';

export default function PaymentMethods() {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.upiId) {
          setUpiId(res.data.upiId);
        }
      } catch (error) {
        console.error('Error fetching payment methods', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, { upiId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error saving payment methods', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in-up">
      <div className="bg-white px-4 py-6 shadow-sm border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Payment Methods</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">Secure Payments</h4>
            <p className="text-blue-700 text-sm mt-0.5 leading-tight">
              We process all payouts via UPI. Please ensure your UPI ID is correct to avoid payment delays.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Primary UPI ID
            </label>
            <input 
              type="text" 
              name="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Encrypted and stored securely
            </p>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-emerald-600 text-white rounded-full py-4 font-bold text-lg hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Save Details</>}
          </button>
        </form>
      </div>
    </div>
  );
}
