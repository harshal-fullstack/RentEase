import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Truck, CreditCard, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { cart, totalMonthly, totalDeposit, clearCart } = useCart();
  const { token } = useAuth();

  // Address Details Form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('New York'); // default city
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Delivery Scheduling Form
  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];
  
  const [deliveryDate, setDeliveryDate] = useState(minDateString);
  const [deliverySlot, setDeliverySlot] = useState('09:00 AM - 01:00 PM');

  // Request status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (cart.length === 0 && !success) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-28 text-center animate-slide-up">
        <ShoppingBag className="h-16 w-16 text-slate-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white mb-2">Checkout is Empty</h2>
        <p className="text-slate-400 text-sm mb-8 font-semibold">You have no items in your cart to schedule checkout.</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300 font-bold uppercase tracking-wider text-xs underline decoration-brand-500/50">Browse Catalog</Link>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) {
      setErrorMsg('Please complete all shipping address fields');
      return;
    }
    if (!deliveryDate || !deliverySlot) {
      setErrorMsg('Please select a delivery date and slot');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        tenure: item.tenure,
        quantity: item.quantity,
      }));

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: { street, city, state, zipCode },
          deliveryDate,
          deliverySlot,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
        clearCart();
      } else {
        setErrorMsg(data.message || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
      setErrorMsg('Network error. Failed to reach server.');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-28 text-center animate-slide-up relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="bg-gradient-to-b from-[#111827]/60 to-[#0f172a]/90 p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
          <div className="h-20 w-20 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 scale-100 animate-pulse-glow shadow-md shadow-emerald-950/20">
            <ShieldCheck className="h-10 w-10 text-emerald-450" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Order Placed!</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-10 font-semibold">
            Your delivery has been successfully scheduled. You can now track your order status and manage your active leases in the dashboard.
          </p>
          <Link
            to="/my-rentals"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl py-4 flex items-center justify-center space-x-2 transition-all duration-300 shadow-2xl shadow-violet-600/20 hover:shadow-violet-600/35 hover:scale-[1.01] active:scale-95 text-sm"
          >
            Go to My Rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 relative animate-slide-up">
      
      {/* Background blur */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Title */}
      <div className="mb-14 text-center md:text-left">
        <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest font-display">Secure Pipeline</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5">Delivery & Checkout</h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">Provide address details and pick an available slot to complete your lease.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Form Panel */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-8 space-y-8">
          
          {/* Error alerts */}
          {errorMsg && (
            <div className="bg-red-950/20 border border-red-900/30 text-red-405 p-5 rounded-2xl text-xs flex items-start space-x-3 shadow-lg">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span className="font-extrabold">{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Shipping Address */}
          <div className="bg-[#111827]/40 p-6 md:p-9 rounded-3xl border border-white/10 shadow-lg space-y-6">
            <h2 className="text-xl font-extrabold text-white flex items-center mb-1">
              <Truck className="h-5 w-5 mr-3 text-violet-455 animate-float" />
              1. Delivery Address
            </h2>
            
            <div>
              <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="street">
                Street Address
              </label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Apartment, building, suite, street name"
                className="w-full glass-input rounded-xl py-3 px-4.5 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York"
                  className="w-full glass-input rounded-xl py-3 px-4.5 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. NY"
                  className="w-full glass-input rounded-xl py-3 px-4.5 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="zip">
                  Zip / Postal Code
                </label>
                <input
                  id="zip"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  className="w-full glass-input rounded-xl py-3 px-4.5 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Slot */}
          <div className="bg-[#111827]/40 p-6 md:p-9 rounded-3xl border border-white/10 shadow-lg space-y-6">
            <h2 className="text-xl font-extrabold text-white flex items-center mb-1">
              <Calendar className="h-5 w-5 mr-3 text-indigo-400" />
              2. Delivery Scheduling
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg font-medium">
              We need a scheduled time to deliver and set up your items. Slots are subject to a logistics capacity check.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="date">
                  Delivery Date
                </label>
                <input
                  id="date"
                  type="date"
                  min={minDateString}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 px-4.5 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="slot">
                  Select Time Slot
                </label>
                <select
                  id="slot"
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-3 px-4.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="09:00 AM - 01:00 PM">Morning (09:00 AM - 01:00 PM)</option>
                  <option value="02:00 PM - 06:00 PM">Afternoon (02:00 PM - 06:00 PM)</option>
                  <option value="06:00 PM - 10:00 PM">Evening (06:00 PM - 10:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Simulation */}
          <div className="bg-[#111827]/40 p-6 md:p-9 rounded-3xl border border-white/10 shadow-lg space-y-4">
            <h2 className="text-xl font-extrabold text-white flex items-center mb-1">
              <CreditCard className="h-5 w-5 mr-3 text-emerald-450 animate-bounce-slow" />
              3. Payment Verification
            </h2>
            <p className="text-slate-405 text-xs leading-relaxed font-semibold">
              This is a development simulation. No real credit card details will be charged. Click checkout below to complete the lease transaction.
            </p>
          </div>

          {/* Checkout Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl py-4 flex items-center justify-center space-x-2.5 shadow-2xl shadow-violet-600/25 hover:shadow-violet-600/35 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 text-sm"
          >
            {loading ? <span>Scheduling Delivery...</span> : <span>Confirm Order & Schedule Delivery</span>}
          </button>

        </form>

        {/* Right Summary Panel */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0f172a]/80 p-7 rounded-3xl border border-white/10 shadow-2xl">
            
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-sm">Summary</h3>
            
            <div className="max-h-56 overflow-y-auto space-y-4 mb-6 pr-1.5 scrollbar-thin">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.tenure}`} className="flex justify-between items-start text-xs border-b border-white/5 pb-3">
                  <div>
                    <span className="text-white font-bold block line-clamp-1">{item.product.name}</span>
                    <span className="text-slate-400 font-semibold mt-1 block">{item.tenure} mo plan • Qty {item.quantity}</span>
                  </div>
                  <span className="text-white font-extrabold">₹{item.product.pricing[item.tenure] * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-b border-white/5 pb-6 mb-6 text-xs font-bold">
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-400">Monthly Subtotal</span>
                <span className="text-white font-extrabold">₹{totalMonthly}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-400">Security Deposit Subtotal</span>
                <span className="text-white font-extrabold">₹{totalDeposit}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-400">Delivery & Setup</span>
                <span className="text-emerald-450 font-extrabold uppercase text-[9px] tracking-widest bg-emerald-950/20 px-2.5 py-0.5 rounded-lg shadow-sm">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-widest">Due Today</span>
              <span className="text-2xl font-black text-violet-400">₹{totalMonthly + totalDeposit}</span>
            </div>
            
            <span className="text-[8px] text-slate-500 text-right block font-extrabold tracking-wider uppercase leading-relaxed mt-3">
              Deposits are refunded in full upon lease end.
            </span>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
