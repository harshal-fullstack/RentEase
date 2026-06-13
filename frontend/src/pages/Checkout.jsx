import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Truck, CreditCard, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { cart, totalMonthly, totalDeposit, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Checkout is Empty</h2>
        <Link to="/catalog" className="text-brand-400 font-semibold underline">Browse Catalog</Link>
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
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="glass-premium p-8 rounded-3xl border-brand-500/20 relative">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 scale-100 animate-pulse-glow">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
          <p className="text-gray-400 text-sm mb-8">
            Your delivery has been successfully scheduled. You can now track your order status and manage your active leases in the dashboard.
          </p>
          <Link
            to="/my-rentals"
            className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg"
          >
            Go to My Rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white">Delivery & Checkout</h1>
        <p className="text-gray-400 text-sm mt-1">Provide address details and pick an available slot to complete your lease</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Panel */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-8 space-y-6">
          
          {/* Error alerts */}
          {errorMsg && (
            <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-start space-x-2 animate-shake">
              <AlertCircle className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Shipping Address */}
          <div className="glass p-6 md:p-8 rounded-3xl border-white/5 space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center mb-1">
              <Truck className="h-5 w-5 mr-2 text-brand-400" />
              1. Delivery Address
            </h2>
            
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="street">
                Street Address
              </label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Apartment, building, suite, street name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. NY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="zip">
                  Zip / Postal Code
                </label>
                <input
                  id="zip"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Slot */}
          <div className="glass p-6 md:p-8 rounded-3xl border-white/5 space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center mb-1">
              <Calendar className="h-5 w-5 mr-2 text-indigo-400" />
              2. Delivery Scheduling
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-lg">
              We need a scheduled time to deliver and set up your items. Slots are subject to a capacity check.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="date">
                  Delivery Date
                </label>
                <input
                  id="date"
                  type="date"
                  min={minDateString}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="slot">
                  Select Time Slot
                </label>
                <select
                  id="slot"
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="09:00 AM - 01:00 PM">Morning (09:00 AM - 01:00 PM)</option>
                  <option value="02:00 PM - 06:00 PM">Afternoon (02:00 PM - 06:00 PM)</option>
                  <option value="06:00 PM - 10:00 PM">Evening (06:00 PM - 10:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Simulation */}
          <div className="glass p-6 md:p-8 rounded-3xl border-white/5 space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center mb-1">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
              3. Payment Verification
            </h2>
            <p className="text-gray-400 text-xs">
              This is a development simulation. No real credit card details will be charged. Click checkout below to complete the lease transaction.
            </p>
          </div>

          {/* Checkout Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl py-4 flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <span>Scheduling Delivery...</span> : <span>Confirm Order & Schedule Delivery</span>}
          </button>

        </form>

        {/* Right Summary Panel */}
        <div className="lg:col-span-4">
          <div className="glass-premium p-6 rounded-3xl border border-brand-500/10">
            
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            
            <div className="max-h-52 overflow-y-auto space-y-4 mb-4 pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.tenure}`} className="flex justify-between items-start text-xs border-b border-white/5 pb-2.5">
                  <div>
                    <span className="text-white font-semibold block line-clamp-1">{item.product.name}</span>
                    <span className="text-gray-500">{item.tenure} mo plan • Qty {item.quantity}</span>
                  </div>
                  <span className="text-white font-semibold">₹{item.product.pricing[item.tenure] * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 border-b border-white/5 pb-4 mb-4 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Monthly Subtotal</span>
                <span className="text-white">₹{totalMonthly}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit Subtotal</span>
                <span className="text-white">₹{totalDeposit}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery & Setup</span>
                <span className="text-emerald-400 font-bold uppercase">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-white">Due Today</span>
              <span className="text-xl font-extrabold text-brand-400">₹{totalMonthly + totalDeposit}</span>
            </div>
            
            <span className="text-[10px] text-gray-500 text-right block leading-relaxed mb-4">
              Security deposits will be returned in full upon lease completion.
            </span>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
