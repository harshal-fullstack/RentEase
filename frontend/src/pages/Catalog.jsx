import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Sofa, Refrigerator, Info } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local state for search inputs
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Extract filters from URL search params
  const categoryFilter = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/products';
        const params = [];
        
        if (categoryFilter && categoryFilter !== 'All') {
          params.push(`category=${categoryFilter}`);
        }
        
        if (searchQuery) {
          params.push(`search=${encodeURIComponent(searchQuery)}`);
        }

        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
        setError('Could not connect to the server. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 150); // Small debounce

    return () => clearTimeout(delayDebounce);
  }, [categoryFilter, searchQuery]);

  const handleCategorySelect = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 relative animate-slide-up">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Page Title */}
      <div className="mb-14 text-center md:text-left">
        <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest">Premium Catalog</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5">Rental Catalog</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl font-medium">
          Select premium furniture and appliances to customize your perfect living space with complete flexibility.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 bg-[#0f172a]/40 p-4 rounded-3xl border border-white/10 shadow-xl">
        
        {/* Category Tabs */}
        <div className="flex bg-slate-950/65 p-1 rounded-2xl border border-white/5 w-full lg:w-auto">
          {['All', 'Furniture', 'Appliances'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`flex-1 lg:flex-none px-7 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-350 flex items-center justify-center space-x-2.5 ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'Furniture' && <Sofa className="h-3.5 w-3.5" />}
              {cat === 'Appliances' && <Refrigerator className="h-3.5 w-3.5" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Search items (e.g. bed, sofa, fridge)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-xs placeholder-slate-500 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all duration-350 shadow-inner"
          />
          <button type="submit" className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-500 hover:text-violet-455 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-extrabold tracking-widest uppercase">Loading Products...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/10 border border-red-900/20 text-red-400 p-12 rounded-3xl text-center max-w-xl mx-auto my-12 shadow-lg">
          <p className="font-extrabold text-xl mb-2 text-red-200">Connection Offline</p>
          <p className="text-xs text-red-400/80 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-900/20 border border-red-800/40 text-red-400 rounded-xl hover:bg-red-900/40 text-xs font-bold tracking-wider uppercase transition-all duration-300"
          >
            Retry Connection
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-[#0f172a]/20 rounded-3xl border border-white/15 shadow-sm">
          <Package className="h-14 w-14 text-slate-655 mx-auto mb-5" />
          <h3 className="text-xl font-extrabold text-slate-300 mb-2">No Products Found</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto font-medium">Try checking your search term or select another category filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => {
            const startPrice = product.pricing['12']; // 12 months is lowest starting price
            
            return (
              <div
                key={product._id}
                className="premium-card-hover bg-[#111827]/40 border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-violet-600/5 transition-all duration-350 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="h-60 w-full relative overflow-hidden bg-slate-950/20 border-b border-white/5">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    
                    {/* Category Label */}
                    <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md border backdrop-blur-md ${
                      product.category === 'Furniture'
                        ? 'bg-violet-500/10 border-violet-500/25 text-violet-300'
                        : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
                    }`}>
                      {product.category}
                    </span>
                    
                    {/* Inventory status badge */}
                    {product.inventory === 0 ? (
                      <span className="absolute top-4 right-4 bg-red-950/80 border border-red-900/30 text-red-400 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                        Out of Stock
                      </span>
                    ) : product.inventory <= 3 ? (
                      <span className="absolute top-4 right-4 bg-amber-950/80 border border-amber-900/30 text-amber-450 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                        Only {product.inventory} Left
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-900/30 text-emerald-450 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest">{product.subCategory}</span>
                      <span className="text-slate-400 text-[10px] flex items-center font-bold uppercase tracking-wider">
                        <Info className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                        Deposit: ₹{product.deposit}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2.5 line-clamp-1 group-hover:text-violet-300 transition-colors">{product.name}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 font-medium">{product.description}</p>
                  </div>
                </div>

                {/* Footer price & view details */}
                <div className="p-7 pt-0 border-t border-white/5 flex items-center justify-between mt-3">
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase tracking-widest font-bold">Starting at</span>
                    <div className="flex items-baseline space-x-0.5 mt-0.5">
                      <span className="text-2xl font-black text-white">₹{startPrice}</span>
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase ml-1">/mo</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/products/${product._id}`}
                    className="px-6 py-3.5 bg-[#0f172a] hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 border border-white/10 hover:border-transparent text-slate-300 hover:text-white rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
