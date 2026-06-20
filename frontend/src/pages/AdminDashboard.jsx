import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CircleDollarSign, Percent, Truck, Wrench, PlusCircle, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();

  const [stats, setStats] = useState({
    mrr: 0,
    utilizationRate: 0,
    rentedAssetsCount: 0,
    availableAssetsCount: 0,
    totalUsers: 0,
    totalOrders: 0,
    activeOrders: 0,
    openMaintenance: 0,
    resolvedMaintenance: 0,
    returnRequestsCount: 0,
  });

  const [orders, setOrders] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dashboard Sub-tabs
  const [adminTab, setAdminTab] = useState('reports'); // reports | inventory | deliveries | tickets

  // Add Product Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [subCategory, setSubCategory] = useState('Bed');
  const [imageUrl, setImageUrl] = useState('');
  const [price1, setPrice1] = useState('');
  const [price3, setPrice3] = useState('');
  const [price6, setPrice6] = useState('');
  const [price12, setPrice12] = useState('');
  const [deposit, setDeposit] = useState('');
  const [inventory, setInventory] = useState('');
  
  // Maintenance response state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('In Progress');
  const [adminNotes, setAdminNotes] = useState('');

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Analytics Stats
        const statsRes = await fetch('http://localhost:5500/api/admin/stats', { headers });
        let statsData = { success: false };
        if (statsRes.ok) {
          statsData = await statsRes.json();
        } else {
          // Fallback to 5000 if 5500 fails
          const statsResAlt = await fetch('http://localhost:5000/api/admin/stats', { headers });
          statsData = await statsResAlt.json();
        }

        // 2. Fetch Orders
        const ordRes = await fetch('http://localhost:5000/api/orders/all', { headers });
        const ordData = await ordRes.json();

        // 3. Fetch Rentals
        const rentRes = await fetch('http://localhost:5000/api/rentals/admin/all', { headers });
        const rentData = await rentRes.json();

        // 4. Fetch Tickets
        const tktRes = await fetch('http://localhost:5000/api/rentals/maintenance/all', { headers });
        const tktData = await tktRes.json();

        // 5. Fetch Products
        const prodRes = await fetch('http://localhost:5000/api/products');
        const prodData = await prodRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (ordData.success) setOrders(ordData.orders);
        if (rentData.success) setRentals(rentData.rentals);
        if (tktData.success) setTickets(tktData.tickets);
        if (prodData.success) setProducts(prodData.products);

      } catch (err) {
        console.error('Error loading admin details, retrying on port 5000 directly:', err);
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
          const statsData = await statsRes.json();
          const ordRes = await fetch('http://localhost:5000/api/orders/all', { headers });
          const ordData = await ordRes.json();
          const rentRes = await fetch('http://localhost:5000/api/rentals/admin/all', { headers });
          const rentData = await rentRes.json();
          const tktRes = await fetch('http://localhost:5000/api/rentals/maintenance/all', { headers });
          const tktData = await tktRes.json();
          const prodRes = await fetch('http://localhost:5000/api/products');
          const prodData = await prodRes.json();

          if (statsData.success) setStats(statsData.stats);
          if (ordData.success) setOrders(ordData.orders);
          if (rentData.success) setRentals(rentData.rentals);
          if (tktData.success) setTickets(tktData.tickets);
          if (prodData.success) setProducts(prodData.products);
        } catch (innerErr) {
          console.error(innerErr);
          setErrorMsg('Failed to fetch data from backend administration APIs.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token, refreshTrigger]);

  // Handle Mark as Delivered
  const handleMarkAsDelivered = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Complete Return Pickup (restocks)
  const handleCompleteReturn = async (rentalId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/${rentalId}/return-complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Product submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !imageUrl || !price1 || !price3 || !price6 || !price12 || !deposit || !inventory) {
      alert('Please complete all product details');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          category,
          subCategory,
          imageUrl,
          pricing: {
            1: Number(price1),
            3: Number(price3),
            6: Number(price6),
            12: Number(price12)
          },
          deposit: Number(deposit),
          inventory: Number(inventory)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Product added successfully!');
        // Reset form
        setName('');
        setDescription('');
        setImageUrl('');
        setPrice1('');
        setPrice3('');
        setPrice6('');
        setPrice12('');
        setDeposit('');
        setInventory('');
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Update Maintenance Ticket
  const handleUpdateTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/maintenance/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: ticketStatus, adminNotes })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(data.message || 'Ticket update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative animate-slide-up">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Title */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start">
            <LayoutDashboard className="h-9 w-9 mr-3.5 text-brand-600" />
            Admin Board
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-semibold font-medium">Manage warehouse stock, verify delivery schedules, and oversee operations analytics.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mx-auto md:mx-0 shadow-sm">
          <button
            onClick={() => setAdminTab('reports')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              adminTab === 'reports' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KPIs & Reports
          </button>
          <button
            onClick={() => setAdminTab('inventory')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              adminTab === 'inventory' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setAdminTab('deliveries')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              adminTab === 'deliveries' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Logistics
          </button>
          <button
            onClick={() => setAdminTab('tickets')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              adminTab === 'tickets' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Service Tickets
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-205 text-red-700 p-4.5 rounded-2xl text-xs mb-6 shadow-sm">
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-xs font-bold tracking-wider uppercase">Loading Admin Data...</span>
        </div>
      ) : (
        <div className="space-y-8 font-semibold">
          
          {/* TAB 1: REPORTS & KPIs */}
          {adminTab === 'reports' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* KPI Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* MRR Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl text-emerald-600">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Monthly Revenue</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">₹{stats.mrr}</h3>
                    <span className="text-[9px] text-emerald-600 flex items-center mt-1 font-bold uppercase tracking-wide">
                      Leases <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* Utilization rate Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                  <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-brand-600">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Asset Utilization</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.utilizationRate}%</h3>
                    <span className="text-[9px] text-slate-450 mt-1 block font-bold uppercase tracking-wide">
                      Rent: {stats.rentedAssetsCount} / Tot: {stats.rentedAssetsCount + stats.availableAssetsCount}
                    </span>
                  </div>
                </div>

                {/* Delivery Backlog Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-650">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Deliveries pending</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.activeOrders}</h3>
                    <span className="text-[9px] text-indigo-650 mt-1 block font-bold uppercase tracking-wide">
                      Awaiting Dispatch
                    </span>
                  </div>
                </div>

                {/* Repairs Backlog Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl text-pink-650">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Open Repairs</span>
                    <h3 className="text-2xl font-black text-slate-805 mt-1">{stats.openMaintenance}</h3>
                    <span className="text-[9px] text-slate-450 mt-1 block font-bold uppercase tracking-wide">
                      Resolved: {stats.resolvedMaintenance}
                    </span>
                  </div>
                </div>

              </div>

              {/* General details table or graph mockup */}
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-left">
                <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wide">Operations Overview</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-500">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Total Customers</span>
                    <span className="text-3xl font-black text-slate-800 block mt-1.5">{stats.totalUsers}</span>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Return Pickups Awaiting approval</span>
                    <span className="text-3xl font-black text-amber-600 block mt-1.5">{stats.returnRequestsCount}</span>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Unique Catalog Items</span>
                    <span className="text-3xl font-black text-indigo-650 block mt-1.5">{products.length}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT */}
          {adminTab === 'inventory' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              
              {/* Product Creation Form */}
              <form onSubmit={handleAddProductSubmit} className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4.5 text-left">
                <h3 className="text-lg font-bold text-slate-900 flex items-center mb-2 uppercase tracking-wide">
                  <PlusCircle className="h-5 w-5 mr-2 text-brand-600" />
                  Add New Product
                </h3>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl py-2 px-3 text-slate-850 text-xs focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Appliances">Appliances</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="subCategory">Subcategory</label>
                    <input
                      id="subCategory"
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="e.g. Bed, Sofa, TV"
                      className="w-full glass-input rounded-xl py-2 px-3 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="prodName">Product Name</label>
                  <input
                    id="prodName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Classic wooden study table..."
                    className="w-full glass-input rounded-xl py-2.5 px-3 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="prodDesc">Description</label>
                  <textarea
                    id="prodDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about size, fabric, material, etc..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 px-3 text-slate-800 text-xs resize-none focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="prodImg">Image URL</label>
                  <input
                    id="prodImg"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full glass-input rounded-xl py-2.5 px-3 text-slate-800 text-xs"
                  />
                </div>

                {/* Rental plan pricing */}
                <div>
                  <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-2">Monthly Prices by Lease Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[8px] text-slate-450 text-center font-bold uppercase block mb-1">1 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price1}
                        onChange={(e) => setPrice1(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-slate-800 text-xs text-center focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-455 text-center font-bold uppercase block mb-1">3 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price3}
                        onChange={(e) => setPrice3(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-slate-800 text-xs text-center focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-455 text-center font-bold uppercase block mb-1">6 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price6}
                        onChange={(e) => setPrice6(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-slate-800 text-xs text-center focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-455 text-center font-bold uppercase block mb-1">12 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price12}
                        onChange={(e) => setPrice12(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-slate-800 text-xs text-center focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="prodDep">Deposit</label>
                    <input
                      id="prodDep"
                      type="number"
                      placeholder="₹ Amount"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full glass-input rounded-xl py-2 px-3 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5" htmlFor="prodStock">Quantity</label>
                    <input
                      id="prodStock"
                      type="number"
                      placeholder="Units"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      className="w-full glass-input rounded-xl py-2 px-3 text-slate-805 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md mt-2"
                >
                  Create Catalog Entry
                </button>
              </form>

              {/* Warehouse Inventory Stock List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
                <h3 className="text-lg font-bold text-slate-900 mb-5 uppercase tracking-wide">Warehouse Inventory List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-400">
                    <thead className="text-[9px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="pb-3.5 text-slate-500">Product Name</th>
                        <th className="pb-3.5 text-center text-slate-500">Category</th>
                        <th className="pb-3.5 text-right text-slate-500">Deposit</th>
                        <th className="pb-3.5 text-right text-slate-500">Remaining Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-bold text-slate-800 flex items-center space-x-2.5">
                            <img src={p.imageUrl} alt="" className="h-8.5 w-8.5 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200" />
                            <span className="line-clamp-1">{p.name}</span>
                          </td>
                          <td className="py-3.5 text-center text-slate-600">{p.category} ({p.subCategory})</td>
                          <td className="py-3.5 text-right text-slate-700">₹{p.deposit}</td>
                          <td className={`py-3.5 text-right font-extrabold ${p.inventory <= 2 ? 'text-red-650' : 'text-emerald-700'}`}>
                            {p.inventory} Units
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DELIVERIES & PICKUPS */}
          {adminTab === 'deliveries' && (
            <div className="space-y-8 text-left animate-fadeIn">
              
              {/* Deliveries section */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center uppercase tracking-wide">
                  <Truck className="h-5 w-5 mr-2.5 text-indigo-600" />
                  Scheduled Deliveries Backlog
                </h3>

                {orders.filter(o => o.status === 'Scheduled').length === 0 ? (
                  <p className="text-slate-505 text-xs py-5 text-center font-bold uppercase tracking-wider">No scheduled deliveries awaiting dispatch.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="text-[9px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="pb-3.5 text-slate-500">Customer</th>
                          <th className="pb-3.5 text-slate-500">Scheduled Slot</th>
                          <th className="pb-3.5 text-slate-500">Items</th>
                          <th className="pb-3.5 text-slate-500">Destination Address</th>
                          <th className="pb-3.5 text-center text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {orders.filter(o => o.status === 'Scheduled').map((o) => (
                          <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <span className="font-bold text-slate-800 block">{o.user?.name}</span>
                              <span className="text-slate-500 text-[10px]">{o.user?.email}</span>
                            </td>
                            <td className="py-4">
                              <span className="text-slate-800 block">{new Date(o.deliveryDate).toDateString()}</span>
                              <span className="text-[10px] text-indigo-650 block font-bold tracking-wider uppercase mt-1">{o.deliverySlot}</span>
                            </td>
                            <td className="py-4">
                              <div className="space-y-1">
                                {o.items?.map((item, idx) => (
                                  <div key={idx} className="text-[10px] text-slate-700">
                                    • {item.product?.name || 'Asset'} ({item.tenure} mo • Qty {item.quantity})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 max-w-[160px] leading-relaxed text-slate-600 font-medium">
                              {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state}
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleMarkAsDelivered(o._id)}
                                className="px-4 py-2 bg-emerald-50 border border-emerald-250 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all"
                              >
                                Mark Delivered
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Returns section */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center uppercase tracking-wide">
                  <Wrench className="h-5 w-5 mr-2.5 text-amber-600" />
                  Lease Return Pickups backlog
                </h3>

                {rentals.filter(r => r.status === 'ReturnRequested').length === 0 ? (
                  <p className="text-slate-505 text-xs py-5 text-center font-bold uppercase tracking-wider">No asset return requests pending.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="text-[9px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="pb-3.5 text-slate-500">Customer</th>
                          <th className="pb-3.5 text-slate-500">Asset</th>
                          <th className="pb-3.5 text-slate-500">Lease Cost</th>
                          <th className="pb-3.5 text-slate-500">Pickup Slot</th>
                          <th className="pb-3.5 text-center text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {rentals.filter(r => r.status === 'ReturnRequested').map((r) => (
                          <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <span className="font-bold text-slate-800 block">{r.user?.name}</span>
                              <span className="text-slate-500 text-[10px]">{r.user?.email}</span>
                            </td>
                            <td className="py-4">
                              <span className="text-slate-800 block">{r.product?.name}</span>
                              <span className="text-slate-500 text-[10px] mt-1 block font-bold uppercase tracking-wider">{r.tenure} mo plan • Qty {r.quantity}</span>
                            </td>
                            <td className="py-4 text-slate-700">₹{r.pricePerMonth * r.quantity}/mo</td>
                            <td className="py-4">
                              <span className="font-bold text-amber-600 block">{new Date(r.returnDetails?.pickupDate).toDateString()}</span>
                              <span className="text-slate-500 text-[10px] block mt-1">{r.returnDetails?.pickupSlot}</span>
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleCompleteReturn(r._id)}
                                className="px-4 py-2 bg-amber-50 border border-amber-250 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all"
                              >
                                Approve Pickup
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: SERVICE MAINTENANCE TICKETS */}
          {adminTab === 'tickets' && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center uppercase tracking-wide">
                  <Wrench className="h-5 w-5 mr-2.5 text-pink-500" />
                  Service & Repairs Backlog
                </h3>

                {tickets.length === 0 ? (
                  <p className="text-slate-505 text-xs py-5 text-center font-bold uppercase tracking-wider">No support service tickets found.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 font-bold">
                    {tickets.map((tkt) => (
                      <div key={tkt._id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative hover:border-slate-250 transition-colors">
                        
                        {/* Status Badge */}
                        <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          tkt.status === 'Open' ? 'bg-pink-50 border-pink-200 text-pink-700' :
                          tkt.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-emerald-50 border-emerald-250 text-emerald-700'
                        }`}>
                          {tkt.status}
                        </span>

                        <div className="mb-4">
                          <div className="text-[10px] text-slate-500 mb-1.5 flex items-center space-x-2">
                            <span className="font-extrabold text-pink-600 uppercase tracking-wider">{tkt.issueType}</span>
                            <span>•</span>
                            <span>Customer: {tkt.user?.name}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-800">{tkt.product?.name}</h4>
                        </div>

                        <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed mb-4 font-semibold">
                          <strong className="text-slate-805 block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-450">Details:</strong>
                          "{tkt.description}"
                        </p>

                        <div className="text-[10px] text-slate-500 mb-4 flex justify-between">
                          <span>Preferred Date:</span>
                          <span className="text-slate-850 font-bold">{new Date(tkt.preferredDate).toDateString()} ({tkt.preferredSlot})</span>
                        </div>

                        {tkt.adminNotes && (
                          <div className="text-xs text-indigo-755 italic mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl font-semibold">
                            <strong className="text-indigo-700 block text-[9px] uppercase font-bold tracking-wider not-italic mb-1">Diagnostics Notes:</strong>
                            "{tkt.adminNotes}"
                          </div>
                        )}

                        {tkt.status !== 'Resolved' && (
                          <button
                            onClick={() => { setSelectedTicket(tkt); setAdminNotes(tkt.adminNotes || ''); setTicketStatus(tkt.status); }}
                            className="px-4 py-2 bg-white hover:bg-brand-600 text-slate-700 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 hover:border-transparent"
                          >
                            Update Ticket
                          </button>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TICKET RESPONSE DIALOG */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-md animate-fadeIn">
          <div className="glass-premium p-6 md:p-8 rounded-3xl w-full max-w-md border border-slate-250/60 text-left animate-scaleUp">
            
            <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-wide">Update Ticket</h3>
            <p className="text-xs text-slate-500 mb-5 font-semibold">Asset: {selectedTicket.product?.name}</p>

            <form onSubmit={handleUpdateTicketSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2" htmlFor="ticketStat">
                  Update Service Status
                </label>
                <select
                  id="ticketStat"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-250 rounded-xl py-3 px-4 text-slate-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="Open">Open (Awaiting Technician)</option>
                  <option value="In Progress">In Progress (Technician Assigned)</option>
                  <option value="Resolved">Resolved (Service Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2" htmlFor="notes">
                  Technician Diagnostics Notes
                </label>
                <textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record what repair actions were taken or schedule details..."
                  rows={4}
                  className="w-full bg-white border border-slate-200 hover:border-slate-250 rounded-xl py-3 px-4 text-slate-850 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  Save Updates
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
