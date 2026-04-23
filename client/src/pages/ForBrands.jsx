import { Link } from 'react-router-dom';
import { Briefcase, Target, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function ForBrands() {
  return (
    <div className="w-full animate-fade-in-up">
      {/* Hero */}
      <section className="py-20 md:py-32 rounded-3xl bg-black text-white mb-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
        
        <div className="max-w-4xl px-8 md:px-16 relative z-10">
          <Briefcase className="w-12 h-12 text-blue-500 mb-6" />
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Pay Only For <span className="text-blue-500">Results.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            Launch massive influencer campaigns instantly. Set your budget, define your Pay-Per-View rate, and let creators compete to get your brand seen.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)]">
            Post a Campaign <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats/Benefits */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <Target className="w-10 h-10 text-rose-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Zero Risk Advertising</h3>
            <p className="text-gray-600">You only pay when your product is actually viewed. Say goodbye to upfront fees for influencers who underperform.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <Zap className="w-10 h-10 text-amber-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Viral Potential</h3>
            <p className="text-gray-600">Creators are incentivized to make the most engaging content possible, maximizing their payouts and your visibility.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Full Control</h3>
            <p className="text-gray-600">Approve or reject submissions before they go live. Cap your total budget so you never overspend.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="bg-gray-50 rounded-3xl p-8 md:p-16 border border-gray-100 mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Powerful Campaign Management</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our intuitive dashboard lets you launch a global marketing campaign in minutes. Track exactly which creators are driving the most views, approve content effortlessly, and manage your ROI in real-time.
            </p>
            <ul className="space-y-4">
              {['Smart budgeting tools', 'Real-time analytics integration', 'Direct messaging with creators', 'Automated payouts'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-gray-800">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gray-100 p-3 border-b flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-6">
                <div className="w-1/2 h-6 bg-gray-200 rounded-md mb-6"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-blue-50 border border-blue-100 rounded-xl"></div>
                  <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl"></div>
                  <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
