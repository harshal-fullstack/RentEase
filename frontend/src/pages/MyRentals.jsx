import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  Calendar, Package, AlertCircle, RefreshCw, ShoppingBag, 
  Truck, CheckCircle2, Clock, Wrench, Ban, CalendarPlus, 
  X, Check, AlertTriangle, ArrowRight, ShieldCheck
} from 'lucide-react';

const MyRentals = () => {
  const { token, isAuthenticated } = useAuth();
  
  const [rentals, setRentals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab control: 'rentals' or 'orders' or 'maintenance'
  const [activeTab, setActiveTab] = useState('rentals');
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'extend', 'return', 'maintenance'
  const [selectedRental, setSelectedRental] = useState(null);
  
  // Form input states
  const [extendTenure, setExtendTenure] = useState('3');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('09:00 AM - 01:00 PM');
  
  const [maintenanceIssue, setMaintenanceIssue] = useState('General Service');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceSlot, setMaintenanceSlot] = useState('09:00 AM - 01:00 PM');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const fetchDashboardData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch active rentals
      const resRentals = await fetch(`${API_URL}/rentals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataRentals = await resRentals.json();

      // Fetch order history
      const resOrders = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataOrders = await resOrders.json();

      // Fetch maintenance requests
      const resMaint = await fetch(`${API_URL}/rentals/maintenance/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataMaint = await resMaint.json();

      if (dataRentals.success) {
        setRentals(dataRentals.rentals || []);
      }
      if (dataOrders.success) {
        // Sort orders newest first
        const sortedOrders = (dataOrders.orders || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
      if (dataMaint.success) {
        const sortedMaint = (dataMaint.tickets || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMaintenanceTickets(sortedMaint);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load rentals and dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This will release the items back to inventory.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Order cancelled successfully.');
        fetchDashboardData();
      } else {
        showToast('error', data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error cancelling order');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Extension
  const handleSubmitExtension = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/rentals/${selectedRental._id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ extendedTenure: Number(extendTenure) })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Rental lease extended by ${extendTenure} months!`);
        setActiveModal(null);
        fetchDashboardData();
      } else {
        showToast('error', data.message || 'Extension failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error extending lease');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Return
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedRental || !pickupDate || !pickupSlot) {
      showToast('error', 'Please fill all pickup details');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/rentals/${selectedRental._id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pickupDate, pickupSlot })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Return pickup scheduled successfully!');
        setActiveModal(null);
        fetchDashboardData();
      } else {
        showToast('error', data.message || 'Failed to schedule return');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error scheduling return');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Maintenance
  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedRental || !maintenanceDesc || !maintenanceDate || !maintenanceSlot) {
      showToast('error', 'Please fill all maintenance details');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/rentals/${selectedRental._id}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          issueType: maintenanceIssue,
          description: maintenanceDesc,
          preferredDate: maintenanceDate,
          preferredSlot: maintenanceSlot
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Maintenance request submitted! Our technician will visit soon.');
        setActiveModal(null);
        // Reset inputs
        setMaintenanceDesc('');
        setMaintenanceDate('');
        fetchDashboardData();
      } else {
        showToast('error', data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error submitting request');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto text-center px-6 py-24">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your rentals and history.</p>
          <Link to="/login" className="btn btn-primary inline-flex">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen relative pb-16">
      
      {/* Success/Error Toast notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 flex items-center space-x-3 p-4 rounded-xl shadow-2xl border transition-all animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-600 bg-clip-text text-transparent">
              My Rentals
            </h1>
            <p className="text-gray-600 text-base max-w-xl">
              Track delivery statuses, manage active lease plans, schedule return pickups, and request home repairs.
            </p>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-secondary inline-flex items-center space-x-2 text-sm self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 mb-8 p-1 bg-gray-100/80 backdrop-blur-md rounded-xl max-w-xl">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`flex-1 py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'rentals'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Active Leases</span>
            <span className={`text-xs ml-1.5 px-2 py-0.5 rounded-full ${
              activeTab === 'rentals' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {rentals.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'orders'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Order History</span>
            <span className={`text-xs ml-1.5 px-2 py-0.5 rounded-full ${
              activeTab === 'orders' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'maintenance'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Repair & Support</span>
            <span className={`text-xs ml-1.5 px-2 py-0.5 rounded-full ${
              activeTab === 'maintenance' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {maintenanceTickets.length}
            </span>
          </button>
        </div>

        {/* Main Content Areas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-600 border-r-cyan-600 animate-spin"></div>
            </div>
            <span className="text-gray-600 font-medium">Fetching records...</span>
          </div>
        ) : error ? (
          <div className="card-premium p-12 text-center text-red-600 max-w-xl mx-auto">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-bold mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={fetchDashboardData} className="btn btn-primary inline-flex">Try Again</button>
          </div>
        ) : activeTab === 'rentals' ? (
          /* ================= ACTIVE RENTALS TAB ================= */
          rentals.length === 0 ? (
            <div className="card-premium p-16 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100">
                <Package className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Leases</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                You don't have any active product leases yet. Place an order or click "Deliver Now" in Order History to start.
              </p>
              <Link to="/catalog" className="btn btn-primary inline-flex items-center space-x-2">
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {rentals.map((rental) => (
                <div key={rental._id} className="card-premium p-6 hover:shadow-xl transition-all border border-gray-100">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Item Info */}
                    <div className="lg:col-span-4 flex items-center space-x-4">
                      <img
                        src={rental.product?.imageUrl || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300&auto=format&fit=crop'}
                        alt={rental.product?.name || 'Asset'}
                        className="w-24 h-24 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <span className="text-xs font-semibold text-cyan-600 uppercase tracking-widest">
                          {rental.product?.category || 'Furniture'}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight mt-0.5">
                          {rental.product?.name || 'Asset Lease'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Qty: {rental.quantity}</p>
                      </div>
                    </div>

                    {/* Lease Timeline */}
                    <div className="lg:col-span-3 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <span>Started: <b>{formatDate(rental.startDate)}</b></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Ends: <b>{formatDate(rental.endDate)}</b></span>
                      </div>
                      <div className="text-xs text-gray-500 pl-6 bg-cyan-50/50 py-1 px-2 rounded-md inline-block mt-1 border border-cyan-100/50">
                        Tenure Plan: <b>{rental.tenure} Months</b>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="lg:col-span-2 space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rent/Month</div>
                      <div className="text-2xl font-black text-cyan-600">₹{rental.pricePerMonth}</div>
                      <div className="text-xs text-gray-500">Security Deposit: ₹{rental.deposit}</div>
                    </div>

                    {/* Status Badge */}
                    <div className="lg:col-span-1.5 flex flex-col items-start lg:items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        rental.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rental.status === 'Extended'
                          ? 'bg-violet-50 text-violet-800 border-violet-200'
                          : rental.status === 'ReturnRequested'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {rental.status === 'ReturnRequested' ? 'Return Scheduled' : rental.status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-1.5 flex flex-wrap gap-2 lg:flex-col lg:w-full">
                      {(rental.status === 'Active' || rental.status === 'Extended') && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRental(rental);
                              setActiveModal('extend');
                            }}
                            className="btn btn-secondary btn-sm flex-1 text-center justify-center font-bold text-xs"
                          >
                            Extend Lease
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedRental(rental);
                              setActiveModal('return');
                            }}
                            className="btn btn-secondary btn-sm flex-1 text-center justify-center font-bold text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                          >
                            Schedule Return
                          </button>
                        </>
                      )}

                      {rental.status !== 'Returned' && (
                        <button
                          onClick={() => {
                            setSelectedRental(rental);
                            setActiveModal('maintenance');
                          }}
                          className="btn btn-secondary btn-sm flex-1 text-center justify-center font-bold text-xs text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                        >
                          Maintenance
                        </button>
                      )}

                      {rental.status === 'ReturnRequested' && (
                        <div className="w-full text-xs text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 mt-1">
                          <p className="font-semibold">Pickup Scheduled:</p>
                          <p>{formatDate(rental.returnDetails?.pickupDate)}</p>
                          <p className="text-[10px]">{rental.returnDetails?.pickupSlot}</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'orders' ? (
          /* ================= ORDER HISTORY TAB ================= */
          orders.length === 0 ? (
            <div className="card-premium p-16 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <ShoppingBag className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Placed</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                You haven't ordered anything yet. Browse our catalog to select your rentables!
              </p>
              <Link to="/catalog" className="btn btn-primary inline-flex items-center space-x-2">
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order._id} className="card-premium overflow-hidden border border-gray-150 shadow-md">
                  
                  {/* Order Top Bar */}
                  <div className="bg-gray-50/70 p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Order Placed</p>
                        <p className="font-bold text-gray-900">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Total Monthly Due</p>
                        <p className="font-bold text-cyan-600">₹{order.totalMonthlyAmount}/mo</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Refundable Deposit</p>
                        <p className="font-bold text-gray-900">₹{order.totalDeposit}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Order ID</p>
                        <p className="font-mono text-xs font-bold text-gray-500">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                        order.status === 'Scheduled'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Body Details */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      
                      {/* Products list inside Order */}
                      <div className="md:col-span-2 space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                            <img
                              src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300&auto=format&fit=crop'}
                              alt={item.product?.name || 'Product'}
                              className="w-16 h-16 object-cover rounded-lg bg-gray-50 border"
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{item.product?.name || 'Asset'}</h4>
                              <p className="text-xs text-gray-500">
                                Plan: {item.tenure} Months • Qty: {item.quantity} • Subtotal: ₹{item.pricePerMonth}/mo
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address & Scheduling info */}
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200/50 text-xs space-y-2.5">
                        <div className="flex items-center space-x-2 text-cyan-800 font-bold">
                          <Truck className="w-4 h-4" />
                          <span>Delivery Information</span>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Shipping Address</p>
                          <p className="text-gray-700 leading-tight">
                            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Delivery Appointment</p>
                          <p className="text-gray-700 font-semibold mt-0.5">
                            {formatDate(order.deliveryDate)}
                          </p>
                          <p className="text-gray-500 mt-0.5">{order.deliverySlot}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Order actions footer */}
                  {order.status === 'Scheduled' && (
                    <div className="bg-gray-50/30 p-4 border-t border-gray-100 flex items-center justify-end">
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={actionLoading}
                        className="btn btn-secondary btn-sm inline-flex items-center space-x-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )
        ) : (
          /* ================= MAINTENANCE TAB ================= */
          maintenanceTickets.length === 0 ? (
            <div className="card-premium p-16 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100">
                <Wrench className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Repair Requests</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                You haven't filed any maintenance or repair requests yet. Go to "Active Leases" to file a ticket.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {maintenanceTickets.map((ticket) => (
                <div key={ticket._id} className="card-premium p-6 hover:shadow-xl transition-all border border-gray-100">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Item Info */}
                    <div className="lg:col-span-4 flex items-center space-x-4">
                      <img
                        src={ticket.product?.imageUrl || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300&auto=format&fit=crop'}
                        alt={ticket.product?.name || 'Asset'}
                        className="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded">
                          Ticket #{ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base leading-tight mt-1">
                          {ticket.product?.name || 'Asset'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Classification: <b className="text-cyan-700">{ticket.issueType}</b></p>
                      </div>
                    </div>

                    {/* Complaint Description */}
                    <div className="lg:col-span-4 text-sm text-gray-600">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Issue Description</p>
                      <p className="italic text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                        "{ticket.description}"
                      </p>
                    </div>

                    {/* Visit Appointment */}
                    <div className="lg:col-span-2 text-sm text-gray-600">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Timing Details</p>
                      <p className="font-bold text-gray-900">{formatDate(ticket.preferredDate)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ticket.preferredSlot}</p>
                    </div>

                    {/* Status badge */}
                    <div className="lg:col-span-2 flex flex-col items-start lg:items-end">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                        ticket.status === 'Open'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : ticket.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : ticket.status === 'Resolved'
                          ? 'bg-green-50 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                  </div>

                  {/* Admin notes if any */}
                  {ticket.adminNotes && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-start space-x-2 text-xs text-emerald-800 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[9px] text-emerald-700">Admin Response:</span>
                        <p className="mt-0.5 leading-relaxed font-medium">{ticket.adminNotes}</p>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ================= MODAL: EXTEND LEASE ================= */}
      {activeModal === 'extend' && selectedRental && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-cyan-900 to-cyan-800 text-white">
              <div className="flex items-center space-x-2">
                <CalendarPlus className="w-5 h-5" />
                <h3 className="font-extrabold text-lg">Extend Lease Tenure</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExtension} className="p-6 space-y-6">
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 flex items-start space-x-3">
                <img
                  src={selectedRental.product?.imageUrl}
                  alt={selectedRental.product?.name}
                  className="w-12 h-12 object-cover rounded-lg bg-white border flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">{selectedRental.product?.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Current lease ends: <b>{formatDate(selectedRental.endDate)}</b></p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Extension Plan
                </label>
                <select
                  value={extendTenure}
                  onChange={(e) => setExtendTenure(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 font-medium text-sm transition-all"
                >
                  <option value="1">Extend by 1 Month</option>
                  <option value="3">Extend by 3 Months</option>
                  <option value="6">Extend by 6 Months</option>
                  <option value="12">Extend by 12 Months</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  * Pricing will automatically adjust to the respective plan rate configured by the admin.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn btn-secondary flex-1 justify-center py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary flex-1 justify-center py-3 disabled:opacity-50"
                >
                  {actionLoading ? 'Extending...' : 'Confirm Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE RETURN ================= */}
      {activeModal === 'return' && selectedRental && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-800 to-amber-700 text-white">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <h3 className="font-extrabold text-lg">Schedule Return Pickup</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="p-6 space-y-5">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1">Return & Setup Guidelines:</p>
                Our crew will arrive at the scheduled time to inspect the furniture/appliances and pack them. Deposits are fully refunded to the source account within 48 hours of asset collection.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Pickup Date
                  </label>
                  <input
                    type="date"
                    min={minDateString}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Time Slot
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm font-medium transition-all"
                  >
                    <option value="09:00 AM - 01:00 PM">Morning (9:00 AM - 1:00 PM)</option>
                    <option value="02:00 PM - 06:00 PM">Afternoon (2:00 PM - 6:00 PM)</option>
                    <option value="06:00 PM - 10:00 PM">Evening (6:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn btn-secondary flex-1 justify-center py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary flex-1 justify-center py-3 bg-amber-600 hover:bg-amber-700 focus:ring-amber-200 disabled:opacity-50"
                >
                  {actionLoading ? 'Scheduling...' : 'Request Pickup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST MAINTENANCE ================= */}
      {activeModal === 'maintenance' && selectedRental && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 via-cyan-950 to-cyan-900 text-white">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-lg">Request Maintenance</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMaintenance} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Issue Classification
                </label>
                <select
                  value={maintenanceIssue}
                  onChange={(e) => setMaintenanceIssue(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm font-medium transition-all"
                >
                  <option value="Damage">Accidental Damage</option>
                  <option value="Malfunction">Functional Malfunction</option>
                  <option value="Replacement">Request Replacement / Upgrade</option>
                  <option value="General Service">General Service / Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Describe the Issue
                </label>
                <textarea
                  value={maintenanceDesc}
                  onChange={(e) => setMaintenanceDesc(e.target.value)}
                  rows="3"
                  placeholder="Tell us what is wrong with the product. E.g. leg of the table is loose..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Preferred Visit Date
                  </label>
                  <input
                    type="date"
                    min={minDateString}
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-xs font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Preferred Slot
                  </label>
                  <select
                    value={maintenanceSlot}
                    onChange={(e) => setMaintenanceSlot(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-xs font-medium transition-all"
                  >
                    <option value="09:00 AM - 01:00 PM">Morning (9am - 1pm)</option>
                    <option value="02:00 PM - 06:00 PM">Afternoon (2pm - 6pm)</option>
                    <option value="06:00 PM - 10:00 PM">Evening (6pm - 10pm)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-150 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn btn-secondary flex-1 justify-center py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary flex-1 justify-center py-2.5 disabled:opacity-50 animate-pulse-subtle"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyRentals;