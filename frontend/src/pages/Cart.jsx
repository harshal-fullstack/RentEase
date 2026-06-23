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
    <div className="max-w-7xl mx-auto px-6 py-12 relative animate-slide-up">
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Shopping Cart</h1>
        <p className="text-slate-400 text-sm mt-2 font-semibold">Review your selections, adjust plans, and proceed to scheduled delivery.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {cart.map((item) => {
            const product = item.product;
            const pricePerMonth = product.pricing[item.tenure];

            return (
              <div
                key={`${item.productId}-${item.tenure}`}
                className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Product Detail Thumbnail */}
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-20 w-20 object-cover rounded-2xl bg-slate-900 border border-white/10 shrink-0"
                  />
                  <div>
                    <span className="text-[9px] font-extrabold text-brand-400 uppercase tracking-widest">{product.category}</span>
                    <h3 className="text-base font-extrabold text-white leading-snug line-clamp-1 mt-0.5">{product.name}</h3>
                    
                    <div className="text-xs text-slate-400 mt-1.5 flex items-center space-x-2 font-semibold">
                      <span>Deposit: ₹{product.deposit}</span>
                      <span>•</span>
                      <span>Inventory: {product.inventory}</span>
                    </div>
                  </div>
                </div>

                {/* Adjusters (Tenure Selector & Qty) */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
                  
                  {/* Tenure Select dropdown */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-brand-400" />
                    <select
                      value={item.tenure}
                      onChange={(e) => updateCartTenure(item.productId, item.tenure, Number(e.target.value))}
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5 shadow-inner">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity - 1)}
                      className="h-7 w-7 text-slate-400 hover:text-white flex items-center justify-center font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity + 1)}
                      className="h-7 w-7 text-slate-400 hover:text-white flex items-center justify-center font-bold transition-colors"
                      disabled={item.quantity >= product.inventory}
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing Total */}
                  <div className="text-right min-w-[70px] hidden md:block">
                    <span className="text-sm font-extrabold text-white block">₹{pricePerMonth * item.quantity}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">/mo</span>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.tenure)}
                    className="p-2.5 bg-red-955/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-900/30 rounded-xl transition-all duration-205"
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
          <div className="glass-premium p-6.5 rounded-3xl border border-white/10 shadow-xl">
            
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">Lease Summary</h2>
            
            <div className="space-y-4 border-b border-white/5 pb-5 mb-5">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span className="text-slate-400">Monthly Rental Total</span>
                <span className="text-white font-extrabold">₹{totalMonthly}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span className="text-slate-400 flex items-center">
                  Total Security Deposit
                  <HelpCircle className="h-3.5 w-3.5 ml-1.5 text-slate-500 cursor-help" title="Fully refunded when pickup order is confirmed" />
                </span>
                <span className="text-white font-extrabold">₹{totalDeposit}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span className="text-slate-400">Delivery & Assembly</span>
                <span className="text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded shadow-sm">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-7">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">First Payment Due</span>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-400">₹{totalMonthly + totalDeposit}</span>
                <span className="text-[9px] text-slate-500 block font-semibold mt-1">Refundable deposit + 1st month rent</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl py-4 flex items-center justify-center space-x-2.5 shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            <div className="mt-6 p-4 bg-slate-955/40 border border-white/5 rounded-2xl flex items-start space-x-3 shadow-inner">
              <Shield className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
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
