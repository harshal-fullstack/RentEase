import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Calendar } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto text-center px-6 py-24">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-6">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Start building your dream space! Browse our collection of premium furniture and appliances.
          </p>
          <Link to="/catalog" className="btn btn-primary btn-lg inline-flex">
            <span>Start Browsing</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Shopping Cart</h1>
          <p className="text-gray-600">Review your items, adjust quantities, and proceed to checkout</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const product = item.product;
              const pricePerMonth = product.pricing[item.tenure];
              const lineTotal = pricePerMonth * item.quantity;

              return (
                <div
                  key={`${item.productId}-${item.tenure}`}
                  className="card p-6 hover:shadow-lg transition-all"
                >
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    
                    {/* Image & Product Info */}
                    <div className="md:col-span-5 flex gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg bg-gray-200"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">
                          {product.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 leading-snug">
                          {product.name}
                        </h3>
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>Deposit: ₹{product.deposit}</div>
                          <div>Stock: {product.inventory}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tenure Selector */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Plan
                      </label>
                      <select
                        value={item.tenure}
                        onChange={(e) => updateCartTenure(item.productId, item.tenure, Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Qty
                      </label>
                      <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold transition"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.tenure, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold transition"
                          disabled={item.quantity >= product.inventory}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-right">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Subtotal
                      </div>
                      <div className="text-xl font-bold text-cyan-600">₹{lineTotal}</div>
                      <span className="text-xs text-gray-500">/month</span>
                    </div>

                    {/* Delete */}
                    <div className="md:col-span-1 text-right">
                      <button
                        onClick={() => removeFromCart(item.productId, item.tenure)}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Summary & Checkout */}
          <div className="lg:col-span-4">
            <div className="card-premium p-8 sticky top-28">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Summary</h2>
              
              {/* Line Items Preview */}
              <div className="max-h-48 overflow-y-auto mb-8 pb-8 border-b border-gray-200 space-y-3">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.tenure}`} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900 flex-shrink-0 ml-2">
                      ₹{item.product.pricing[item.tenure] * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent</span>
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
              <div className="flex items-baseline justify-between mb-8">
                <span className="text-gray-600 font-medium">Total Due Today</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-600">
                    ₹{totalMonthly + totalDeposit}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">1st month + refundable deposit</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckoutClick}
                className="btn btn-primary btn-lg w-full justify-center mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/catalog"
                className="btn btn-secondary w-full justify-center"
              >
                Continue Shopping
              </Link>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm space-y-2">
                <p className="font-semibold text-gray-900">✓ Protected Purchase</p>
                <p className="text-xs text-gray-600">
                  100% refundable deposits. Extend, upgrade, or cancel anytime.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;