import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, DollarSign, Users, Activity, SlidersHorizontal, Flame, Sparkles } from 'lucide-react';
import { FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/campaigns`);
      setCampaigns(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up pb-24">
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] text-white p-10 md:p-20 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
          {/* Noise overlay */}
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium tracking-wide text-gray-300">Premium Opportunities</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
            Find Your Next <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Viral Campaign
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-12 font-medium">
            Connect with top-tier brands. Pick a product, create an authentic review, and let our algorithm pay you for every single eyeball.
          </p>

          {/* Floating Search Bar */}
          <div className="flex w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-2 shadow-2xl focus-within:bg-white/15 transition-all">
            <div className="flex-1 flex items-center pl-6">
              <Search className="w-5 h-5 text-gray-400 hidden sm:block" />
              <input 
                type="text" 
                placeholder="Search campaigns, brands, or keywords..." 
                className="w-full bg-transparent border-none focus:outline-none text-white px-4 placeholder-gray-500 text-lg"
              />
            </div>
            <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        

        {/* Premium Campaigns Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64"><Activity className="w-12 h-12 animate-spin text-primary" /></div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white text-center p-20 rounded-[2rem] border border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No campaigns active right now.</h3>
              <p className="text-gray-500 mt-2 text-lg">Check back later or register as a brand to pioneer the platform!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {campaigns.map((camp, idx) => (
                <div key={camp._id} className="group bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col">
                  
                  {/* Glowing Top Border on Hover */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {/* Premium Brand Avatar mock */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-100 flex items-center justify-center text-xl font-black text-gray-800 shadow-inner shrink-0">
                        {'P'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-1">{camp.title}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">by Premium Brand</p>
                      </div>
                    </div>
                    {/* Platform Badge */}
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${
                      camp.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {camp.platform}
                    </span>
                  </div>

                  <p className="text-gray-600 text-[15px] mb-8 line-clamp-3 leading-relaxed flex-grow">
                    {camp.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                      <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wide"><Flame className="w-3.5 h-3.5 text-orange-500"/> Pay / 1k Views</p>
                      <p className="text-2xl font-black text-gray-900">₹{(camp.payPerView * 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                      <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wide"><DollarSign className="w-3.5 h-3.5 text-emerald-500"/> Total Target</p>
                      <p className="text-2xl font-black text-gray-900">₹{camp.budget.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <Link 
                    to={`/campaign/${camp._id}`}
                    className="w-full text-center bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-[0_5px_15px_rgba(0,0,0,0.15)] group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2"
                  >
                    View Details & Apply <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
