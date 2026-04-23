import { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

export default function WhatsAppPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const hasSeen = localStorage.getItem('hasSeenWhatsappPopup');
    
    // Only show if user is logged in and hasn't seen the popup yet
    if (token && !hasSeen) {
      // Small delay so it feels like a natural pop-up after dashboard load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWhatsappPopup', 'true');
  };

  const handleJoin = () => {
    window.open('https://whatsapp.com/channel/0029VbCIp6tAO7ROaf4edn27', '_blank');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-overlay">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center border-t-8 border-green-500 transform transition-all scale-100 animate-slide-up-overlay">
        
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FaWhatsapp className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Join Our Community</h2>
        <p className="text-gray-600 mb-8 font-medium">Get instant updates on high-paying campaigns, brand drops, and exclusive tips right in your WhatsApp!</p>

        <div className="space-y-3">
          <button 
            onClick={handleJoin}
            className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-600 transition-colors shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 text-lg"
          >
            <FaWhatsapp className="w-6 h-6" /> Join WhatsApp Channel
          </button>
          <button 
            onClick={handleClose}
            className="w-full bg-white text-gray-500 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}
