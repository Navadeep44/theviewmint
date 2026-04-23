import { ArrowLeft, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in-up">
      <div className="bg-white px-4 py-6 shadow-sm border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <BellOff className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
        <p className="text-gray-500">We'll let you know when campaigns are approved or payouts are processed.</p>
        
        <button 
          onClick={() => navigate('/campaigns')}
          className="mt-8 bg-primary text-white rounded-full py-3 px-8 font-bold hover:bg-gray-900 transition-all shadow-md"
        >
          Browse Campaigns
        </button>
      </div>
    </div>
  );
}
