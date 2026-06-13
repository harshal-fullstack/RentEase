import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Package, Sofa, Refrigerator, Info } from 'lucide-react';

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

    fetchProducts();
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Page Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white">Rental Catalog</h1>
        <p className="text-gray-400 text-sm mt-1">Select furniture and appliances to customize your perfect living space</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
        
        {/* Category Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 w-full md:w-auto">
          {['All', 'Furniture', 'Appliances'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat === 'Furniture' && <Sofa className="h-4 w-4" />}
              {cat === 'Appliances' && <Refrigerator className="h-4 w-4" />}
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
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-brand-500 focus:outline-none transition-colors duration-200"
          />
          <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 hover:text-brand-400">
            <Search className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Fetching catalogue items...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-500/10 text-red-400 p-8 rounded-2xl text-center max-w-xl mx-auto my-12">
          <p className="font-bold text-lg mb-2">Service Offline</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-900/20 border border-red-500/20 text-red-300 rounded-xl hover:bg-red-900/40 text-xs font-semibold transition-colors duration-200"
          >
            Retry Connection
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">Try checking your search term or select another category filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const startPrice = product.pricing['12']; // 12 months is lowest starting price
            
            return (
              <div
                key={product._id}
                className="glass rounded-3xl overflow-hidden border-white/5 hover:border-brand-500/25 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="h-52 w-full relative overflow-hidden bg-slate-900">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Category Label */}
                    <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md ${
                      product.category === 'Furniture'
                        ? 'bg-brand-600 text-white'
                        : 'bg-indigo-600 text-indigo-100'
                    }`}>
                      {product.category}
                    </span>
                    
                    {/* Inventory status badge */}
                    {product.inventory === 0 ? (
                      <span className="absolute top-4 right-4 bg-red-950/80 border border-red-500/25 text-red-400 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                        Out of Stock
                      </span>
                    ) : product.inventory <= 3 ? (
                      <span className="absolute top-4 right-4 bg-amber-950/80 border border-amber-500/25 text-amber-400 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                        Only {product.inventory} Left
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">{product.subCategory}</span>
                      <span className="text-gray-500 text-xs flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Refundable Deposit: ₹{product.deposit}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{product.description}</p>
                  </div>
                </div>

                {/* Footer price & view details */}
                <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase tracking-wider">Starting at</span>
                    <span className="text-xl font-black text-white">₹{startPrice}</span>
                    <span className="text-gray-400 text-xs">/mo</span>
                  </div>
                  
                  <Link
                    to={`/products/${product._id}`}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all duration-200"
                  >
                    View Options
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
