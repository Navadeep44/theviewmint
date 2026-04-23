import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await handleFirebaseSuccess(userCredential.user);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
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
        <p className="text-gray-500 mt-2">Log in to your account</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 hover:-translate-y-0.5 pt-4">
          {loading ? 'Logging In...' : 'Log In'}
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
