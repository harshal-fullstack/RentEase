import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ShoppingCart, ShieldCheck, HelpCircle, AlertCircle, Info, Calendar } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom Selection States
  const [selectedTenure, setSelectedTenure] = useState(3); // default to 3 months plan
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
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
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading asset details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-950/20 border border-red-500/10 text-red-400 p-8 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-bold text-lg mb-2">Error</p>
          <p className="text-sm mb-6">{error || 'Asset not found'}</p>
          <Link to="/catalog" className="px-6 py-3 bg-red-900/20 border border-red-500/20 text-red-300 rounded-xl hover:bg-red-900/40 text-xs font-semibold">
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

  // Tenure descriptive maps
  const tenureLabels = [
    { value: 1, discount: 'Standard' },
    { value: 3, discount: 'Popular' },
    { value: 6, discount: 'Save 15%' },
    { value: 12, discount: 'Best Value' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Back Button */}
      <Link to="/catalog" className="inline-flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors duration-200 mb-8 font-medium text-sm">
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* Left Column: Product Image */}
        <div className="lg:col-span-7">
          <div className="glass rounded-3xl overflow-hidden border-white/5 relative aspect-[4/3] bg-slate-900 shadow-2xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
              {product.category}
            </span>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-3">Description</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </div>

        {/* Right Column: Order Selection Panel */}
        <div className="lg:col-span-5">
          <div className="glass-premium p-8 rounded-3xl sticky top-28 border border-brand-500/10">
            
            <div className="mb-6">
              <span className="text-brand-400 text-xs font-bold uppercase tracking-wider">{product.subCategory}</span>
              <h1 className="text-3xl font-extrabold text-white mt-1 mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-2 text-xs">
                {product.inventory === 0 ? (
                  <span className="bg-red-950/80 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-md uppercase">
                    Out of Stock
                  </span>
                ) : (
                  <span className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md uppercase">
                    In Stock ({product.inventory} available)
                  </span>
                )}
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Refundable Deposit: ₹{product.deposit}</span>
              </div>
            </div>

            {/* Select Tenure Plan */}
            <div className="mb-6">
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-3 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-brand-400" />
                Select Rental Plan (Tenure)
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {tenureLabels.map((plan) => {
                  const rate = product.pricing[plan.value];
                  const active = selectedTenure === plan.value;
                  return (
                    <button
                      key={plan.value}
                      onClick={() => setSelectedTenure(plan.value)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                        active
                          ? 'bg-brand-600/15 border-brand-500 text-white shadow-lg shadow-brand-500/5'
                          : 'bg-slate-900/40 border-slate-800/80 text-gray-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-sm font-bold">{plan.value} {plan.value === 1 ? 'Month' : 'Months'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          active
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-800 text-gray-400'
                        }`}>
                          {plan.discount}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-black text-white">₹{rate}</span>
                        <span className="text-xs text-gray-400 font-medium"> /mo</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8 flex items-center justify-between">
              <label className="text-gray-300 text-xs font-bold uppercase tracking-wider" htmlFor="quantity">
                Quantity
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 text-gray-400 hover:text-white flex items-center justify-center font-bold text-lg"
                  disabled={product.inventory <= 0}
                >
                  -
                </button>
                <span className="w-12 text-center text-white text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="h-8 w-8 text-gray-400 hover:text-white flex items-center justify-center font-bold text-lg"
                  disabled={product.inventory <= 0 || quantity >= product.inventory}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Calculations breakdown */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Monthly Rent ({selectedTenure} mo plan)</span>
                <span className="text-white font-medium">₹{monthlyPrice} × {quantity} = ₹{subtotalMonthly}</span>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span className="flex items-center">
                  Refundable Security Deposit
                  <HelpCircle className="h-3 w-3 ml-1 text-gray-500 cursor-help" title="100% refundable upon returned item inspection" />
                </span>
                <span className="text-white font-medium">₹{itemDeposit} × {quantity} = ₹{subtotalDeposit}</span>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Due Now</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-brand-400">₹{dueNow}</span>
                  <span className="text-[10px] text-gray-500 block">Includes deposit + 1st month rent</span>
                </div>
              </div>
            </div>

            {/* Added to Cart Alert Box */}
            {addedMsg && (
              <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex items-center justify-between mb-4 animate-pulse-glow">
                <span className="font-semibold flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-emerald-400" />
                  Item successfully added to cart!
                </span>
                <Link to="/cart" className="underline font-bold hover:text-emerald-300">View Cart</Link>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl py-4 flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:transform-none disabled:shadow-none"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
            
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500 space-x-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Cancel or extend lease at any time</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
