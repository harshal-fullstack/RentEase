import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, AlertCircle, RefreshCw } from 'lucide-react';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      // Mock implementation - in a real app, this would fetch from the API
      setTimeout(() => {
        setRentals([]);
        setLoading(false);
      }, 500);
    };

    fetchRentals();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
        </div>
        <span className="text-gray-500">Loading your rentals...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Rentals</h1>
          <p className="text-gray-600">Manage your active leases, view delivery status, and request maintenance</p>
        </div>

        {rentals.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Rentals</h3>
            <p className="text-gray-600 mb-6">You haven't started any rentals yet</p>
            <Link to="/catalog" className="btn btn-primary inline-flex">
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {rentals.map((rental) => (
              <div key={rental.id} className="card p-6">
                <div className="grid md:grid-cols-4 gap-6 items-center">
                  <img
                    src={rental.image}
                    alt={rental.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{rental.name}</h3>
                    <p className="text-sm text-gray-600">{rental.tenure}mo plan</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rent/Month</p>
                    <p className="text-2xl font-bold text-cyan-600">₹{rental.monthlyRent}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn btn-secondary btn-sm">Extend</button>
                    <button className="btn btn-secondary btn-sm">Return</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals;