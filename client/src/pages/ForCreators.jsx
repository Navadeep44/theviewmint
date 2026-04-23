import { Link } from 'react-router-dom';
import { Camera, CheckCircle2, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

export default function ForCreators() {
  return (
    <div className="w-full animate-fade-in-up">
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center rounded-3xl bg-gradient-to-b from-purple-50 to-white border border-purple-100 mb-16 overflow-hidden relative">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] bg-purple-200 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Camera className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Get Paid For <br /> Every Single View
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Stop waiting for sponsorships. Pick a campaign, create an amazing Short or Reel, and watch the cash flow in directly proportional to your view count.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-purple-700 transition-all shadow-xl hover:-translate-y-1">
            Start Earning Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How TheViewMint Works</h2>
          <p className="text-gray-500">Three simple steps to monetize your influence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <CheckCircle2 className="w-8 h-8 text-blue-500" />,
              title: "1. Choose a Campaign",
              desc: "Browse hundreds of campaigns from premium brands. Find products or services that genuinely resonate with your audience."
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
              title: "2. Create & Submit",
              desc: "Upload your Instagram Reel or YouTube Short. Submit the link directly through your Creator Dashboard."
            },
            {
              icon: <DollarSign className="w-8 h-8 text-amber-500" />,
              title: "3. Earn Per View",
              desc: "Our systems automatically track your view count. You get paid for every view based on the campaign's specific Pay-Per-View rate."
            }
          ].map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-gray-900 text-white rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to scale your income?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of creators who are ditching flat-fee contracts and earning exactly what their reach is worth.
          </p>
          <Link to="/register" className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors inline-block">
            Create Your Creator Account
          </Link>
        </div>
      </section>
    </div>
  );
}
