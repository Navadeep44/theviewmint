import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join user room if logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.id || user?._id) {
        socket.emit('join_user_room', user.id || user._id);
      }
    });

    socket.on('disconnect', () => setConnected(false));

    // Global notification handler
    socket.on('submission_updated', ({ status, earnings }) => {
      if (status === 'approved') {
        toast.success(`🎉 Submission Approved! +₹${earnings} added to wallet`, { duration: 6000 });
      } else if (status === 'rejected') {
        toast.error('Submission rejected. Check notifications for details.', { duration: 6000 });
      }
    });

    socket.on('payout_received', ({ amount, upiId }) => {
      toast.success(`💸 ₹${amount} sent to ${upiId}!`, { duration: 8000 });
    });

    socket.on('broadcast_notification', ({ title, message }) => {
      toast(`📢 ${title}: ${message}`, { duration: 8000, icon: '📣' });
    });

    socket.on('account_status_changed', ({ status }) => {
      if (status === 'banned' || status === 'suspended') {
        toast.error(`Your account has been ${status}. Contact support.`, { duration: 10000 });
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
