import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ShoppingCart, ShieldCheck, HelpCircle, AlertCircle, Calendar } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
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
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 text-xs font-bold tracking-wider uppercase">Loading asset details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-55/80 border border-red-200 text-red-700 p-10 rounded-3xl text-center max-w-xl mx-auto shadow-md">
          <AlertCircle className="h-14 w-14 mx-auto mb-5 text-red-500" />
          <h2 className="font-extrabold text-xl mb-2 text-slate-800">Item Retrieval Failed</h2>
          <p className="text-xs text-red-600 mb-8">{error || 'Asset not found'}</p>
          <Link to="/catalog" className="px-6 py-3 bg-red-100 border border-red-200 text-red-700 rounded-xl hover:bg-red-200 text-xs font-bold uppercase tracking-wider transition-colors inline-block">
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
    <div className="max-w-7xl mx-auto px-6 py-16 relative animate-slide-up">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Back Button */}
      <Link to="/catalog" className="inline-flex items-center space-x-2.5 text-slate-400 hover:text-white transition-colors duration-250 mb-10 font-extrabold text-xs uppercase tracking-widest group">
        <ChevronLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Product Image & Description */}
        <div className="lg:col-span-7 space-y-10">
          <div className="bg-[#111827]/40 border border-white/10 rounded-3xl overflow-hidden relative aspect-[4/3] shadow-2xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transform hover:scale-[1.01] transition-transform duration-500"
            />
            <span className="absolute top-5 left-5 bg-[#0f172a]/70 border border-white/10 text-violet-300 text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl shadow-md backdrop-blur-md">
              {product.category}
            </span>
          </div>

          <div className="bg-[#111827]/30 border border-white/10 p-8 md:p-10 rounded-3xl space-y-5 shadow-lg">
            <h3 className="text-xl font-extrabold text-white">Item Details & Dimensions</h3>
            <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-line font-medium">{product.description}</p>
          </div>
        </div>

        {/* Right Column: Order Selection Panel */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0f172a]/80 p-8 md:p-9 rounded-3xl border border-white/10 shadow-2xl sticky top-28">
            
            {/* Header info */}
            <div className="mb-10">
              <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest">{product.subCategory}</span>
              <h1 className="text-3xl font-black text-white mt-2 mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex flex-wrap items-center gap-3.5 text-xs font-semibold">
                {product.inventory === 0 ? (
                  <span className="bg-red-950/80 border border-red-900/30 text-red-400 font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider text-[9px]">
                    Out of Stock
                  </span>
                ) : (
                  <span className="bg-emerald-950/80 border border-emerald-900/30 text-emerald-450 font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider text-[9px]">
                    In Stock ({product.inventory} available)
                  </span>
                )}
                <span className="text-slate-800">•</span>
                <span className="text-slate-400 font-medium">Refundable Deposit: ₹{product.deposit}</span>
              </div>
            </div>

            {/* Select Tenure Plan */}
            <div className="mb-10">
              <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2.5 text-violet-400" />
                Select Rental Plan (Tenure)
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {tenureLabels.map((plan) => {
                  const rate = product.pricing[plan.value];
                  const active = selectedTenure === plan.value;
                  return (
                    <button
                      key={plan.value}
                      onClick={() => setSelectedTenure(plan.value)}
                      className={`p-4.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-350 hover:scale-[1.02] ${
                        active
                          ? 'bg-violet-500/10 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/5 font-extrabold'
                          : 'bg-slate-950/65 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">{plan.value} {plan.value === 1 ? 'Month' : 'Months'}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${
                          active
                            ? 'bg-violet-600 text-white shadow'
                            : 'bg-slate-900 text-slate-400 border border-white/10'
                        }`}>
                          {plan.discount}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-black text-white">₹{rate}</span>
                        <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase ml-1.5">/mo</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-10 flex items-center justify-between border-t border-white/5 pt-8">
              <label className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest" htmlFor="quantity">
                Quantity
              </label>
              <div className="flex items-center bg-slate-950/80 border border-white/15 rounded-2xl p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-9 w-9 text-slate-450 hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
                  disabled={product.inventory <= 0}
                >
                  -
                </button>
                <span className="w-12 text-center text-white text-xs font-extrabold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="h-9 w-9 text-slate-450 hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
                  disabled={product.inventory <= 0 || quantity >= product.inventory}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Calculations breakdown */}
            <div className="bg-slate-950/60 border border-white/5 p-6 rounded-2xl mb-10 space-y-4 shadow-inner">
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>Monthly Rent ({selectedTenure} mo plan)</span>
                <span className="text-white">₹{monthlyPrice} × {quantity} = ₹{subtotalMonthly}</span>
              </div>
              
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span className="flex items-center">
                  Refundable Security Deposit
                  <HelpCircle className="h-3.5 w-3.5 ml-1.5 text-slate-500 cursor-help" title="100% refundable upon returned item inspection" />
                </span>
                <span className="text-white">₹{itemDeposit} × {quantity} = ₹{subtotalDeposit}</span>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-widest">Total Due Now</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-violet-400">₹{dueNow}</span>
                  <span className="text-[8px] text-slate-500 block font-bold mt-1">INCLUDES DEPOSIT + 1ST MONTH</span>
                </div>
              </div>
            </div>

            {/* Added to Cart Alert Box */}
            {addedMsg && (
              <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-5 rounded-2xl text-xs flex items-center justify-between mb-6 animate-pulse-glow shadow-sm">
                <span className="font-extrabold flex items-center tracking-wide">
                  <ShieldCheck className="h-4.5 w-4.5 mr-2.5 text-emerald-500 shrink-0" />
                  Item successfully added to cart!
                </span>
                <Link to="/cart" className="underline font-black hover:text-emerald-305 tracking-wide">View Cart</Link>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl py-4 flex items-center justify-center space-x-2.5 shadow-2xl shadow-violet-600/25 hover:shadow-violet-600/40 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:transform-none disabled:shadow-none"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
            
            <div className="mt-6 flex items-center justify-center text-[9px] text-slate-500 font-extrabold uppercase tracking-widest space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Extend or cancel lease at any time</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
