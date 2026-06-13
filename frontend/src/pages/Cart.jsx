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
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="h-16 w-16 bg-slate-900 rounded-3xl flex items-center justify-center text-gray-500 mx-auto mb-6 border border-white/5">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
          Browse our collections of quality home furniture and appliances to start customizing your rental space.
        </p>
        <Link
          to="/catalog"
          className="px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-200 inline-flex items-center space-x-2"
        >
          <span>Start Browsing</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white">Shopping Cart</h1>
        <p className="text-gray-400 text-sm mt-1">Review your selections, adjust plans, and proceed to scheduled delivery</p>
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
                className="glass p-5 md:p-6 rounded-3xl border-white/5 hover:border-white/10 transition-colors duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Product Detail Thumbnail */}
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-20 w-20 object-cover rounded-2xl bg-slate-900 border border-white/5 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-1">{product.name}</h3>
                    
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                      <span>Deposit: ₹{product.deposit}</span>
                      <span>•</span>
                      <span>Stock: {product.inventory}</span>
                    </div>
                  </div>
                </div>

                {/* Adjusters (Tenure Selector & Qty) */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
                  
                  {/* Tenure Select dropdown */}
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4 text-brand-400" />
                    <select
                      value={item.tenure}
                      onChange={(e) => updateCartTenure(item.productId, item.tenure, Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity - 1)}
                      className="h-7 w-7 text-gray-400 hover:text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity + 1)}
                      className="h-7 w-7 text-gray-400 hover:text-white flex items-center justify-center font-bold"
                      disabled={item.quantity >= product.inventory}
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing Total */}
                  <div className="text-right min-w-[70px] hidden md:block">
                    <span className="text-sm font-extrabold text-white block">₹{pricePerMonth * item.quantity}</span>
                    <span className="text-[10px] text-gray-500">/mo</span>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.tenure)}
                    className="p-2.5 bg-red-950/20 hover:bg-red-900/30 border border-red-500/10 hover:border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200"
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
          <div className="glass-premium p-6 rounded-3xl border border-brand-500/10">
            
            <h2 className="text-lg font-bold text-white mb-4">Lease Summary</h2>
            
            <div className="space-y-3.5 border-b border-white/5 pb-4 mb-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Monthly Rental Total</span>
                <span className="text-white font-semibold">₹{totalMonthly}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span className="flex items-center">
                  Total Security Deposit
                  <HelpCircle className="h-3.5 w-3.5 ml-1 text-gray-500 cursor-help" title="Fully refunded when pickup order is confirmed" />
                </span>
                <span className="text-white font-semibold">₹{totalDeposit}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Delivery & Setup</span>
                <span className="text-emerald-400 font-semibold uppercase text-xs">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-white">First Payment Due</span>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-400">₹{totalMonthly + totalDeposit}</span>
                <span className="text-[9px] text-gray-500 block">Refundable deposit + 1st month rent</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl py-4 flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-6 p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-start space-x-2.5">
              <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-xs font-semibold text-white block">RentEase Protection Policy</span>
                <span className="text-[10px] text-gray-500 leading-relaxed block mt-0.5">
                  Your deposits are locked securely. No questions asked returns. Upgrade or downgrade plans at any point.
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
