import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Phone, User } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const InstagramIcon = () => (
  <FaInstagram className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
);

const YoutubeIcon = () => (
  <FaYoutube className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
);

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instagram: '',
    youtube: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFirebaseGoogleSuccess = async (firebaseUser) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/firebase`, {
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Creator',
        profileImage: firebaseUser.photoURL || ''
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/creator-dashboard');
    } catch (err) {
      setError('Failed to authenticate with server');
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseGoogleSuccess(result.user);
    } catch (err) {
      setError('Google sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMsg91Success = async (msg91Token) => {
    try {
      const payload = {
        name: formData.name,
        msg91Token,
        instagramHandle: formData.instagram,
        youtubeChannel: formData.youtube
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/msg91`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/creator-dashboard');
    } catch (err) {
      setError('Invalid OTP code or Server Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formattedPhone = formData.phone.startsWith('+') ? formData.phone.replace('+', '') : `91${formData.phone}`;

    if (window.initSendOTP) {
      window.initSendOTP({
        widgetId: "3664776d7149353331343032",
        tokenAuth: "YOUR_MSG91_WIDGET_TOKEN", // Will be passed via env if needed or hardcoded
        identifier: formattedPhone,
        success: (data) => {
          if (data && data.message) {
            handleMsg91Success(data.message);
          } else {
            setIsSubmitting(false);
            setError('Invalid response from MSG91');
          }
        },
        failure: (error) => {
          setIsSubmitting(false);
          console.error(error);
          setError('OTP verification failed.');
        }
      });
    } else {
      setIsSubmitting(false);
      setError('MSG91 script failed to load. Please refresh.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Join TheViewMint</h2>
        <p className="text-gray-500 mt-2">Start your creator journey today</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

      <form onSubmit={handleSendOtp} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
              +91
            </span>
            <div className="relative flex-1">
              <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                className="w-full pl-10 pr-4 py-3 rounded-r-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (@)</label>
            <div className="relative">
              <InstagramIcon />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="handle"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube (@)</label>
            <div className="relative">
              <YoutubeIcon />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="channel"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 mt-4">
          {isSubmitting ? 'Sending OTP...' : 'Send OTP via MSG91'}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleGoogleSignup}
        className="w-full mt-6 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <FcGoogle className="w-5 h-5" />
        Sign up with Google
      </button>

      <p className="text-center mt-6 text-gray-600 text-sm">
        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
}
