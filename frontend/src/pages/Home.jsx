import React from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Refrigerator, Calendar, ArrowRight, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* Decorative background glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-brand-300 text-xs font-semibold mb-6 uppercase tracking-wider animate-bounce-slow">
          <Zap className="h-3.5 w-3.5 text-brand-400" />
          <span>Flexibility Redefined — Now Active in Major Cities</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-none">
          Live Better Now.<br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Rent Premium Assets
          </span>
          <br />on Your Own Terms.
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Furnish your home or office with high-end furniture and top-tier appliances. Cancel, extend, or return items whenever you want. Free delivery and setup included.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/catalog"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/20 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/40 hover:bg-slate-800/80 text-gray-300 hover:text-white border border-slate-700/50 font-semibold rounded-2xl transition-all duration-200"
          >
            Learn How It Works
          </a>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12">Select by Category</h2>
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Furniture Category Card */}
          <Link
            to="/catalog?category=Furniture"
            className="glass-premium p-8 rounded-3xl hover:scale-[1.01] hover:border-brand-500/30 group transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform duration-300 mb-6">
                <Sofa className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Furniture</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Beds, sofas, dining tables, chairs, and study setups. Handcrafted with high-density padding and solid materials.
              </p>
            </div>
            <span className="text-brand-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform duration-200">
              Browse Furniture <ArrowRight className="h-4 w-4 ml-1" />
            </span>
          </Link>

          {/* Appliances Category Card */}
          <Link
            to="/catalog?category=Appliances"
            className="glass-premium p-8 rounded-3xl hover:scale-[1.01] hover:border-brand-500/30 group transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300 mb-6">
                <Refrigerator className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Smart Appliances</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Energy-efficient refrigerators, 4K Smart TVs, fully automatic washing machines, microwave ovens, and air coolers.
              </p>
            </div>
            <span className="text-indigo-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform duration-200">
              Browse Appliances <ArrowRight className="h-4 w-4 ml-1" />
            </span>
          </Link>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <h2 className="text-3xl font-bold text-center mb-4">How RentEase Works</h2>
        <p className="text-gray-400 text-center max-w-xl mx-auto mb-16 text-sm">
          A modern rental experience mapped in four simple steps to fit your flexible lifestyle.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Step 1 */}
          <div className="glass p-6 rounded-2xl relative border-white/5">
            <div className="text-brand-500/30 font-black text-6xl absolute top-4 right-4">01</div>
            <div className="h-12 w-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-6">
              <Sofa className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">1. Browse Products</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Explore high-quality beds, sofas, refrigerators, smart TVs, and washing machines.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass p-6 rounded-2xl relative border-white/5">
            <div className="text-indigo-500/30 font-black text-6xl absolute top-4 right-4">02</div>
            <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
              <Calendar className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">2. Choose a Plan</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Select a rental tenure of 1, 3, 6, or 12 months. The monthly rate goes down for longer leases.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass p-6 rounded-2xl relative border-white/5">
            <div className="text-indigo-500/30 font-black text-6xl absolute top-4 right-4">03</div>
            <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">3. Schedule Delivery</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Add products to your cart, schedule a delivery date/slot, and complete the order. We deliver and install.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass p-6 rounded-2xl relative border-white/5">
            <div className="text-brand-500/30 font-black text-6xl absolute top-4 right-4">04</div>
            <div className="h-12 w-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-6">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">4. Flex & Service</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Track active leases, extend terms, request returns, or raise maintenance tickets instantly.
            </p>
          </div>

        </div>
      </section>

      {/* Security & Support Badging */}
      <section className="max-w-7xl mx-auto px-6 py-10 mb-10 relative z-10 bg-slate-900/40 rounded-3xl border border-white/5">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left items-center">
          <div className="flex flex-col items-center md:items-start p-4">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Fully Refundable Deposit</h4>
            <p className="text-gray-400 text-xs">Security deposits are locked safely and refunded 100% upon asset return pickup and approval.</p>
          </div>
          <div className="flex flex-col items-center md:items-start p-4 border-y md:border-y-0 md:border-x border-white/5">
            <Truck className="h-10 w-10 text-brand-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Complimentary Assembly</h4>
            <p className="text-gray-400 text-xs">Our team delivers, places, and mounts everything in your room with zero physical effort required from you.</p>
          </div>
          <div className="flex flex-col items-center md:items-start p-4">
            <RefreshCw className="h-10 w-10 text-indigo-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">24-Hour Maintenance Callback</h4>
            <p className="text-gray-400 text-xs">Raise a ticket on your dashboard. An engineer visits your house within 24 hours to replace or service your items.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
