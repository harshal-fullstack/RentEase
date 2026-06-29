import React, { useState } from 'react';
import { BarChart3, Users, Package, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats] = useState({
    totalOrders: 1234,
    totalRevenue: 5432100,
    activeRentals: 456,
    totalUsers: 890,
  });

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Admin Dashboard</h1>
          <p className="text-gray-600">Manage inventory, view analytics, and handle customer orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: 'Total Orders',
              value: stats.totalOrders,
              icon: Package,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'Active Rentals',
              value: stats.activeRentals,
              icon: TrendingUp,
              color: 'from-cyan-500 to-teal-500',
            },
            {
              title: 'Total Users',
              value: stats.totalUsers,
              icon: Users,
              color: 'from-teal-500 to-green-500',
            },
            {
              title: 'Total Revenue',
              value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
              icon: BarChart3,
              color: 'from-amber-500 to-orange-500',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="card-premium p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-10 mb-4`}>
                  <Icon className={`w-6 h-6 text-gradient`} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-premium p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
            <div className="text-center py-12 text-gray-500">
              No recent orders to display
            </div>
          </div>

          <div className="card-premium p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Inventory Status</h3>
            <div className="text-center py-12 text-gray-500">
              Loading inventory data...
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;