import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Refrigerator, ArrowRight, Zap, Check, TrendingUp, Shield, Truck } from 'lucide-react';

const Home = () => {
  const [featuredProduct, setFeaturedProduct] = useState(null);

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          // Find the Modern 3-Seater Fabric Sofa or default to the first product
          const sofa = data.products.find(
            (p) => p.category === 'Furniture' && p.subCategory === 'Sofa'
          ) || data.products[0];
          setFeaturedProduct(sofa);
        }
      } catch (err) {
        console.error('Error fetching products for Home:', err);
      }
    };
    fetchFeaturedProduct();
  }, []);

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              <span>New Way to Furnish</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Premium Furniture,
              <span className="text-gradient"> Zero Commitment</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
              Rent premium furniture and appliances from top brands. Cancel, extend, or upgrade your lease anytime. No long-term contracts, no compromise on quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                <span>Browse Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn btn-ghost btn-lg">
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-cyan-600">10K+</div>
                <p className="text-sm text-gray-600 mt-1">Happy Renters</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-600">500+</div>
                <p className="text-sm text-gray-600 mt-1">Products</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-600">50+</div>
                <p className="text-sm text-gray-600 mt-1">Cities</p>
              </div>
            </div>
          </div>

          {/* Right Visual - Large Product Card */}
          <div className="animate-slide-in">
            <div className="card-premium p-8 relative overflow-hidden h-96 md:h-full md:min-h-96 flex items-end">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-teal-500/10 to-transparent"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-cyan-300 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl opacity-20"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="badge badge-primary mb-4">Featured Offer</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Modern Sofa Set</h3>
                <p className="text-gray-600 mb-6">Premium comfort meets sleek design</p>
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-sm text-gray-500">Starting at</p>
                    <p className="text-2xl font-bold text-cyan-600">₹2,499</p>
                  </div>
                  <Link to={featuredProduct ? `/products/${featuredProduct._id}` : '/catalog'} className="ml-auto btn btn-primary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our curated collection of premium furniture and appliances</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Furniture */}
          <Link
            to="/catalog?category=Furniture"
            className="card-premium p-8 group cursor-pointer h-64 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-transparent group-hover:from-cyan-200 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <Sofa className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Furniture</h3>
              <p className="text-gray-600 text-sm">Beds, sofas, dining sets, and more</p>
            </div>
            <div className="relative z-10 text-cyan-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              Explore <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

          {/* Appliances */}
          <Link
            to="/catalog?category=Appliances"
            className="card-premium p-8 group cursor-pointer h-64 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-transparent group-hover:from-amber-200 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <Refrigerator className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Appliances</h3>
              <p className="text-gray-600 text-sm">Refrigerators, TVs, washing machines, and more</p>
            </div>
            <div className="relative z-10 text-amber-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              Explore <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-200">
        <div className="section-header">
          <h2>How RentEase Works</h2>
          <p>Four simple steps to get premium items delivered to your home</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              num: '01',
              title: 'Browse',
              desc: 'Explore thousands of premium furniture and appliances',
              icon: '🔍',
            },
            {
              num: '02',
              title: 'Select Plan',
              desc: 'Choose your rental tenure: 1, 3, 6, or 12 months',
              icon: '📅',
            },
            {
              num: '03',
              title: 'Checkout',
              desc: 'Pick delivery date and complete your lease',
              icon: '🚚',
            },
            {
              num: '04',
              title: 'Enjoy',
              desc: 'Get free delivery & setup. Extend or return anytime',
              icon: '✨',
            },
          ].map((step, idx) => (
            <div key={idx} className="card p-6 relative">
              <div className="text-gray-200 font-black text-5xl mb-4 absolute top-6 right-6">
                {step.num}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-gray-600 text-sm">{step.desc}</p>
              
              {idx < 3 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <ArrowRight className="w-8 h-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Why RentEase */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="section-header">
          <h2>Why Choose RentEase?</h2>
          <p>We make renting premium items simple, affordable, and flexible</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield className="w-8 h-8" />,
              title: 'Fully Refundable Deposit',
              desc: 'Security deposits are returned 100% when you return items in good condition.',
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              icon: <Truck className="w-8 h-8" />,
              title: 'Free Delivery & Setup',
              desc: 'We deliver and install everything. No hassle, no heavy lifting required.',
              color: 'text-cyan-600',
              bg: 'bg-cyan-50',
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: 'Flexible Anytime',
              desc: 'Extend your lease, upgrade to premium items, or cancel & return anytime.',
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((benefit, idx) => (
            <div key={idx} className={`card p-8 ${benefit.bg}`}>
              <div className={`w-12 h-12 rounded-lg ${benefit.bg} flex items-center justify-center ${benefit.color} mb-4 border border-current border-opacity-20`}>
                {benefit.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h4>
              <p className="text-gray-600 text-sm">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="card-premium p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-amber-500/10"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-cyan-300 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Space?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy renters who've upgraded their lifestyle with RentEase. No long-term contracts. Pure flexibility.
            </p>
            <Link to="/catalog" className="btn btn-primary btn-lg inline-flex">
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;