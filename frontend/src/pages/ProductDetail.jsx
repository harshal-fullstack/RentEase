import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import { ChevronLeft, ShoppingCart, Shield, Info, AlertCircle, Check } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTenure, setSelectedTenure] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Server connection failed. Make sure the backend is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
        </div>
        <span className="text-gray-500">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-lg text-center max-w-xl mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-bold text-lg mb-2">Error</p>
          <p className="text-sm mb-6">{error || 'Product not found'}</p>
          <Link to="/catalog" className="btn btn-secondary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.inventory <= 0) return;

    addToCart(product, selectedTenure, quantity);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 3000);
  };

  const monthlyPrice = product.pricing[selectedTenure];
  const itemDeposit = product.deposit;
  const subtotalMonthly = monthlyPrice * quantity;
  const subtotalDeposit = itemDeposit * quantity;
  const dueNow = subtotalMonthly + subtotalDeposit;

  const tenureOptions = [
    { value: 1, label: '1 Month', savings: 0 },
    { value: 3, label: '3 Months', savings: 5 },
    { value: 6, label: '6 Months', savings: 15 },
    { value: 12, label: '12 Months', savings: 25 },
  ];

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <Link to="/catalog" className="inline-flex items-center space-x-1.5 text-cyan-600 hover:text-cyan-700 font-medium text-sm mb-8 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">

          {/* Left: Product Image */}
          <div className="lg:col-span-6">
            <div className="card-premium overflow-hidden sticky top-20">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-4 border-t border-gray-200">
                <div>
                  <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">{product.category}</span>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
                </div>

                <p className="text-gray-600 leading-relaxed">{product.description}</p>

                {/* Stock Status */}
                <div className="flex items-center space-x-2 pt-4">
                  {product.inventory === 0 ? (
                    <span className="badge badge-error">Out of Stock</span>
                  ) : (
                    <>
                      <span className="badge badge-success">In Stock</span>
                      <span className="text-sm text-gray-600">({product.inventory} available)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Selection & Checkout */}
          <div className="lg:col-span-6 space-y-6">

            {/* Tenure Selection */}
            <div className="card-premium p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Select Rental Plan</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {tenureOptions.map((option) => {
                  const rate = product.pricing[option.value];
                  const isSelected = selectedTenure === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedTenure(option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected
                          ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-500/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{option.label}</span>
                        {option.savings > 0 && (
                          <span className="badge badge-success text-xs">Save {option.savings}%</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-cyan-600">₹{rate}</div>
                      <span className="text-xs text-gray-500">/month</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="card-premium p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Quantity</h3>
                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold transition"
                    disabled={product.inventory <= 0}
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold transition"
                    disabled={product.inventory <= 0 || quantity >= product.inventory}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="card-premium p-8 bg-gradient-to-br from-cyan-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Breakdown</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rent ({selectedTenure}mo plan)</span>
                  <span className="font-semibold text-gray-900">₹{monthlyPrice} × {quantity} = <span className="text-cyan-600">₹{subtotalMonthly}</span></span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <span>Refundable Deposit</span>
                    <Info className="w-4 h-4 text-gray-400" title="100% refunded when item is returned in good condition" />
                  </span>
                  <span className="font-semibold text-gray-900">₹{itemDeposit} × {quantity} = <span className="text-cyan-600">₹{subtotalDeposit}</span></span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery & Setup</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-600 font-medium">Due Today (1st month + deposit)</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-600">₹{dueNow}</div>
                  <p className="text-xs text-gray-500 mt-1">Deposit refunded when returned</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory <= 0}
                  className="btn btn-primary btn-lg w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <Link
                  to="/checkout"
                  className="btn btn-secondary w-full justify-center"
                >
                  Rent Now
                </Link>
              </div>
            </div>

            {/* Success Message */}
            {addedMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center space-x-3">
                <Check className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Added to cart!</p>
                  <p className="text-sm"><Link to="/cart" className="underline font-semibold hover:text-green-800">View cart</Link> to proceed</p>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="card-premium p-6 bg-blue-50">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Fully Refundable</p>
                    <p className="text-xs text-gray-600">Security deposits returned 100% upon return</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Free Cancellation</p>
                    <p className="text-xs text-gray-600">Extend or cancel your lease anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;