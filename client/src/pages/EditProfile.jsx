import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, AlignLeft, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';

export default function EditProfile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    instagramHandle: '',
    youtubeChannel: '',
  });
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
        const profile = res.data;
        setFormData({
          name: profile.name || '',
          bio: profile.bio || '',
          instagramHandle: profile.instagramHandle || '',
          youtubeChannel: profile.youtubeChannel || '',
        });
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local storage user data
      const updatedUser = { ...user, name: res.data.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile', error);
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
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" /> Full Name
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-emerald-600" /> Bio
              </label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="I am a lifestyle creator..."
                rows="3"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Social Links</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaInstagram className="w-4 h-4 text-pink-600" /> Instagram Handle
              </label>
              <input 
                type="text" 
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleChange}
                placeholder="@yourhandle"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaYoutube className="w-4 h-4 text-red-600" /> YouTube Channel URL
              </label>
              <input 
                type="url" 
                name="youtubeChannel"
                value={formData.youtubeChannel}
                onChange={handleChange}
                placeholder="https://youtube.com/c/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-gray-900 text-white rounded-full py-4 font-bold text-lg hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
