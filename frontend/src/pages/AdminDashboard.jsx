import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Truck, Wrench, ShieldAlert, CircleDollarSign, Percent, PlusCircle, Check, ArrowUpRight, HelpCircle } from 'lucide-react';

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
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
        const statsData = await statsRes.json();

        // 2. Fetch Orders
        const ordRes = await fetch('http://localhost:5000/api/orders/all', { headers });
        const ordData = await ordRes.json();

        // 3. Fetch Rentals
        const rentRes = await fetch('http://localhost:5000/api/rentals/admin/all', { headers });
        const rentData = await rentRes.json();

        // 4. Fetch Tickets
        const tktRes = await fetch('http://localhost:5000/api/rentals/maintenance/all', { headers });
        const tktData = await tktRes.json();

        // 5. Fetch Products (for simple stock management list)
        const prodRes = await fetch('http://localhost:5000/api/products');
        const prodData = await prodRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (ordData.success) setOrders(ordData.orders);
        if (rentData.success) setRentals(rentData.rentals);
        if (tktData.success) setTickets(tktData.tickets);
        if (prodData.success) setProducts(prodData.products);

      } catch (err) {
        console.error('Error loading admin details:', err);
        setErrorMsg('Failed to fetch data from backend administration APIs.');
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Title */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white flex items-center justify-center md:justify-start">
            <LayoutDashboard className="h-9 w-9 mr-2 text-brand-400" />
            Administration Board
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage warehouse stock, verify delivery schedules, and oversee operations analytics</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mx-auto md:mx-0">
          <button
            onClick={() => setAdminTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              adminTab === 'reports' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            KPIs & Reports
          </button>
          <button
            onClick={() => setAdminTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              adminTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Inventory Mgmt
          </button>
          <button
            onClick={() => setAdminTab('deliveries')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              adminTab === 'deliveries' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Delivery & Pickups
          </button>
          <button
            onClick={() => setAdminTab('tickets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              adminTab === 'tickets' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Service Tickets
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Aggregating administrative logs...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: REPORTS & KPIs */}
          {adminTab === 'reports' && (
            <div className="space-y-8">
              
              {/* KPI Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* MRR Card */}
                <div className="glass p-6 rounded-3xl border-white/5 flex items-center space-x-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Monthly Recurring Revenue</span>
                    <h3 className="text-2xl font-black text-white mt-0.5">₹{stats.mrr}</h3>
                    <span className="text-[10px] text-emerald-400 flex items-center mt-0.5">
                      Active rentals lease values <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* Utilization rate Card */}
                <div className="glass p-6 rounded-3xl border-white/5 flex items-center space-x-4">
                  <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-400">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Asset Utilization Rate</span>
                    <h3 className="text-2xl font-black text-white mt-0.5">{stats.utilizationRate}%</h3>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Rented: {stats.rentedAssetsCount} / Total: {stats.rentedAssetsCount + stats.availableAssetsCount}
                    </span>
                  </div>
                </div>

                {/* Delivery Backlog Card */}
                <div className="glass p-6 rounded-3xl border-white/5 flex items-center space-x-4">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Scheduled Deliveries</span>
                    <h3 className="text-2xl font-black text-white mt-0.5">{stats.activeOrders}</h3>
                    <span className="text-[10px] text-indigo-300 mt-0.5 block font-medium">
                      Awaiting delivery processing
                    </span>
                  </div>
                </div>

                {/* Repairs Backlog Card */}
                <div className="glass p-6 rounded-3xl border-white/5 flex items-center space-x-4">
                  <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Open Service Tickets</span>
                    <h3 className="text-2xl font-black text-white mt-0.5">{stats.openMaintenance}</h3>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Resolved tickets: {stats.resolvedMaintenance}
                    </span>
                  </div>
                </div>

              </div>

              {/* General details table or graph mockup */}
              <div className="glass p-6 rounded-3xl border-white/5 text-left">
                <h3 className="text-lg font-bold text-white mb-4">Operations Status Brief</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                    <span className="text-xs text-gray-500 block">Total Registered Customers</span>
                    <span className="text-2xl font-black text-white block mt-1">{stats.totalUsers}</span>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                    <span className="text-xs text-gray-500 block">Return Pickups Pending</span>
                    <span className="text-2xl font-black text-amber-400 block mt-1">{stats.returnRequestsCount}</span>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                    <span className="text-xs text-gray-500 block">Total Catalog Items Count</span>
                    <span className="text-2xl font-black text-indigo-400 block mt-1">{products.length}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT */}
          {adminTab === 'inventory' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Product Creation Form */}
              <form onSubmit={handleAddProductSubmit} className="lg:col-span-5 glass p-6 rounded-3xl border-white/5 space-y-4 text-left">
                <h3 className="text-lg font-bold text-white flex items-center mb-2">
                  <PlusCircle className="h-5 w-5 mr-2 text-brand-400" />
                  Add New Product
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Appliances">Appliances</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="subCategory">Subcategory</label>
                    <input
                      id="subCategory"
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="e.g. Bed, Sofa, TV"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="prodName">Product Name</label>
                  <input
                    id="prodName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Classic wooden study table..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="prodDesc">Description</label>
                  <textarea
                    id="prodDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about size, fabric, material, etc..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs resize-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="prodImg">Image URL</label>
                  <input
                    id="prodImg"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                  />
                </div>

                {/* Rental plan pricing */}
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold uppercase mb-2">Monthly Prices by Lease Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[9px] text-gray-500 text-center block mb-0.5">1 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price1}
                        onChange={(e) => setPrice1(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 text-center block mb-0.5">3 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price3}
                        onChange={(e) => setPrice3(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 text-center block mb-0.5">6 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price6}
                        onChange={(e) => setPrice6(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 text-center block mb-0.5">12 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price12}
                        onChange={(e) => setPrice12(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="prodDep">Security Deposit</label>
                    <input
                      id="prodDep"
                      type="number"
                      placeholder="₹ Amount"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1" htmlFor="prodStock">In-Stock Quantity</label>
                    <input
                      id="prodStock"
                      type="number"
                      placeholder="Units"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md mt-2"
                >
                  Create Catalog Entry
                </button>
              </form>

              {/* Warehouse Inventory Stock List */}
              <div className="lg:col-span-7 glass p-6 rounded-3xl border-white/5 text-left">
                <h3 className="text-lg font-bold text-white mb-4">Warehouse Inventory List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-400">
                    <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-white/5">
                      <tr>
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3 text-center">Category</th>
                        <th className="pb-3 text-right">Refundable Deposit</th>
                        <th className="pb-3 text-right">Remaining Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-semibold text-white flex items-center space-x-2.5">
                            <img src={p.imageUrl} alt="" className="h-8 w-8 object-cover rounded-lg bg-slate-900 shrink-0" />
                            <span className="line-clamp-1">{p.name}</span>
                          </td>
                          <td className="py-3 text-center">{p.category} ({p.subCategory})</td>
                          <td className="py-3 text-right text-gray-300">₹{p.deposit}</td>
                          <td className={`py-3 text-right font-extrabold ${p.inventory <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>
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
            <div className="space-y-8 text-left">
              
              {/* Deliveries section */}
              <div className="glass p-6 rounded-3xl border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-indigo-400" />
                  Scheduled Deliveries Backlog
                </h3>

                {orders.filter(o => o.status === 'Scheduled').length === 0 ? (
                  <p className="text-gray-500 text-xs py-4">No scheduled deliveries awaiting processing.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-white/5">
                        <tr>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Scheduled Date/Slot</th>
                          <th className="pb-3">Items</th>
                          <th className="pb-3">Delivery Destination</th>
                          <th className="pb-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.filter(o => o.status === 'Scheduled').map((o) => (
                          <tr key={o._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4">
                              <span className="font-semibold text-white block">{o.user?.name}</span>
                              <span className="text-gray-500 text-[10px]">{o.user?.email}</span>
                            </td>
                            <td className="py-4 font-semibold text-gray-350">
                              <span>{new Date(o.deliveryDate).toDateString()}</span>
                              <span className="text-[10px] text-indigo-400 block font-normal">{o.deliverySlot}</span>
                            </td>
                            <td className="py-4">
                              <div className="space-y-1">
                                {o.items?.map((item, idx) => (
                                  <div key={idx} className="text-[10px] text-gray-300">
                                    • {item.product?.name || 'Asset'} ({item.tenure} mo • Qty {item.quantity})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 max-w-[150px] leading-relaxed">
                              {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state}
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleMarkAsDelivered(o._id)}
                                className="px-3.5 py-2 bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all"
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
              <div className="glass p-6 rounded-3xl border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Undo2 className="h-5 w-5 mr-2 text-amber-400" />
                  Lease Return Pickups backlog
                </h3>

                {rentals.filter(r => r.status === 'ReturnRequested').length === 0 ? (
                  <p className="text-gray-500 text-xs py-4">No asset return requests pending.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-white/5">
                        <tr>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Asset</th>
                          <th className="pb-3">Leased Rate</th>
                          <th className="pb-3">Pickup date/slot</th>
                          <th className="pb-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rentals.filter(r => r.status === 'ReturnRequested').map((r) => (
                          <tr key={r._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4">
                              <span className="font-semibold text-white block">{r.user?.name}</span>
                              <span className="text-gray-500 text-[10px]">{r.user?.email}</span>
                            </td>
                            <td className="py-4">
                              <span className="text-white block font-medium">{r.product?.name}</span>
                              <span className="text-gray-500 text-[10px]">{r.tenure} months tenure plan • Qty {r.quantity}</span>
                            </td>
                            <td className="py-4">₹{r.pricePerMonth * r.quantity}/mo</td>
                            <td className="py-4">
                              <span className="font-semibold text-amber-400 block">{new Date(r.returnDetails?.pickupDate).toDateString()}</span>
                              <span className="text-gray-500 text-[10px]">{r.returnDetails?.pickupSlot}</span>
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleCompleteReturn(r._id)}
                                className="px-3.5 py-2 bg-amber-950/80 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl font-bold transition-all"
                              >
                                Approve Pickup & Restock
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
            <div className="space-y-6 text-left">
              <div className="glass p-6 rounded-3xl border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-pink-400" />
                  Service & Repairs Backlog
                </h3>

                {tickets.length === 0 ? (
                  <p className="text-gray-500 text-xs py-4">No support service tickets found.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {tickets.map((tkt) => (
                      <div key={tkt._id} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-900 relative">
                        
                        {/* Status Badge */}
                        <span className={`absolute top-4 right-4 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          tkt.status === 'Open' ? 'bg-pink-950 border border-pink-500/20 text-pink-400' :
                          tkt.status === 'In Progress' ? 'bg-blue-950 border border-blue-500/20 text-blue-400' :
                          'bg-emerald-950 border border-emerald-500/20 text-emerald-400'
                        }`}>
                          {tkt.status}
                        </span>

                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 mb-1 flex items-center space-x-2">
                            <span className="font-extrabold text-pink-400 uppercase">{tkt.issueType}</span>
                            <span>•</span>
                            <span>Customer: {tkt.user?.name}</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{tkt.product?.name}</h4>
                        </div>

                        <p className="text-xs text-gray-400 bg-slate-900/40 p-3.5 rounded-xl border border-slate-900/60 leading-relaxed mb-4">
                          <strong className="text-white block text-[10px] uppercase font-bold tracking-wider mb-1 text-gray-500">Customer Description:</strong>
                          "{tkt.description}"
                        </p>

                        <div className="text-[10px] text-gray-500 mb-4 flex justify-between">
                          <span>Preferred Date:</span>
                          <span className="text-white font-medium">{new Date(tkt.preferredDate).toDateString()} ({tkt.preferredSlot})</span>
                        </div>

                        {tkt.adminNotes && (
                          <div className="text-xs text-gray-300 italic mb-4 p-3 bg-indigo-950/10 border border-indigo-500/10 rounded-xl">
                            <strong className="text-indigo-400 block text-[9px] uppercase font-bold tracking-wider not-italic mb-1">Previous Note:</strong>
                            "{tkt.adminNotes}"
                          </div>
                        )}

                        {tkt.status !== 'Resolved' && (
                          <button
                            onClick={() => { setSelectedTicket(tkt); setAdminNotes(tkt.adminNotes || ''); setTicketStatus(tkt.status); }}
                            className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all border border-slate-800"
                          >
                            Update Ticket Details
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-premium p-6 md:p-8 rounded-3xl w-full max-w-md border border-brand-500/20 text-left animate-scaleUp">
            
            <h3 className="text-xl font-bold text-white mb-1">Update Service Ticket</h3>
            <p className="text-xs text-gray-400 mb-6">Asset: {selectedTicket.product?.name}</p>

            <form onSubmit={handleUpdateTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="ticketStat">
                  Update Service Status
                </label>
                <select
                  id="ticketStat"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="Open">Open (Awaiting Technician)</option>
                  <option value="In Progress">In Progress (Technician Assigned)</option>
                  <option value="Resolved">Resolved (Service Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="notes">
                  Technician Diagnostics Notes
                </label>
                <textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record what repair actions were taken or schedule details..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-gray-300 font-bold rounded-xl text-xs transition-colors border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
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
