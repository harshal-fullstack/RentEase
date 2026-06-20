import React from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Refrigerator, Calendar, ArrowRight, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      
      {/* Premium glowing background blobs */}
      <div className="absolute top-1/6 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 pb-20 text-center relative z-10 animate-slide-up">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-4.5 py-1.5 rounded-full text-brand-300 text-xs font-bold mb-8 uppercase tracking-widest animate-bounce-slow">
          <Zap className="h-3.5 w-3.5 text-brand-400" />
          <span>Flexibility Redefined — Active in Major Metros</span>
        </div>
        
        {/* Main Hero Header */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05] text-white">
          Live Better Now.<br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Rent Premium Assets
          </span>
          <br />on Your Own Terms.
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-400 text-base md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          Furnish your home or office with high-end furniture and top-tier appliances. Cancel, extend, or return items whenever you want. Free delivery and setup included.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 max-w-md mx-auto sm:max-w-none">
          <Link
            to="/catalog"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center justify-center space-x-2.5 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 font-bold rounded-2xl transition-all duration-200 flex items-center justify-center"
          >
            Learn How It Works
          </a>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Select by Category</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Pick a class of premium assets curated specifically for modern lifestyles.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Furniture Category Card */}
          <Link
            to="/catalog?category=Furniture"
            className="glass-premium p-10 rounded-3xl hover:scale-[1.01] hover:border-brand-500/40 group transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 group-hover:bg-brand-500/20 transition-all duration-350 mb-8">
                <Sofa className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-3">Premium Furniture</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Beds, sofas, dining tables, chairs, and study setups. Handcrafted with high-density padding and solid materials.
              </p>
            </div>
            <span className="text-brand-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-1.5 transition-transform duration-250">
              Browse Furniture <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
            </span>
          </Link>

          {/* Appliances Category Card */}
          <Link
            to="/catalog?category=Appliances"
            className="glass-premium p-10 rounded-3xl hover:scale-[1.01] hover:border-indigo-500/40 group transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-350 mb-8">
                <Refrigerator className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-3">Smart Appliances</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Energy-efficient refrigerators, 4K Smart TVs, fully automatic washing machines, microwave ovens, and air coolers.
              </p>
            </div>
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-1.5 transition-transform duration-250">
              Browse Appliances <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
            </span>
          </Link>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">How RentEase Works</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            A modern, digital rental experience mapped in four simple steps to fit your flexible lifestyle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="glass p-8 rounded-2xl relative border-white/5 hover:border-brand-500/20 transition-colors duration-300">
            <div className="text-brand-500/10 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none">01</div>
            <div className="h-12 w-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-8 relative z-10">
              <Sofa className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3 relative z-10">1. Browse Products</h4>
            <p className="text-gray-400 text-xs leading-relaxed relative z-10">
              Explore high-quality beds, sofas, refrigerators, smart TVs, and washing machines.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass p-8 rounded-2xl relative border-white/5 hover:border-indigo-500/20 transition-colors duration-300">
            <div className="text-indigo-500/10 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none">02</div>
            <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-8 relative z-10">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3 relative z-10">2. Choose a Plan</h4>
            <p className="text-gray-400 text-xs leading-relaxed relative z-10">
              Select a rental tenure of 1, 3, 6, or 12 months. The monthly rate goes down for longer leases.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass p-8 rounded-2xl relative border-white/5 hover:border-cyan-500/20 transition-colors duration-300">
            <div className="text-cyan-500/10 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none">03</div>
            <div className="h-12 w-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-8 relative z-10">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3 relative z-10">3. Schedule Delivery</h4>
            <p className="text-gray-400 text-xs leading-relaxed relative z-10">
              Add products to your cart, schedule a delivery date/slot, and complete the order. We deliver and install.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass p-8 rounded-2xl relative border-white/5 hover:border-pink-500/20 transition-colors duration-300">
            <div className="text-pink-500/10 font-black text-8xl absolute top-4 right-4 pointer-events-none select-none">04</div>
            <div className="h-12 w-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-8 relative z-10">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3 relative z-10">4. Flex & Service</h4>
            <p className="text-gray-400 text-xs leading-relaxed relative z-10">
              Track active leases, extend terms, request returns, or raise maintenance tickets instantly.
            </p>
          </div>

        </div>
      </section>

      {/* Security & Support Badging */}
      <section className="max-w-7xl mx-auto px-6 py-4 relative z-10">
        <div className="glass-premium p-10 md:p-12 rounded-3xl border border-white/10 grid md:grid-cols-3 gap-10">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Fully Refundable Deposit</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Security deposits are locked safely and refunded 100% upon asset return pickup and approval.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left border-y md:border-y-0 md:border-x border-white/10 py-8 md:py-0 md:px-10">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-400 mb-4">
              <Truck className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Complimentary Assembly</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Our team delivers, places, and mounts everything in your room with zero physical effort required from you.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4">
              <RefreshCw className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">24-Hour Callback</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Raise a ticket on your dashboard. An engineer visits your house within 24 hours to replace or service your items.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
