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
    <div className="max-w-7xl mx-auto px-6 py-16 relative animate-slide-up">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Title */}
      <div className="mb-14 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <span className="text-[10px] text-violet-405 font-extrabold uppercase tracking-widest block font-display">Management Terminal</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5 flex items-center justify-center lg:justify-start">
            <LayoutDashboard className="h-9 w-9 mr-4 text-violet-550 animate-bounce-slow" />
            Admin Board
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Manage warehouse stock, verify delivery schedules, and oversee operations analytics.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-955/65 p-1 rounded-2xl border border-white/5 mx-auto lg:mx-0 shadow-lg">
          <button
            onClick={() => setAdminTab('reports')}
            className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-350 ${
              adminTab === 'reports' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            KPIs & Reports
          </button>
          <button
            onClick={() => setAdminTab('inventory')}
            className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-350 ${
              adminTab === 'inventory' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setAdminTab('deliveries')}
            className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-350 ${
              adminTab === 'deliveries' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Logistics
          </button>
          <button
            onClick={() => setAdminTab('tickets')}
            className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-350 ${
              adminTab === 'tickets' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Tickets
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-5 rounded-2xl text-xs mb-6 shadow-lg">
          <span className="font-extrabold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-extrabold tracking-widest uppercase">Loading Admin Data...</span>
        </div>
      ) : (
        <div className="space-y-8 font-semibold">
          
          {/* TAB 1: REPORTS & KPIs */}
          {adminTab === 'reports' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* KPI Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* MRR Card */}
                <div className="bg-[#111827]/40 border border-white/10 p-6 rounded-3xl shadow-lg flex items-center space-x-4">
                  <div className="p-4 bg-emerald-950/80 border border-emerald-900/30 rounded-2xl text-emerald-400">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Monthly Revenue</span>
                    <h3 className="text-2xl font-black text-white mt-1">₹{stats.mrr}</h3>
                    <span className="text-[9px] text-emerald-400 flex items-center mt-1 font-black uppercase tracking-widest">
                      Leases <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* Utilization rate Card */}
                <div className="bg-[#111827]/40 border border-white/10 p-6 rounded-3xl shadow-lg flex items-center space-x-4">
                  <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-300">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Asset Utilization</span>
                    <h3 className="text-2xl font-black text-white mt-1">{stats.utilizationRate}%</h3>
                    <span className="text-[9px] text-slate-405 mt-1 block font-extrabold uppercase tracking-widest text-[8px]">
                      Rent: {stats.rentedAssetsCount} / Tot: {stats.rentedAssetsCount + stats.availableAssetsCount}
                    </span>
                  </div>
                </div>

                {/* Delivery Backlog Card */}
                <div className="bg-[#111827]/40 border border-white/10 p-6 rounded-3xl shadow-lg flex items-center space-x-4">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-300">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Deliveries pending</span>
                    <h3 className="text-2xl font-black text-white mt-1">{stats.activeOrders}</h3>
                    <span className="text-[9px] text-indigo-300 mt-1 block font-extrabold uppercase tracking-widest text-[8px]">
                      Awaiting Dispatch
                    </span>
                  </div>
                </div>

                {/* Repairs Backlog Card */}
                <div className="bg-[#111827]/40 border border-white/10 p-6 rounded-3xl shadow-lg flex items-center space-x-4">
                  <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-405">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Open Repairs</span>
                    <h3 className="text-2xl font-black text-white mt-1">{stats.openMaintenance}</h3>
                    <span className="text-[9px] text-slate-405 mt-1 block font-extrabold uppercase tracking-widest text-[8px]">
                      Resolved: {stats.resolvedMaintenance}
                    </span>
                  </div>
                </div>

              </div>

              {/* General details table or graph mockup */}
              <div className="bg-[#111827]/40 border border-white/10 p-8 rounded-3xl shadow-lg text-left">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wide">Operations Overview</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
                  <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl shadow-inner">
                    <span className="text-[10px] text-slate-405 font-extrabold uppercase tracking-widest block">Total Customers</span>
                    <span className="text-3xl font-black text-white block mt-1.5">{stats.totalUsers}</span>
                  </div>
                  <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl shadow-inner">
                    <span className="text-[10px] text-slate-405 font-extrabold uppercase tracking-widest block">Return Pickups</span>
                    <span className="text-3xl font-black text-amber-400 block mt-1.5">{stats.returnRequestsCount} <span className="text-xs font-bold text-slate-500 uppercase ml-1">Pending</span></span>
                  </div>
                  <div className="p-5 bg-slate-955/60 border border-white/5 rounded-2xl shadow-inner">
                    <span className="text-[10px] text-slate-405 font-extrabold uppercase tracking-widest block">Unique Catalog Items</span>
                    <span className="text-3xl font-black text-violet-400 block mt-1.5">{products.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT */}
          {adminTab === 'inventory' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              
              {/* Product Creation Form */}
              <form onSubmit={handleAddProductSubmit} className="lg:col-span-5 bg-[#111827]/40 border border-white/10 p-7 rounded-3xl shadow-lg space-y-5 text-left">
                <h3 className="text-lg font-black text-white flex items-center mb-2 uppercase tracking-wider text-sm">
                  <PlusCircle className="h-5 w-5 mr-3 text-violet-400" />
                  Add New Product
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0f172a] border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      <option value="Furniture" className="bg-[#0f172a] text-white">Furniture</option>
                      <option value="Appliances" className="bg-[#0f172a] text-white">Appliances</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="subCategory">Subcategory</label>
                    <input
                      id="subCategory"
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="e.g. Bed, Sofa, TV"
                      className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-3.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="prodName">Product Name</label>
                  <input
                    id="prodName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Classic wooden study table..."
                    className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="prodDesc">Description</label>
                  <textarea
                    id="prodDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about size, fabric, material, etc..."
                    rows={2}
                    className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-4 text-white text-xs resize-none placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="prodImg">Image URL</label>
                  <input
                    id="prodImg"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>

                {/* Rental plan pricing */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2.5">Monthly Prices by Lease Period</label>
                  <div className="grid grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[8px] text-slate-500 text-center font-extrabold uppercase block mb-1">1 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price1}
                        onChange={(e) => setPrice1(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-1 text-white text-xs text-center placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 text-center font-extrabold uppercase block mb-1">3 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price3}
                        onChange={(e) => setPrice3(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-1 text-white text-xs text-center placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 text-center font-extrabold uppercase block mb-1">6 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price6}
                        onChange={(e) => setPrice6(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-1 text-white text-xs text-center placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 text-center font-extrabold uppercase block mb-1">12 Mo</span>
                      <input
                        type="number"
                        placeholder="₹"
                        value={price12}
                        onChange={(e) => setPrice12(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-1 text-white text-xs text-center placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="prodDep">Deposit</label>
                    <input
                      id="prodDep"
                      type="number"
                      placeholder="₹ Amount"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-3.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2" htmlFor="prodStock">Quantity</label>
                    <input
                      id="prodStock"
                      type="number"
                      placeholder="Units"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-2.5 px-3.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-violet-650/20 hover:scale-[1.01] mt-2 active:scale-95"
                >
                  Create Catalog Entry
                </button>
              </form>

              {/* Warehouse Inventory Stock List */}
              <div className="lg:col-span-7 bg-[#111827]/40 border border-white/10 p-7 rounded-3xl shadow-lg text-left">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider text-sm">Warehouse Inventory List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-400">
                    <thead className="text-[9px] uppercase font-bold text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="pb-4 text-slate-400">Product Name</th>
                        <th className="pb-4 text-center text-slate-400">Category</th>
                        <th className="pb-4 text-right text-slate-400">Deposit</th>
                        <th className="pb-4 text-right text-slate-400">Remaining Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-bold">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4.5 font-bold text-white flex items-center space-x-3">
                            <img src={p.imageUrl} alt="" className="h-8.5 w-8.5 object-cover rounded-lg bg-slate-900 shrink-0 border border-white/10 shadow-sm" />
                            <span className="line-clamp-1">{p.name}</span>
                          </td>
                          <td className="py-4.5 text-center text-slate-300 font-semibold">{p.category} ({p.subCategory})</td>
                          <td className="py-4.5 text-right text-slate-200">₹{p.deposit}</td>
                          <td className={`py-4.5 text-right font-black ${p.inventory <= 2 ? 'text-red-400' : 'text-emerald-405'}`}>
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
              <div className="bg-[#111827]/40 border border-white/10 p-7 rounded-3xl shadow-lg">
                <h3 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-wider text-sm">
                  <Truck className="h-5 w-5 mr-3 text-indigo-400" />
                  Scheduled Deliveries Backlog
                </h3>

                {orders.filter(o => o.status === 'Scheduled').length === 0 ? (
                  <p className="text-slate-400 text-xs py-6 text-center font-extrabold uppercase tracking-widest text-[10px]">No scheduled deliveries awaiting dispatch.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="text-[9px] uppercase font-bold text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="pb-4 text-slate-400">Customer</th>
                          <th className="pb-4 text-slate-400">Scheduled Slot</th>
                          <th className="pb-4 text-slate-400">Items</th>
                          <th className="pb-4 text-slate-400">Destination Address</th>
                          <th className="pb-4 text-center text-slate-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-bold">
                        {orders.filter(o => o.status === 'Scheduled').map((o) => (
                          <tr key={o._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4.5">
                              <span className="font-bold text-white block">{o.user?.name}</span>
                              <span className="text-slate-405 text-[10px]">{o.user?.email}</span>
                            </td>
                            <td className="py-4.5">
                              <span className="text-white block font-extrabold">{new Date(o.deliveryDate).toDateString()}</span>
                              <span className="text-[10px] text-indigo-400 block font-extrabold tracking-widest uppercase mt-1">{o.deliverySlot}</span>
                            </td>
                            <td className="py-4.5">
                              <div className="space-y-1 font-semibold text-slate-300">
                                {o.items?.map((item, idx) => (
                                  <div key={idx} className="text-[10px]">
                                    • {item.product?.name || 'Asset'} ({item.tenure} mo plan • Qty {item.quantity})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4.5 max-w-[165px] leading-relaxed text-slate-350 font-medium">
                              {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state}
                            </td>
                            <td className="py-4.5 text-center">
                              <button
                                onClick={() => handleMarkAsDelivered(o._id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold uppercase tracking-widest text-[9px] transition-all shadow-md active:scale-95"
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
              <div className="bg-[#111827]/40 border border-white/10 p-7 rounded-3xl shadow-lg">
                <h3 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-wider text-sm">
                  <Wrench className="h-5 w-5 mr-3 text-amber-400" />
                  Lease Return Pickups backlog
                </h3>

                {rentals.filter(r => r.status === 'ReturnRequested').length === 0 ? (
                  <p className="text-slate-400 text-xs py-6 text-center font-extrabold uppercase tracking-widest text-[10px]">No asset return requests pending.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                      <thead className="text-[9px] uppercase font-bold text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="pb-4 text-slate-400">Customer</th>
                          <th className="pb-4 text-slate-400">Asset</th>
                          <th className="pb-4 text-slate-400">Lease Cost</th>
                          <th className="pb-4 text-slate-400">Pickup Slot</th>
                          <th className="pb-4 text-center text-slate-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-bold">
                        {rentals.filter(r => r.status === 'ReturnRequested').map((r) => (
                          <tr key={r._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4.5">
                              <span className="font-bold text-white block">{r.user?.name}</span>
                              <span className="text-slate-405 text-[10px]">{r.user?.email}</span>
                            </td>
                            <td className="py-4.5">
                              <span className="text-white block font-extrabold">{r.product?.name}</span>
                              <span className="text-slate-405 text-[10px] mt-1 block font-extrabold uppercase tracking-widest">{r.tenure} mo plan • Qty {r.quantity}</span>
                            </td>
                            <td className="py-4.5 text-slate-300 font-extrabold">₹{r.pricePerMonth * r.quantity}/mo</td>
                            <td className="py-4.5">
                              <span className="font-extrabold text-amber-400 block">{new Date(r.returnDetails?.pickupDate).toDateString()}</span>
                              <span className="text-slate-405 text-[10px] block mt-1 tracking-wider">{r.returnDetails?.pickupSlot}</span>
                            </td>
                            <td className="py-4.5 text-center">
                              <button
                                onClick={() => handleCompleteReturn(r._id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-extrabold uppercase tracking-widest text-[9px] transition-all shadow-md active:scale-95"
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
              <div className="bg-[#111827]/40 border border-white/10 p-7 rounded-3xl shadow-lg">
                <h3 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-wider text-sm">
                  <Wrench className="h-5 w-5 mr-3 text-pink-400" />
                  Service & Repairs Backlog
                </h3>

                {tickets.length === 0 ? (
                  <p className="text-slate-400 text-xs py-6 text-center font-extrabold uppercase tracking-widest text-[10px]">No support service tickets found.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 font-bold">
                    {tickets.map((tkt) => (
                      <div key={tkt._id} className="bg-slate-950/60 border border-white/5 p-6.5 rounded-2xl relative hover:border-white/15 transition-all duration-300 shadow-md">
                        
                        {/* Status Badge */}
                        <span className={`absolute top-4.5 right-4.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                          tkt.status === 'Open' ? 'bg-pink-950/80 border-pink-900/30 text-pink-400' :
                          tkt.status === 'In Progress' ? 'bg-blue-950/80 border-blue-900/30 text-blue-400' :
                          'bg-emerald-955/80 border-emerald-900/30 text-emerald-400'
                        }`}>
                          {tkt.status}
                        </span>

                        <div className="mb-4.5">
                          <div className="text-[10px] text-slate-400 mb-1.5 flex items-center space-x-2.5">
                            <span className="font-extrabold text-pink-400 uppercase tracking-widest">{tkt.issueType}</span>
                            <span className="text-slate-800">•</span>
                            <span className="font-semibold text-slate-400">Cust: {tkt.user?.name}</span>
                          </div>
                          <h4 className="text-base font-extrabold text-white leading-tight">{tkt.product?.name}</h4>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-white/5 leading-relaxed mb-4.5 font-medium">
                          <strong className="text-slate-400 block text-[10px] uppercase font-extrabold tracking-widest mb-1.5">Details:</strong>
                          "{tkt.description}"
                        </p>

                        <div className="text-[10px] text-slate-400 mb-4.5 flex justify-between font-extrabold">
                          <span>Preferred Date:</span>
                          <span className="text-white font-bold">{new Date(tkt.preferredDate).toDateString()} ({tkt.preferredSlot})</span>
                        </div>

                        {tkt.adminNotes && (
                          <div className="text-xs text-indigo-300 italic mb-4.5 p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl font-medium">
                            <strong className="text-indigo-400 block text-[9px] uppercase font-extrabold tracking-widest not-italic mb-1.5">Diagnostics Notes:</strong>
                            "{tkt.adminNotes}"
                          </div>
                        )}

                        {tkt.status !== 'Resolved' && (
                          <button
                            onClick={() => { setSelectedTicket(tkt); setAdminNotes(tkt.adminNotes || ''); setTicketStatus(tkt.status); }}
                            className="px-4.5 py-2.5 bg-slate-900 hover:bg-violet-650 text-slate-300 hover:text-white rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all border border-white/10 hover:border-transparent"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-7 md:p-9 rounded-3xl w-full max-w-md border border-white/10 text-left animate-scaleUp">
            
            <h3 className="text-xl font-black text-white mb-1 uppercase tracking-wider text-sm">Update Ticket</h3>
            <p className="text-xs text-slate-400 mb-5 font-bold uppercase tracking-widest text-[9px]">Asset: <span className="text-violet-405">{selectedTicket.product?.name}</span></p>

            <form onSubmit={handleUpdateTicketSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="ticketStat">
                  Update Service Status
                </label>
                <select
                  id="ticketStat"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/15 rounded-xl py-3 px-4.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="Open" className="bg-[#0f172a] text-white">Open (Awaiting Technician)</option>
                  <option value="In Progress" className="bg-[#0f172a] text-white">In Progress (Technician Assigned)</option>
                  <option value="Resolved" className="bg-[#0f172a] text-white">Resolved (Service Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="notes">
                  Technician Diagnostics Notes
                </label>
                <textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record what repair actions were taken or schedule details..."
                  rows={4}
                  className="w-full bg-slate-950/60 border border-white/15 hover:border-white/20 rounded-xl py-3 px-4.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-355 hover:text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-[1.01]"
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
