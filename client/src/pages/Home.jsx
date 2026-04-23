import { useState, useEffect } from 'react';
import { ArrowRight, Play, Upload, DollarSign, Search, BarChart3, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TABS = [
  { id: 'discover', label: 'Discover', icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'create', label: 'Create', icon: Upload, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'track', label: 'Track', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'earn', label: 'Earn', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({ creators: 0, brands: 0, campaigns: 0 });

  useEffect(() => {
    // Auto-rotate tabs for preview
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % TABS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Could not fetch platform stats.");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-xs md:text-sm mb-6 md:mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-primary"></span>
          </span>
          The New Standard for Performance Marketing
        </div>
        <h1 className="text-4xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 md:mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Turn Your Views Into Income. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Create. Post. Get Paid.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-8 md:mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Join TheViewMint and earn money by creating Instagram Reels and YouTube Shorts for brands.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {localStorage.getItem('token') && JSON.parse(localStorage.getItem('user')) ? (
            <Link to="/creator-dashboard" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link to="/register" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Start Earning Now <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Live Platform Stats Ribbon */}
      <section className="max-w-6xl mx-auto px-4 mb-16 md:mb-24 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-12 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-pink-50 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 divide-x-0 md:divide-x divide-gray-100">
            <div className="text-center px-2 md:px-4">
              <p className="text-3xl md:text-5xl font-black text-gray-900 mb-1 md:mb-2">
                {stats.creators > 0 ? `${stats.creators}+` : '100+'}
              </p>
              <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px] md:text-sm">Active Creators</p>
            </div>
            <div className="text-center px-2 md:px-4">
              <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 mb-1 md:mb-2">
                {stats.brands > 0 ? `${stats.brands}+` : '50+'}
              </p>
              <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px] md:text-sm">Onboarded Brands</p>
            </div>
            <div className="text-center px-2 md:px-4 col-span-2 md:col-span-1 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100">
              <p className="text-3xl md:text-5xl font-black text-gray-900 mb-1 md:mb-2">
                {stats.campaigns > 0 ? `${stats.campaigns}+` : '500+'}
              </p>
              <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px] md:text-sm">Live Campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-2 md:gap-4 mb-8 md:mb-12 pb-4 scrollbar-hide snap-x">
            {TABS.map((tab, idx) => {
              const active = activeTab === idx;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`snap-center shrink-0 flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-4 rounded-full font-medium transition-all ${
                    active 
                      ? 'bg-primary text-white shadow-lg scale-105' 
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${active ? 'text-white' : tab.color}`} />
                  <span className="text-sm md:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Area */}
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-auto md:aspect-[21/9] flex items-center justify-center border border-gray-800">
            {/* Mock Dashboard UI corresponding to tabs */}
            <div className="absolute inset-0 w-full h-full p-4 md:p-8 flex flex-col justify-center items-center">
              
              {activeTab === 0 && (
                <div key="discover" className="animate-fade-in-overlay w-full max-w-2xl bg-white/10 glass-dark rounded-2xl p-4 md:p-6 text-white text-left shadow-2xl overflow-y-auto max-h-full">
                  <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2"><Search className="text-blue-400 w-5 h-5"/> Premium Campaigns</h3>
                  <div className="space-y-3 md:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-3 md:p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 sm:mb-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                            <span className="font-bold text-blue-400 text-sm md:text-base">B{i}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm md:text-base">Tech Review #{i}</h4>
                            <p className="text-xs md:text-sm text-gray-400">TikTok • 10M+ Reach Goal</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto flex sm:block justify-between items-center">
                          <p className="font-medium text-emerald-400 text-sm md:text-base">₹3.00 / 1k views</p>
                          <p className="text-xs text-gray-500 hidden sm:block">Apply Now</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div key="create" className="animate-slide-up-overlay w-full max-w-xl bg-white/10 glass-dark rounded-2xl p-6 md:p-8 text-white text-center shadow-2xl border border-white/10">
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Upload Your Reel</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8">Paste your Instagram Reel or YouTube Short URL</p>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input type="text" placeholder="https://instagram.com/reel/..." className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm" readOnly />
                    <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 font-medium px-6 py-3 rounded-xl transition-colors text-sm">Submit</button>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div key="track" className="animate-fade-in-overlay w-full max-w-3xl bg-white/10 glass-dark rounded-2xl p-4 md:p-6 text-white shadow-2xl border border-white/10 overflow-y-auto max-h-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2"><BarChart3 className="text-emerald-400 w-5 h-5"/> Analytics</h3>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs md:text-sm">+24% this week</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-black/40 p-3 md:p-4 rounded-xl border border-white/5">
                      <p className="text-gray-400 text-xs md:text-sm mb-1">Total Views</p>
                      <p className="text-xl md:text-3xl font-bold">1.2M</p>
                    </div>
                    <div className="bg-black/40 p-3 md:p-4 rounded-xl border border-white/5">
                      <p className="text-gray-400 text-xs md:text-sm mb-1">Engagement</p>
                      <p className="text-xl md:text-3xl font-bold">8.4%</p>
                    </div>
                    <div className="bg-black/40 p-3 md:p-4 rounded-xl border border-white/5 col-span-2 md:col-span-1">
                      <p className="text-gray-400 text-xs md:text-sm mb-1">Active Campaigns</p>
                      <p className="text-xl md:text-3xl font-bold">4</p>
                    </div>
                  </div>
                  {/* Mock Chart Area */}
                  <div className="h-20 md:h-32 w-full flex items-end gap-1 md:gap-2 px-1 md:px-2">
                    {[40, 60, 45, 80, 50, 90, 75, 100, 85, 95, 60, 70, 85, 120].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div key="earn" className="animate-slide-up-overlay w-full max-w-sm bg-gradient-to-br from-amber-600 to-orange-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                  <p className="text-amber-200 font-medium mb-1 text-sm md:text-base">Available Balance</p>
                  <h3 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8">₹4,250.00</h3>
                  
                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-sm md:text-base">
                    <div className="flex justify-between items-center border-b border-amber-500/30 pb-2 md:pb-3">
                      <span className="text-amber-100">Tech Review #1</span>
                      <span className="font-medium">+₹1,200.00</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-amber-500/30 pb-2 md:pb-3">
                      <span className="text-amber-100">Fashion Haul</span>
                      <span className="font-medium">+₹850.00</span>
                    </div>
                  </div>

                  <button className="w-full bg-white text-orange-900 font-bold py-3 md:py-4 rounded-xl hover:bg-amber-50 transition-colors shadow-lg text-sm md:text-base">
                    Withdraw Funds
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-gray-200">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Mail className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Want to promote your brand with creators?</h2>
          <p className="text-base md:text-xl text-gray-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Reach out to us to launch your campaign on TheViewMint. We connect you with top creators to drive real performance.
          </p>
          <a href="mailto:admin@theviewmint.in" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-bold hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1">
            <Mail className="w-5 h-5" /> admin@theviewmint.in
          </a>
        </div>
      </section>

    </div>
  );
}
