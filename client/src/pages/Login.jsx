import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Phone } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMsg91Success = async (msg91Token) => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/msg91`, {
        msg91Token
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/creator-dashboard');
    } catch (err) {
      setError('Failed to authenticate with server. ' + (err.response?.data?.error || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.replace('+', '') : `91${phoneNumber}`;

    if (window.initSendOTP) {
      window.initSendOTP({
        widgetId: "3664776d7149353331343032",
        tokenAuth: "YOUR_MSG91_WIDGET_TOKEN", // Will be passed via env if needed or hardcoded
        identifier: formattedPhone,
        success: (data) => {
          // data.message contains the JWT token
          if (data && data.message) {
            handleMsg91Success(data.message);
          } else {
            setLoading(false);
            setError('Invalid response from MSG91');
          }
        },
        failure: (error) => {
          setLoading(false);
          console.error(error);
          setError('OTP verification failed.');
        }
      });
    } else {
      setLoading(false);
      setError('MSG91 script failed to load. Please refresh.');
    }
  };

  const handleFirebaseSuccess = async (firebaseUser) => {
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseSuccess(result.user);
    } catch (err) {
      setError('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-2">Log in with your phone number</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

      <form onSubmit={handleSendOtp} className="space-y-5">
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
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        </div>
        <button disabled={loading} type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 pt-4">
          {loading ? 'Verifying...' : 'Send OTP via MSG91'}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="w-full mt-6 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </button>

      <p className="text-center mt-6 text-gray-600 text-sm">
        Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
