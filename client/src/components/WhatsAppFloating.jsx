import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppFloating() {
  return (
    <a 
      href="https://whatsapp.com/channel/0029VbCIp6tAO7ROaf4edn27" 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-24 md:bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] flex items-center justify-center animate-bounce group"
    >
      <FaWhatsapp className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-gray-900 border border-gray-100 text-sm font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
        Join our Community
      </span>
    </a>
  );
}
