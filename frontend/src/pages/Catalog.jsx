import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { Search, Filter, Package, AlertCircle } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const categoryFilter = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/products`;
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
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Rental Catalog</h1>
          <p className="text-gray-600 text-lg">Discover premium furniture and appliances, curated just for you</p>
        </div>

        {/* Filters & Search Bar */}
        <div className="card-premium p-6 mb-12">
          <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3">
              {['All', 'Furniture', 'Appliances'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                    categoryFilter === cat
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items (e.g., bed, sofa, fridge)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </form>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
            </div>
            <span className="text-gray-500">Loading items...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-lg text-center max-w-xl mx-auto">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-bold text-lg mb-2">Service Offline</p>
            <p className="text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 p-16 rounded-lg text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const startPrice = product.pricing['12'];
              
              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card overflow-hidden hover:shadow-2xl group"
                >
                  {/* Image Container */}
                  <div className="h-56 w-full relative bg-gray-200 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className={`badge ${
                        product.category === 'Furniture'
                          ? 'badge-primary'
                          : 'badge-warning'
                      }`}>
                        {product.category}
                      </span>
                      
                      <div>
                        {product.inventory === 0 ? (
                          <span className="badge badge-error">Out of Stock</span>
                        ) : product.inventory <= 3 ? (
                          <span className="badge badge-warning">Only {product.inventory} Left</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">
                      {product.subCategory}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {product.description}
                    </p>

                    {/* Price & Footer */}
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">From</span>
                        <div className="text-2xl font-bold text-cyan-600">₹{startPrice}</div>
                        <span className="text-xs text-gray-500">/month</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Deposit</p>
                        <p className="font-semibold text-gray-900">₹{product.deposit}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;