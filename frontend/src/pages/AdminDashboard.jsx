import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  BarChart3, Users, Package, TrendingUp, AlertCircle, 
  RefreshCw, CheckCircle2, Clock, Wrench, Ban, Check, 
  ChevronRight, Calendar, User, ShoppingBag, X, MessageSquare, ShieldCheck,
  Plus, Edit, Trash2, Shield, Eye, FileText, Download, MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, isAuthenticated, isAdmin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard Tab state
  const [adminTab, setAdminTab] = useState('orders'); // 'orders', 'leases', 'maintenance', 'inventory', 'users', 'partners'
  
  // Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('Open');
  const [adminNotes, setAdminNotes] = useState('');
  
  // For Product Modal (Create/Edit)
  const [selectedProduct, setSelectedProduct] = useState(null); // null for create, object for edit
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Furniture',
    subCategory: '',
    imageUrl: '',
    pricing: { 1: 0, 3: 0, 6: 0, 12: 0 },
    deposit: 0,
    inventory: 0,
    city: 'All'
  });
  const [productModalOpen, setProductModalOpen] = useState(false);

  // For Service Area
  const [newCityName, setNewCityName] = useState('');
  
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

      // 4. Fetch Products
      const resProds = await fetch(`${API_URL}/products`);
      const dataProds = await resProds.json();

      // 5. Fetch Users
      const resUsers = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataUsers = await resUsers.json();

      // 6. Fetch Businesses
      const resBiz = await fetch(`${API_URL}/admin/businesses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataBiz = await resBiz.json();

      // 7. Fetch Service Areas
      const resAreas = await fetch(`${API_URL}/admin/service-areas`);
      const dataAreas = await resAreas.json();

      if (dataOrders.success) setOrders(dataOrders.orders || []);
      if (dataRentals.success) setRentals(dataRentals.rentals || []);
      if (dataMaint.success) setMaintenanceTickets(dataMaint.tickets || []);
      if (dataProds.success) setProducts(dataProds.products || []);
      if (dataUsers.success) setUsers(dataUsers.users || []);
      if (dataBiz.success) setBusinesses(dataBiz.businesses || []);
      if (dataAreas.success) setServiceAreas(dataAreas.serviceAreas || []);
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

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Product deleted successfully!');
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error deleting product');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Product (Create / Edit)
  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = selectedProduct ? 'PUT' : 'POST';
      const endpoint = selectedProduct 
        ? `${API_URL}/products/${selectedProduct._id}`
        : `${API_URL}/products`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', selectedProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setProductModalOpen(false);
        setSelectedProduct(null);
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error saving product');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateProductModal = () => {
    setSelectedProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: 'Furniture',
      subCategory: '',
      imageUrl: '',
      pricing: { 1: 0, 3: 0, 6: 0, 12: 0 },
      deposit: 0,
      inventory: 0,
      city: 'All'
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      imageUrl: product.imageUrl,
      pricing: { ...product.pricing },
      deposit: product.deposit,
      inventory: product.inventory,
      city: product.city || 'All'
    });
    setProductModalOpen(true);
  };

  // Service Area Operations
  const handleAddServiceAreaSubmit = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/service-areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cityName: newCityName.trim(), isActive: true })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Service area added successfully!');
        setNewCityName('');
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Failed to add service area');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error adding service area');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleServiceArea = async (area) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/service-areas/${area._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !area.isActive })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Service area updated successfully!');
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Failed to update service area');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error updating service area');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteServiceArea = async (id) => {
    if (!window.confirm('Delete this service area?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/service-areas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Service area deleted successfully!');
        fetchAdminData();
      } else {
        showToast('error', data.message || 'Failed to delete service area');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error deleting service area');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV reports
  const handleExportCSV = (type) => {
    let csvContent = "";
    let fileName = "";

    if (type === 'rentals') {
      csvContent += "Lease ID,Customer Name,Customer Email,Product,Plan Duration (mo),Rent/Month,Deposit,Start Date,End Date,Status\n";
      rentals.forEach((r) => {
        const row = [
          r._id,
          r.user?.name || 'N/A',
          r.user?.email || 'N/A',
          `"${r.product?.name || 'Asset'}"`,
          r.tenure,
          r.pricePerMonth,
          r.deposit,
          formatDate(r.startDate),
          formatDate(r.endDate),
          r.status
        ].join(",");
        csvContent += row + "\n";
      });
      fileName = "rentease_leases_report.csv";
    } else if (type === 'orders') {
      csvContent += "Order ID,Customer Name,Customer Email,Total Monthly Amount,Total Deposit,Delivery Date,Delivery Slot,City,Status,Placed Date\n";
      orders.forEach((o) => {
        const row = [
          o._id,
          o.user?.name || 'N/A',
          o.user?.email || 'N/A',
          o.totalMonthlyAmount,
          o.totalDeposit,
          formatDate(o.deliveryDate),
          o.deliverySlot,
          o.city,
          o.status,
          formatDate(o.createdAt)
        ].join(",");
        csvContent += row + "\n";
      });
      fileName = "rentease_orders_report.csv";
    } else if (type === 'maintenance') {
      csvContent += "Ticket ID,Customer Name,Product,Issue Type,Description,Preferred Date,Preferred Slot,Status,Admin Notes\n";
      maintenanceTickets.forEach((t) => {
        const row = [
          t._id,
          t.user?.name || 'N/A',
          `"${t.product?.name || 'Asset'}"`,
          t.issueType,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          formatDate(t.preferredDate),
          t.preferredSlot,
          t.status,
          `"${(t.adminNotes || '').replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
      });
      fileName = "rentease_maintenance_report.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', `${type.toUpperCase()} report downloaded successfully!`);
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
          
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Export Reports Dropdown */}
            <div className="relative group">
              <button
                className="btn btn-secondary inline-flex items-center space-x-2 text-sm bg-white hover:bg-gray-50 border border-gray-200"
              >
                <Download className="w-4 h-4 text-cyan-600" />
                <span>Export CSV Report</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block hover:block z-40">
                <button
                  onClick={() => handleExportCSV('orders')}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 text-gray-700 hover:text-cyan-700 transition"
                >
                  Orders History CSV
                </button>
                <button
                  onClick={() => handleExportCSV('rentals')}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 text-gray-700 hover:text-cyan-700 transition border-t border-gray-100"
                >
                  Active Leases CSV
                </button>
                <button
                  onClick={() => handleExportCSV('maintenance')}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 text-gray-700 hover:text-cyan-700 transition border-t border-gray-100"
                >
                  Complaints Logs CSV
                </button>
              </div>
            </div>

            <button 
              onClick={fetchAdminData}
              disabled={loading}
              className="btn btn-secondary inline-flex items-center space-x-2 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Servers</span>
            </button>
          </div>
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
        <div className="flex flex-wrap border-b border-gray-200 mb-8 p-1 bg-gray-100/80 backdrop-blur-md rounded-xl max-w-5xl gap-1">
          <button
            onClick={() => setAdminTab('orders')}
            className={`py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
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
            className={`py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
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
            className={`py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
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

          <button
            onClick={() => setAdminTab('inventory')}
            className={`py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              adminTab === 'inventory'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              adminTab === 'users'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('partners')}
            className={`py-3 px-4 text-center text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              adminTab === 'partners'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Partners & Cities</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {businesses.length + serviceAreas.length}
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
        ) : adminTab === 'maintenance' ? (
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
        ) : adminTab === 'inventory' ? (
          /* ================= ADMIN INVENTORY TAB ================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500">Manage Catalog & Stock Levels</span>
              <button
                onClick={openCreateProductModal}
                className="btn btn-primary inline-flex items-center space-x-2 text-xs py-2 px-4 bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className="card-premium p-16 text-center text-gray-500">
                No products found in database.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-right">Rent (12m)</th>
                        <th className="p-4 text-right">Deposit</th>
                        <th className="p-4">City</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{p._id.substring(p._id.length - 8).toUpperCase()}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                              {p.category} / {p.subCategory}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                              p.inventory === 0 
                                ? 'bg-red-50 text-red-700' 
                                : p.inventory <= 3 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {p.inventory}
                            </span>
                          </td>
                          <td className="p-4 text-right font-black text-cyan-600">₹{p.pricing['12']}/mo</td>
                          <td className="p-4 text-right font-semibold">₹{p.deposit}</td>
                          <td className="p-4 font-semibold text-gray-500">{p.city}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 hover:bg-cyan-50 rounded text-cyan-600 transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="p-1.5 hover:bg-red-55 rounded text-red-600 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : adminTab === 'users' ? (
          /* ================= ADMIN USERS TAB ================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500">Registered Accounts & Customer Profiles</span>
            </div>

            {users.length === 0 ? (
              <div className="card-premium p-16 text-center text-gray-500">
                No users found.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Profile</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="font-bold text-gray-900">{u.name}</span>
                          </td>
                          <td className="p-4 font-mono text-xs text-gray-600">{u.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              u.role === 'admin' 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {u.role === 'admin' ? 'Manager' : 'Customer'}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= ADMIN PARTNERS & SERVICE CITIES TAB ================= */
          <div className="grid md:grid-cols-12 gap-8 animate-in fade-in duration-200">
            {/* Service Cities */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                  <span>Service Areas</span>
                </h3>
                
                <form onSubmit={handleAddServiceAreaSubmit} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                    disabled={actionLoading}
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !newCityName.trim()}
                    className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>

                {serviceAreas.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">No service areas loaded.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {serviceAreas.map((area) => (
                      <div key={area._id} className="flex items-center justify-between py-3 text-sm">
                        <span className="font-bold text-gray-800">{area.cityName}</span>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleServiceArea(area)}
                            disabled={actionLoading}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              area.isActive 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {area.isActive ? 'Active' : 'Inactive'}
                          </button>
                          {area.cityName !== 'All' && (
                            <button
                              onClick={() => handleDeleteServiceArea(area._id)}
                              disabled={actionLoading}
                              className="text-gray-400 hover:text-red-655 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Business Partners */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Seeded Business Partners</span>
                </h3>
                <p className="text-xs text-gray-500 mb-6">Vendors handling delivery, maintenance, and logistics.</p>

                {businesses.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">No business partners registered.</p>
                ) : (
                  <div className="space-y-4">
                    {businesses.map((biz) => (
                      <div key={biz._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-955 text-sm">{biz.name}</h4>
                            <span className="text-[10px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                              {biz.skillType}
                            </span>
                          </div>
                          <span className="font-bold text-cyan-600 text-xs bg-white px-2 py-1 rounded border border-gray-205">
                            Charge: ₹{biz.pricing}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Services Offered</span>
                          <div className="flex flex-wrap gap-1">
                            {biz.servicesOffered.map((serv, i) => (
                              <span key={i} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700">
                                {serv}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-3 text-right">
                          Linked Products: <b>{biz.products?.length || 0}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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

      {/* ================= MODAL: CREATE / EDIT PRODUCT ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-850 text-white">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-lg">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
              </div>
              <button 
                onClick={() => setProductModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. Royal Solid Wood King Bed"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <textarea
                    required
                    rows="2"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                    placeholder="Provide a compelling description of product details..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={productForm.subCategory}
                    onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. Bed, Sofa, Fridge, TV"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.deposit}
                    onChange={(e) => setProductForm({ ...productForm, deposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock (Inventory)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.inventory}
                    onChange={(e) => setProductForm({ ...productForm, inventory: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service City</label>
                  <select
                    value={productForm.city}
                    onChange={(e) => setProductForm({ ...productForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    {serviceAreas.map((area) => (
                      <option key={area._id} value={area.cityName}>
                        {area.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="border-t border-gray-150 pt-3">
                <label className="block text-xs font-black text-gray-600 uppercase mb-2">Monthly Rent Pricing Matrix (₹)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((tenure) => (
                    <div key={tenure}>
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">{tenure} Mo Plan</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={productForm.pricing[tenure]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setProductForm({
                            ...productForm,
                            pricing: {
                              ...productForm.pricing,
                              [tenure]: val
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-gray-250 rounded text-xs font-bold focus:border-cyan-500 focus:outline-none text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="btn btn-secondary flex-1 justify-center py-2.5"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary flex-1 justify-center py-2.5 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Product'}
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