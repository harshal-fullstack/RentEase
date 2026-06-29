import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Truck, CreditCard, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { cart, totalMonthly, totalDeposit, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];
  
  const [deliveryDate, setDeliveryDate] = useState(minDateString);
  const [deliverySlot, setDeliverySlot] = useState('09:00 AM - 01:00 PM');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (cart.length === 0 && !success) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto text-center px-6">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout is Empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed</p>
          <Link to="/catalog" className="btn btn-primary inline-flex">
            Browse Catalog
          </Link>
        </div>
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
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-6">
          <div className="card-premium p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Your lease has been successfully scheduled. Check your email for details and tracking information.
            </p>
            <Link
              to="/my-rentals"
              className="btn btn-primary btn-lg w-full justify-center mb-3"
            >
              View My Rentals
            </Link>
            <Link
              to="/"
              className="btn btn-secondary w-full justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Delivery & Checkout</h1>
          <p className="text-gray-600">Complete your lease by providing delivery details</p>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Address</div>
          </div>
          <div className="w-16 h-1 bg-cyan-200 mx-4"></div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Delivery</div>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-4"></div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: Forms */}
          <form onSubmit={handleCheckoutSubmit} className="lg:col-span-8 space-y-6">
            
            {/* Error Alert */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Shipping Address */}
            <div className="card-premium p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                <Truck className="w-5 h-5 mr-3 text-cyan-600" />
                1. Delivery Address
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Apartment, building, street name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New York"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. NY"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="10001"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Slot */}
            <div className="card-premium p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                <Calendar className="w-5 h-5 mr-3 text-cyan-600" />
                2. Delivery Scheduling
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Choose a convenient date and time slot for delivery and setup
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    min={minDateString}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Time Slot
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
                  >
                    <option value="09:00 AM - 01:00 PM">Morning (9:00 AM - 1:00 PM)</option>
                    <option value="02:00 PM - 06:00 PM">Afternoon (2:00 PM - 6:00 PM)</option>
                    <option value="06:00 PM - 10:00 PM">Evening (6:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Payment */}
            <div className="card-premium p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                <CreditCard className="w-5 h-5 mr-3 text-cyan-600" />
                3. Payment
              </h2>
              <p className="text-gray-600 text-sm">
                This is a development environment. Click "Confirm Order" to complete your lease.
              </p>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center disabled:opacity-50"
            >
              {loading ? 'Scheduling Delivery...' : 'Confirm Order & Schedule Delivery'}
            </button>

          </form>

          {/* Right: Summary */}
          <div className="lg:col-span-4">
            <div className="card-premium p-8 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Items */}
              <div className="max-h-52 overflow-y-auto space-y-3 mb-6 pb-6 border-b border-gray-200">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.tenure}`} className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.tenure}mo plan • Qty {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0 ml-2">
                      ₹{item.product.pricing[item.tenure] * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{totalMonthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-semibold text-gray-900">₹{totalDeposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery & Setup</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              {/* Total Due */}
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-gray-600 font-medium">Due Today</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-600">
                    ₹{totalMonthly + totalDeposit}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">1st month + refundable deposit</p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">✓ Secure Checkout</p>
                <p className="text-xs text-blue-700">
                  Deposits fully refundable. SSL encrypted. No real card charged.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;