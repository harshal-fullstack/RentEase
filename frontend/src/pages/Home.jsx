import React from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Refrigerator, Calendar, ArrowRight, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      
      {/* Premium glowing background blobs */}
      <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 md:pt-36 pb-24 text-center relative z-10 animate-slide-up">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/25 px-5 py-2 rounded-full text-violet-300 text-[10px] font-extrabold uppercase tracking-widest mb-10 shadow-lg shadow-violet-950/20">
          <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Flexibility Redefined — Active in Major Metros</span>
        </div>
        
        {/* Main Hero Header */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05] text-white">
          Live Better Now.<br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Rent Premium Assets
          </span>
          <br />on Your Own Terms.
        </h1>
        
        {/* Sub-text */}
        <p className="text-slate-400 text-base md:text-xl max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
          Furnish your home or office with high-end furniture and top-tier appliances. Cancel, extend, or return items whenever you want. Free delivery and setup included.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-md mx-auto sm:max-w-none">
          <Link
            to="/catalog"
            className="w-full sm:w-auto px-9 py-4.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/40 flex items-center justify-center space-x-2.5 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 text-sm"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-9 py-4.5 bg-[#0f172a]/45 hover:bg-[#0f172a]/80 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 font-extrabold rounded-2xl transition-all duration-300 flex items-center justify-center text-sm shadow-md"
          >
            Learn How It Works
          </a>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-20">
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest">Collections</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-2 mb-4">Select by Category</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">Pick a class of premium assets curated specifically for modern lifestyles.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Furniture Category Card */}
          <Link
            to="/catalog?category=Furniture"
            className="premium-card-hover bg-[#0f172a]/40 border border-white/10 p-10 md:p-12 rounded-3xl group flex flex-col justify-between"
          >
            <div>
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-450 group-hover:scale-115 group-hover:bg-violet-500/20 transition-all duration-350 mb-10 shadow-inner">
                <Sofa className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-4">Premium Furniture</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                Beds, sofas, dining tables, chairs, and study setups. Handcrafted with high-density padding and solid materials.
              </p>
            </div>
            <span className="text-violet-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-2 transition-transform duration-300">
              Browse Furniture <ArrowRight className="h-4.5 w-4.5 ml-2 text-violet-500" />
            </span>
          </Link>

          {/* Appliances Category Card */}
          <Link
            to="/catalog?category=Appliances"
            className="premium-card-hover bg-[#0f172a]/40 border border-white/10 p-10 md:p-12 rounded-3xl group flex flex-col justify-between"
          >
            <div>
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-450 group-hover:scale-115 group-hover:bg-indigo-500/20 transition-all duration-350 mb-10 shadow-inner">
                <Refrigerator className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-4">Smart Appliances</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                Energy-efficient refrigerators, 4K Smart TVs, fully automatic washing machines, microwave ovens, and air coolers.
              </p>
            </div>
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-2 transition-transform duration-300">
              Browse Appliances <ArrowRight className="h-4.5 w-4.5 ml-2 text-indigo-500" />
            </span>
          </Link>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-28 relative z-10 border-t border-white/5">
        <div className="text-center mb-24">
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest">Seamless Leases</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-2 mb-4">How RentEase Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed font-medium">
            A modern, digital rental experience mapped in four simple steps to fit your flexible lifestyle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Step 1 */}
          <div className="bg-[#0f172a]/30 p-8 rounded-3xl relative border border-white/5 hover:border-violet-500/20 transition-all duration-350 group shadow-md">
            <div className="text-violet-500/5 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none group-hover:scale-110 transition-transform duration-300">01</div>
            <div className="h-12 w-12 bg-violet-500/10 border border-violet-500/25 rounded-xl flex items-center justify-center text-violet-400 mb-8 relative z-10">
              <Sofa className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 relative z-10">Browse Products</h4>
            <p className="text-slate-400 text-xs leading-relaxed relative z-10 font-medium">
              Explore high-quality beds, sofas, refrigerators, smart TVs, and washing machines.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0f172a]/30 p-8 rounded-3xl relative border border-white/5 hover:border-indigo-500/20 transition-all duration-350 group shadow-md">
            <div className="text-indigo-500/5 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none group-hover:scale-110 transition-transform duration-300">02</div>
            <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-400 mb-8 relative z-10">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 relative z-10">Choose a Plan</h4>
            <p className="text-slate-400 text-xs leading-relaxed relative z-10 font-medium">
              Select a rental tenure of 1, 3, 6, or 12 months. The monthly rate goes down for longer leases.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0f172a]/30 p-8 rounded-3xl relative border border-white/5 hover:border-cyan-500/20 transition-all duration-350 group shadow-md">
            <div className="text-cyan-500/5 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none group-hover:scale-110 transition-transform duration-300">03</div>
            <div className="h-12 w-12 bg-cyan-500/10 border border-cyan-500/25 rounded-xl flex items-center justify-center text-cyan-455 mb-8 relative z-10">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 relative z-10">Schedule Delivery</h4>
            <p className="text-slate-400 text-xs leading-relaxed relative z-10 font-medium">
              Add products to your cart, schedule a delivery date/slot, and complete the order. We deliver and install.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0f172a]/30 p-8 rounded-3xl relative border border-white/5 hover:border-pink-500/20 transition-all duration-350 group shadow-md">
            <div className="text-pink-500/5 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none group-hover:scale-110 transition-transform duration-300">04</div>
            <div className="h-12 w-12 bg-pink-500/10 border border-pink-500/25 rounded-xl flex items-center justify-center text-pink-400 mb-8 relative z-10">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 relative z-10">Flex & Service</h4>
            <p className="text-slate-400 text-xs leading-relaxed relative z-10 font-medium">
              Track active leases, extend terms, request returns, or raise maintenance tickets instantly.
            </p>
          </div>

        </div>
      </section>

      {/* Security & Support Badging */}
      <section className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <div className="bg-gradient-to-tr from-[#0f172a]/80 to-[#0b111e]/90 p-10 md:p-14 rounded-3xl border border-white/10 grid md:grid-cols-3 gap-12 shadow-2xl">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-5 shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-extrabold text-white mb-2.5">Fully Refundable Deposit</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Security deposits are locked safely and refunded 100% upon asset return pickup and approval.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left border-y md:border-y-0 md:border-x border-white/5 py-10 md:py-0 md:px-12">
            <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 mb-5 shadow-sm">
              <Truck className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-extrabold text-white mb-2.5">Complimentary Assembly</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Our team delivers, places, and mounts everything in your room with zero physical effort required from you.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-5 shadow-sm">
              <RefreshCw className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-extrabold text-white mb-2.5">24-Hour Service Guarantee</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Raise a ticket on your dashboard. An engineer visits your house within 24 hours to replace or service your items.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
