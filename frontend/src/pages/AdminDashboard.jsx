import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  BarChart3, Users, Package, TrendingUp, AlertCircle, 
  RefreshCw, CheckCircle2, Clock, Wrench, Ban, Check, 
  ChevronRight, Calendar, User, ShoppingBag, X, MessageSquare, ShieldCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, isAuthenticated, isAdmin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard Tab state
  const [adminTab, setAdminTab] = useState('orders'); // 'orders', 'leases', 'maintenance'
  
  // Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('Open');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Orders
      const resOrders = await fetch(`${API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataOrders = await resOrders.json();

      // 2. Fetch Rentals
      const resRentals = await fetch(`${API_URL}/rentals/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataRentals = await resRentals.json();

      // 3. Fetch Maintenance Tickets
      const resMaint = await fetch(`${API_URL}/rentals/maintenance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataMaint = await resMaint.json();

      if (dataOrders.success) setOrders(dataOrders.orders || []);
      if (dataRentals.success) setRentals(dataRentals.rentals || []);
      if (dataMaint.success) setMaintenanceTickets(dataMaint.tickets || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch system data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Deliver Order
  const handleDeliverOrder = async (orderId) => {
    if (!window.confirm('Mark this order as Delivered? This will establish active lease agreements for the customer.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Order delivered successfully. Active leases created.');
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Delivery update failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error marking order delivered');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? This restores product inventory.')) {
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
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Cancellation failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error cancelling order');
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Rental Return (Restores stock)
  const handleCompleteReturn = async (rentalId) => {
    if (!window.confirm('Confirm asset return pickup complete? This restores stock inventory levels.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/rentals/${rentalId}/return-complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Asset return confirmed! Product inventory restocked.');
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Return completion failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error completing return');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Maintenance Ticket
  const handleUpdateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/rentals/maintenance/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: ticketStatus, adminNotes })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Maintenance ticket updated successfully!');
        setSelectedTicket(null);
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Failed to update ticket');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error updating maintenance ticket');
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

  // Calculations for stats card
  const activeRentalsCount = rentals.filter(r => r.status === 'Active' || r.status === 'Extended' || r.status === 'ReturnRequested').length;
  const pendingRepairsCount = maintenanceTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const totalLeaseRevenue = rentals.reduce((sum, r) => sum + r.pricePerMonth, 0);

  if (!isAdmin) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto text-center px-6 py-24">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Administrators privileges are required to view this area.</p>
          <Link to="/" className="btn btn-primary inline-flex">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white min-h-screen pb-16 relative">
      
      {/* Toast Notification */}
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-base">
              Monitor catalog orders, active leasing agreements, and manage customer service requests.
            </p>
          </div>
          
          <button 
            onClick={fetchAdminData}
            disabled={loading}
            className="btn btn-secondary inline-flex items-center space-x-2 text-sm self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Servers</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: 'Total System Orders',
              value: orders.length,
              icon: Package,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'Active Lease Units',
              value: activeRentalsCount,
              icon: TrendingUp,
              color: 'from-cyan-500 to-teal-500',
            },
            {
              title: 'Pending Repairs',
              value: pendingRepairsCount,
              icon: Wrench,
              color: 'from-orange-500 to-amber-500',
            },
            {
              title: 'Monthly Recurring Rent',
              value: `₹${totalLeaseRevenue}`,
              icon: BarChart3,
              color: 'from-emerald-500 to-teal-600',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="card-premium p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform duration-300"></div>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-4 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">{stat.title}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 mb-8 p-1 bg-gray-100/80 backdrop-blur-md rounded-xl max-w-xl">
          <button
            onClick={() => setAdminTab('orders')}
            className={`flex-1 py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              adminTab === 'orders'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('leases')}
            className={`flex-1 py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              adminTab === 'leases'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Active Leases</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {rentals.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('maintenance')}
            className={`flex-1 py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              adminTab === 'maintenance'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Complaints</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {maintenanceTickets.length}
            </span>
          </button>
        </div>

        {/* Tab content panel */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
            </div>
            <span className="text-gray-500 text-sm">Syncing records...</span>
          </div>
        ) : error ? (
          <div className="card-premium p-12 text-center text-red-600 max-w-xl mx-auto">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-bold mb-2">Syncing Failed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        ) : adminTab === 'orders' ? (
          /* ================= ADMIN ORDERS TAB ================= */
          orders.length === 0 ? (
            <div className="card-premium p-16 text-center text-gray-500">
              No orders have been submitted yet.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="card-premium p-6 border border-gray-100 hover:shadow-lg transition-all">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    
                    {/* User and Placement Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center space-x-2 text-gray-400 font-semibold mb-1 text-xs uppercase tracking-wider">
                        <User className="w-3.5 h-3.5" />
                        <span>Customer</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">{order.user?.name || 'Customer'}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{order.user?.email || 'N/A'}</p>
                      <p className="text-[10px] font-mono text-gray-400 mt-2">ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    </div>

                    {/* Products details */}
                    <div className="lg:col-span-4 space-y-2 border-l border-r border-gray-100 px-4">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Items Ordered</span>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-700 font-medium">
                          <span className="line-clamp-1 flex-1 mr-2">{item.product?.name || 'Asset'}</span>
                          <span className="text-gray-500 flex-shrink-0">{item.tenure}mo plan × {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* DeliveryTiming details */}
                    <div className="lg:col-span-3 text-sm text-gray-600">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Appointment Timing</div>
                      <div className="flex items-center space-x-1.5 font-bold text-gray-900">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <span>{formatDate(order.deliveryDate)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-5">{order.deliverySlot}</p>
                      <p className="text-[10px] text-gray-400 mt-1 pl-5">City: {order.city}</p>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="lg:col-span-2 flex flex-col items-stretch space-y-2">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border text-center ${
                        order.status === 'Scheduled'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {order.status}
                      </span>
                      
                      {order.status === 'Scheduled' && (
                        <div className="flex flex-col space-y-1 pt-1">
                          <button
                            onClick={() => handleDeliverOrder(order._id)}
                            disabled={actionLoading}
                            className="btn btn-primary btn-sm text-[10px] justify-center py-2"
                          >
                            Mark Delivered
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={actionLoading}
                            className="btn btn-secondary btn-sm text-[10px] text-red-700 hover:bg-red-50 border-red-250 justify-center py-2"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )
        ) : adminTab === 'leases' ? (
          /* ================= ADMIN LEASES TAB ================= */
          rentals.length === 0 ? (
            <div className="card-premium p-16 text-center text-gray-500">
              No lease agreements are active.
            </div>
          ) : (
            <div className="space-y-6">
              {rentals.map((rental) => (
                <div key={rental._id} className="card-premium p-6 border border-gray-100 hover:shadow-lg transition-all">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    
                    {/* User and Lease product */}
                    <div className="lg:col-span-4 flex items-center space-x-4">
                      <img
                        src={rental.product?.imageUrl || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300&auto=format&fit=crop'}
                        alt="Product"
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{rental.product?.name || 'Asset'}</h4>
                        <p className="text-xs text-gray-500">User: <b>{rental.user?.name || 'N/A'}</b></p>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{rental.user?.email || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-3 text-xs text-gray-600 space-y-1">
                      <p>Started: <b>{formatDate(rental.startDate)}</b></p>
                      <p>Lease Ends: <b className="text-amber-700">{formatDate(rental.endDate)}</b></p>
                      <p className="text-[10px] text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded inline-block">Plan: {rental.tenure} Months</p>
                    </div>

                    {/* Rent & Deposit info */}
                    <div className="lg:col-span-2 text-sm">
                      <div className="text-[10px] text-gray-400 font-semibold mb-0.5 uppercase">Rent / Month</div>
                      <div className="font-black text-cyan-600">₹{rental.pricePerMonth}</div>
                      <div className="text-[10px] text-gray-500">Deposit: ₹{rental.deposit}</div>
                    </div>

                    {/* Status Badge */}
                    <div className="lg:col-span-1.5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        rental.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rental.status === 'Extended'
                          ? 'bg-violet-50 text-violet-800 border-violet-200'
                          : rental.status === 'ReturnRequested'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {rental.status}
                      </span>
                    </div>

                    {/* Complete Return action button */}
                    <div className="lg:col-span-1.5 flex justify-end">
                      {rental.status === 'ReturnRequested' ? (
                        <button
                          onClick={() => handleCompleteReturn(rental._id)}
                          disabled={actionLoading}
                          className="btn btn-primary btn-sm text-[10px] w-full py-2.5 justify-center bg-amber-600 hover:bg-amber-700 border-amber-750"
                        >
                          Confirm Pickup
                        </button>
                      ) : rental.status !== 'Returned' ? (
                        <button
                          onClick={() => handleCompleteReturn(rental._id)}
                          disabled={actionLoading}
                          className="btn btn-secondary btn-sm text-[10px] w-full py-2 justify-center"
                        >
                          Force Return
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">Returned</span>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ================= ADMIN MAINTENANCE TAB ================= */
          maintenanceTickets.length === 0 ? (
            <div className="card-premium p-16 text-center text-gray-500">
              No repair or maintenance tickets have been submitted.
            </div>
          ) : (
            <div className="space-y-6">
              {maintenanceTickets.map((ticket) => (
                <div key={ticket._id} className="card-premium p-6 border border-gray-150 hover:shadow-lg transition-all">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    
                    {/* User and Asset details */}
                    <div className="lg:col-span-3 flex items-center space-x-3">
                      <img
                        src={ticket.product?.imageUrl || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=300&auto=format&fit=crop'}
                        alt="Product"
                        className="w-14 h-14 object-cover rounded-lg bg-gray-50 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{ticket.product?.name || 'Asset'}</h4>
                        <p className="text-[10px] text-gray-500">User: <b>{ticket.user?.name || 'N/A'}</b></p>
                        <p className="text-[10px] font-mono text-cyan-600">ID: #{ticket._id.substring(ticket._id.length - 6).toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Complaint details */}
                    <div className="lg:col-span-4 px-3 border-l border-r border-gray-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">
                        Complaint Class: <b className="text-red-700">{ticket.issueType}</b>
                      </div>
                      <p className="text-xs text-gray-700 italic leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        "{ticket.description}"
                      </p>
                    </div>

                    {/* Timing appointment */}
                    <div className="lg:col-span-2.5 text-xs text-gray-600">
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Preferred Timings</div>
                      <p className="font-bold text-gray-900">{formatDate(ticket.preferredDate)}</p>
                      <p className="text-[10px] text-gray-500">{ticket.preferredSlot}</p>
                    </div>

                    {/* Status badge */}
                    <div className="lg:col-span-1.5 flex flex-col items-stretch space-y-2">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border text-center ${
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
                      
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setTicketStatus(ticket.status);
                          setAdminNotes(ticket.adminNotes || '');
                        }}
                        className="btn btn-secondary btn-sm text-[10px] justify-center py-1.5 border-cyan-200 hover:bg-cyan-50 font-bold text-cyan-700"
                      >
                        Update Ticket
                      </button>
                    </div>

                  </div>

                  {/* Render Admin note if present */}
                  {ticket.adminNotes && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-emerald-800 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[9px]">Admin Response:</span>
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

      {/* ================= MODAL: UPDATE TICKET ================= */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-850 text-white">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-lg">Update Repair Ticket</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicketSubmit} className="p-6 space-y-5">
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1 text-gray-700">
                <p>Customer: <b>{selectedTicket.user?.name}</b></p>
                <p>Asset: <b>{selectedTicket.product?.name}</b></p>
                <p>Complaint: <b>{selectedTicket.issueType}</b></p>
                <p className="italic mt-1.5 text-gray-500 bg-white p-2 rounded border border-gray-100">"{selectedTicket.description}"</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Update Ticket Status
                </label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 font-medium text-sm transition-all"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved (Complete)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Administrator Response / Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                  placeholder="E.g. Technician delegated, repair resolved, part replaced..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="btn btn-secondary flex-1 justify-center py-3"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary flex-1 justify-center py-3 disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;