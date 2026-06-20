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
    <div className="max-w-7xl mx-auto px-6 py-12 relative animate-slide-up">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Page Title */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Rental Catalog</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl font-medium">
          Select premium furniture and appliances to customize your perfect living space with complete flexibility.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 glass p-4.5 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Category Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 w-full md:w-auto">
          {['All', 'Furniture', 'Appliances'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'Furniture' && <Sofa className="h-3.5 w-3.5" />}
              {cat === 'Appliances' && <Refrigerator className="h-3.5 w-3.5" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search items (e.g. bed, sofa, fridge)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-slate-800 text-xs placeholder-slate-450 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all duration-300"
          />
          <button type="submit" className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-450 hover:text-brand-600 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-xs font-bold tracking-wider uppercase">Loading Products...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-10 rounded-3xl text-center max-w-xl mx-auto my-12 shadow-md">
          <p className="font-extrabold text-xl mb-2 text-red-800">Connection Offline</p>
          <p className="text-xs text-red-650 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-100 border border-red-200 text-red-700 rounded-xl hover:bg-red-200 text-xs font-bold tracking-wider uppercase transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-slate-200/80">
          <Package className="h-14 w-14 text-slate-400 mx-auto mb-5" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Products Found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">Try checking your search term or select another category filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const startPrice = product.pricing['12']; // 12 months is lowest starting price
            
            return (
              <div
                key={product._id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-brand-500/40 transform hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-350 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="h-56 w-full relative overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Category Label */}
                    <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border ${
                      product.category === 'Furniture'
                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    }`}>
                      {product.category}
                    </span>
                    
                    {/* Inventory status badge */}
                    {product.inventory === 0 ? (
                      <span className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-600 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm">
                        Out of Stock
                      </span>
                    ) : product.inventory <= 3 ? (
                      <span className="absolute top-4 right-4 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm">
                        Only {product.inventory} Left
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-brand-600 font-extrabold uppercase tracking-widest">{product.subCategory}</span>
                      <span className="text-slate-500 text-[10px] flex items-center font-bold uppercase tracking-wider">
                        <Info className="h-3 w-3 mr-1 text-slate-400" />
                        Deposit: ₹{product.deposit}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2.5 line-clamp-1">{product.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>
                  </div>
                </div>

                {/* Footer price & view details */}
                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
                  <div>
                    <span className="text-slate-450 text-[9px] block uppercase tracking-widest font-bold">Starting at</span>
                    <div className="flex items-baseline space-x-0.5">
                      <span className="text-2xl font-black text-slate-800">₹{startPrice}</span>
                      <span className="text-slate-500 text-xs font-semibold">/mo</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/products/${product._id}`}
                    className="px-5.5 py-3 bg-slate-100 hover:bg-gradient-to-r hover:from-brand-600 hover:to-indigo-600 border border-slate-200 hover:border-transparent text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
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
