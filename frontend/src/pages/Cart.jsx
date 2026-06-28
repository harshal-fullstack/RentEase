import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Shield, HelpCircle, Calendar } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQuantity, updateCartTenure, removeFromCart, totalDeposit, totalMonthly } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-28 text-center animate-slide-up">
        <div className="h-20 w-20 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center text-slate-500 mx-auto mb-8 shadow-md">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Your Cart is Empty</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-semibold">
          Browse our collections of quality home furniture and appliances to start customizing your rental space.
        </p>
        <Link
          to="/catalog"
          className="px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 transition-all duration-200 inline-flex items-center space-x-2.5"
        >
          <span>Start Browsing</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 relative animate-slide-up">
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Title */}
      <div className="mb-14 text-center md:text-left">
        <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest font-display">Your Basket</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5">Shopping Cart</h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">Review your selections, adjust plans, and proceed to scheduled delivery.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {cart.map((item) => {
            const product = item.product;
            const pricePerMonth = product.pricing[item.tenure];

            return (
              <div
                key={`${item.productId}-${item.tenure}`}
                className="bg-[#111827]/40 p-6 rounded-3xl border border-white/10 hover:border-white/15 transition-all duration-350 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg"
              >
                {/* Product Detail Thumbnail */}
                <div className="flex items-center space-x-5 w-full md:w-auto">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-20 w-20 object-cover rounded-2xl bg-slate-900 border border-white/10 shrink-0 shadow-md"
                  />
                  <div>
                    <span className="text-[9px] font-extrabold text-violet-400 uppercase tracking-widest">{product.category}</span>
                    <h3 className="text-base font-extrabold text-white leading-snug line-clamp-1 mt-0.5">{product.name}</h3>
                    
                    <div className="text-xs text-slate-400 mt-2 flex items-center space-x-2 font-semibold">
                      <span>Deposit: ₹{product.deposit}</span>
                      <span className="text-slate-800">•</span>
                      <span>Inventory: {product.inventory}</span>
                    </div>
                  </div>
                </div>

                {/* Adjusters (Tenure Selector & Qty) */}
                <div className="flex flex-wrap items-center gap-5 w-full md:w-auto md:justify-end">
                  
                  {/* Tenure Select dropdown */}
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="h-4 w-4 text-violet-450" />
                    <select
                      value={item.tenure}
                      onChange={(e) => updateCartTenure(item.productId, item.tenure, Number(e.target.value))}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-extrabold focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-950/65 border border-white/15 rounded-xl p-0.5 shadow-inner">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity - 1)}
                      className="h-7 w-7 text-slate-450 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white text-xs font-extrabold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity + 1)}
                      className="h-7 w-7 text-slate-450 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
                      disabled={item.quantity >= product.inventory}
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing Total */}
                  <div className="text-right min-w-[80px] hidden md:block">
                    <span className="text-sm font-extrabold text-white block">₹{pricePerMonth * item.quantity}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">/mo</span>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.tenure)}
                    className="p-2.5 bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 border border-red-950/20 hover:border-red-500/20 rounded-xl transition-all duration-300 shadow-sm"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Summary Panel */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0f172a]/80 p-7 rounded-3xl border border-white/10 shadow-2xl">
            
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-sm">Lease Summary</h2>
            
            <div className="space-y-4.5 border-b border-white/5 pb-6 mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span className="text-slate-400">Monthly Rental Total</span>
                <span className="text-white font-extrabold">₹{totalMonthly}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span className="text-slate-400 flex items-center">
                  Total Security Deposit
                  <HelpCircle className="h-3.5 w-3.5 ml-1.5 text-slate-500 cursor-help" title="Fully refunded when pickup order is confirmed" />
                </span>
                <span className="text-white font-extrabold">₹{totalDeposit}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span className="text-slate-400">Delivery & Assembly</span>
                <span className="text-emerald-450 font-extrabold uppercase text-[9px] tracking-widest bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-0.5 rounded-lg shadow-sm">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-widest">First Payment Due</span>
              <div className="text-right">
                <span className="text-2xl font-black text-violet-400">₹{totalMonthly + totalDeposit}</span>
                <span className="text-[8px] text-slate-500 block font-extrabold tracking-wider uppercase mt-1">Deposit + 1st Month Rent</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl py-4 flex items-center justify-center space-x-2.5 shadow-2xl shadow-violet-600/25 hover:shadow-violet-600/35 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            <div className="mt-6 p-4.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-start space-x-3 shadow-inner">
              <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">RentEase Guarantee</span>
                <span className="text-[10px] text-slate-400 leading-relaxed block mt-1 font-semibold">
                  Secure deposit lockers. Free returns with no hidden cancellation fees. Upgrade plans at any time.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
