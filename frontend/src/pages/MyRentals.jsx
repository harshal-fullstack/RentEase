import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Wrench, RefreshCw, Undo2, AlertCircle, ShieldCheck } from 'lucide-react';

const MyRentals = () => {
  const { token } = useAuth();
  
  const [rentals, setRentals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('rentals'); // rentals | deliveries | tickets

  // Modal / Form toggle states
  const [selectedRental, setSelectedRental] = useState(null);
  const [modalType, setModalType] = useState(null); // extend | return | maintenance

  // Form input states
  const [extendMonths, setExtendMonths] = useState(3);
  const [returnDate, setReturnDate] = useState('');
  const [returnSlot, setReturnSlot] = useState('09:00 AM - 01:00 PM');
  const [issueType, setIssueType] = useState('Malfunction');
  const [issueDesc, setIssueDesc] = useState('');
  const [prefDate, setPrefDate] = useState('');
  const [prefSlot, setPrefSlot] = useState('09:00 AM - 01:00 PM');

  // Trigger loading details
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch active rentals
        const rentRes = await fetch('http://localhost:5000/api/rentals', { headers });
        const rentData = await rentRes.json();
        
        // 2. Fetch scheduled orders
        const ordRes = await fetch('http://localhost:5000/api/orders', { headers });
        const ordData = await ordRes.json();

        // 3. Fetch maintenance tickets
        const tktRes = await fetch('http://localhost:5000/api/rentals/maintenance/user', { headers });
        const tktData = await tktRes.json();

        if (rentData.success) setRentals(rentData.rentals);
        if (ordData.success) {
          // Filter out orders that are "Delivered" or "Cancelled" for the deliveries section
          const scheduled = ordData.orders.filter(o => o.status === 'Scheduled' || o.status === 'Pending');
          setOrders(scheduled);
        }
        if (tktData.success) setTickets(tktData.tickets);

      } catch (err) {
        console.error('Error fetching rentals details:', err);
        setErrorMsg('Failed to connect to backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  // Handle Delivery Simulation (Converts Order -> Active Rentals)
  const handleSimulateDelivery = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
        setActiveTab('rentals');
      } else {
        alert(data.message || 'Delivery simulation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  // Handle Lease Extension
  const handleExtendLeaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/${selectedRental._id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ extendedTenure: extendMonths })
      });
      const data = await res.json();
      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
        closeModal();
      } else {
        alert(data.message || 'Extension failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Return Scheduling
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnDate) {
      alert('Please select a pickup date');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/${selectedRental._id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pickupDate: returnDate, pickupSlot: returnSlot })
      });
      const data = await res.json();
      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
        closeModal();
      } else {
        alert(data.message || 'Scheduling return failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Maintenance Ticket creation
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!issueDesc || !prefDate) {
      alert('Please complete all form fields');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/${selectedRental._id}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          issueType,
          description: issueDesc,
          preferredDate: prefDate,
          preferredSlot: prefSlot
        })
      });
      const data = await res.json();
      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
        closeModal();
        setActiveTab('tickets');
      } else {
        alert(data.message || 'Failed to submit service ticket');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (rental, type) => {
    setSelectedRental(rental);
    setModalType(type);
    
    // Reset inputs
    setExtendMonths(3);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];
    
    setReturnDate(dateStr);
    setPrefDate(dateStr);
    setIssueDesc('');
  };

  const closeModal = () => {
    setSelectedRental(null);
    setModalType(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative animate-slide-up">
      
      {/* Background glow decoration */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Title */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">My Rentals</h1>
          <p className="text-slate-400 text-sm mt-2 font-semibold">Track active leases, scheduled deliveries, and manage maintenance tickets.</p>
        </div>
        
        {/* Tab Selectors */}
        <div className="flex bg-slate-950/40 p-1.5 rounded-2xl border border-white/5 mx-auto md:mx-0 shadow-sm">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'rentals' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Rentals ({rentals.filter(r => r.status !== 'Returned').length})
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'deliveries' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deliveries ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'tickets' 
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Tickets ({tickets.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-955/20 border border-red-900/30 text-red-400 p-4.5 rounded-2xl text-xs mb-6 flex items-center shadow-sm">
          <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 text-red-400" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-bold tracking-wider uppercase">Loading Dashboard Data...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: ACTIVE RENTALS */}
          {activeTab === 'rentals' && (
            rentals.length === 0 ? (
              <div className="text-center py-24 glass rounded-3xl border border-white/10">
                <Calendar className="h-14 w-14 text-slate-555 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Rentals</h3>
                <p className="text-slate-400 text-xs mb-8 max-w-xs mx-auto font-semibold">You do not have any active leased assets in this account.</p>
                <Link to="/" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-block">
                  Go to Catalog
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {rentals.map((rental) => (
                  <div
                    key={rental._id}
                    className={`bg-[#131b2e]/60 border border-white/10 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-brand-500/20 hover:shadow-md ${
                      rental.status === 'Returned' ? 'opacity-50' : ''
                    }`}
                  >
                    
                    {/* Badge */}
                    <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      rental.status === 'Active' ? 'bg-emerald-955/80 border border-emerald-900/30 text-emerald-400' :
                      rental.status === 'Extended' ? 'bg-brand-500/10 border border-brand-500/20 text-brand-350' :
                      rental.status === 'ReturnRequested' ? 'bg-amber-955/80 border border-amber-900/30 text-amber-400' :
                      'bg-slate-900 border border-white/10 text-slate-400'
                    }`}>
                      {rental.status === 'ReturnRequested' ? 'Return Pending' : rental.status}
                    </span>

                    {/* Product Summary */}
                    <div>
                      <div className="flex items-center space-x-4 mb-5.5">
                        <img
                          src={rental.product?.imageUrl}
                          alt={rental.product?.name}
                          className="h-16 w-16 object-cover rounded-2xl bg-slate-900 border border-white/10 shrink-0"
                        />
                        <div>
                          <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest">{rental.product?.subCategory}</span>
                          <h3 className="text-base font-extrabold text-white leading-tight mt-0.5">{rental.product?.name}</h3>
                          <span className="text-xs text-slate-400 font-semibold mt-1 block">Quantity: {rental.quantity}</span>
                        </div>
                      </div>

                      {/* Dates details */}
                      <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-white/5 mb-6 space-y-2.5 text-xs font-semibold">
                        <div className="flex justify-between text-slate-400">
                          <span className="text-slate-400">Lease Started</span>
                          <span className="text-slate-200">{new Date(rental.startDate).toDateString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span className="text-slate-400">Lease Ends</span>
                          <span className="text-slate-200">{new Date(rental.endDate).toDateString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2.5 text-slate-400">
                          <span className="text-slate-400">Monthly Cost</span>
                          <span className="text-white font-extrabold">₹{rental.pricePerMonth * rental.quantity} / mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (only if not returned) */}
                    {rental.status !== 'Returned' && (
                      <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/5">
                        <button
                          onClick={() => openModal(rental, 'extend')}
                          className="py-3 px-2 bg-slate-900 hover:bg-brand-600 hover:text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-all flex flex-col items-center justify-center gap-1.5 border border-white/5 hover:border-transparent"
                        >
                          <RefreshCw className="h-4 w-4 shrink-0" />
                          <span>Extend</span>
                        </button>
                        
                        <button
                          onClick={() => openModal(rental, 'return')}
                          className="py-3 px-2 bg-slate-900 hover:bg-amber-600 hover:text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-all flex flex-col items-center justify-center gap-1.5 border border-white/5 hover:border-transparent"
                          disabled={rental.status === 'ReturnRequested'}
                        >
                          <Undo2 className="h-4 w-4 shrink-0" />
                          <span>{rental.status === 'ReturnRequested' ? 'Pending' : 'Return'}</span>
                        </button>

                        <button
                          onClick={() => openModal(rental, 'maintenance')}
                          className="py-3 px-2 bg-slate-900 hover:bg-pink-600 hover:text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-all flex flex-col items-center justify-center gap-1.5 border border-white/5 hover:border-transparent"
                        >
                          <Wrench className="h-4 w-4 shrink-0" />
                          <span>Repair</span>
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: SCHEDULED DELIVERIES */}
          {activeTab === 'deliveries' && (
            orders.length === 0 ? (
              <div className="text-center py-24 glass rounded-3xl border border-white/10">
                <ShieldCheck className="h-14 w-14 text-slate-555 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">No Deliveries Scheduled</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed font-semibold">All placed orders have been successfully delivered and initialized as active rentals.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-[#131b2e]/60 border border-white/10 p-6.5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative transition-all hover:border-brand-500/20 hover:shadow-md">
                    
                    <div>
                      <div className="flex items-center space-x-2.5 mb-4">
                        <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-350 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                          Scheduled Delivery
                        </span>
                        <span className="text-slate-700 text-xs">•</span>
                        <span className="text-slate-400 text-xs font-bold">Order ID: #{order._id.substring(18)}</span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs mb-4.5 font-semibold text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-indigo-400" />
                          <span>Date: <strong className="text-white">{new Date(order.deliveryDate).toDateString()}</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-indigo-400" />
                          <span>Slot: <strong className="text-white">{order.deliverySlot}</strong></span>
                        </div>
                      </div>

                      {/* Display items in delivery */}
                      <div className="space-y-2 mt-4 border-t border-white/5 pt-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2.5 text-xs">
                            <span className="h-1.5 w-1.5 bg-brand-500 rounded-full" />
                            <span className="text-white font-extrabold">{item.product?.name || 'Asset'}</span>
                            <span className="text-slate-400 font-semibold">({item.tenure} mo plan • Qty {item.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simulation delivery control */}
                    <div className="pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-8 shrink-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider text-center mb-3 max-w-[180px] leading-relaxed">
                        Simulation Mode:<br />Confirm receipt below
                      </span>
                      
                      <button
                        onClick={() => handleSimulateDelivery(order._id)}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25"
                      >
                        Simulate Delivery
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: SERVICE TICKETS */}
          {activeTab === 'tickets' && (
            tickets.length === 0 ? (
              <div className="text-center py-24 glass rounded-3xl border border-white/10">
                <Wrench className="h-14 w-14 text-slate-555 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">No Service Tickets</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto font-semibold">You have not registered any support or service tickets in this account.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tickets.map((tkt) => (
                  <div key={tkt._id} className="bg-[#131b2e]/60 border border-white/10 p-6.5 rounded-3xl relative transition-all hover:border-brand-500/20 hover:shadow-md">
                    
                    {/* Status Badge */}
                    <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      tkt.status === 'Open' ? 'bg-pink-955/80 border border-pink-905 text-pink-400' :
                      tkt.status === 'In Progress' ? 'bg-blue-955/80 border border-blue-900/30 text-blue-400' :
                      tkt.status === 'Resolved' ? 'bg-emerald-955/80 border border-emerald-900/30 text-emerald-400' :
                      'bg-slate-900 border border-white/10 text-slate-400'
                    }`}>
                      {tkt.status}
                    </span>

                    <div className="mb-4.5">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1.5 font-semibold">
                        <span className="font-extrabold uppercase tracking-widest text-pink-400">{tkt.issueType}</span>
                        <span>•</span>
                        <span>Ticket ID: #{tkt._id.substring(18)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">Service for: {tkt.product?.name}</h3>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 mb-4 text-xs font-semibold space-y-2.5">
                      <div className="text-slate-300 leading-relaxed">
                        <strong className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Reported Issue:</strong>
                        "{tkt.description}"
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2.5 text-slate-400">
                        <span>Preferred Visit Date:</span>
                        <span className="text-white font-bold">{new Date(tkt.preferredDate).toDateString()} ({tkt.preferredSlot})</span>
                      </div>
                    </div>

                    {/* Admin response notes */}
                    {tkt.adminNotes && (
                      <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-2xl text-xs">
                        <span className="font-bold text-indigo-400 block text-[9px] uppercase tracking-wider mb-1">Technician Diagnostics:</span>
                        <p className="text-slate-300 italic font-semibold">"{tkt.adminNotes}"</p>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )
          )}

        </div>
      )}

      {/* MODAL WRAPPER */}
      {selectedRental && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          
          <div className="glass-premium p-6 md:p-8 rounded-3xl w-full max-w-md border border-white/10 relative shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-xl font-black text-white tracking-tight">
                {modalType === 'extend' && 'Extend Lease'}
                {modalType === 'return' && 'Schedule Return Pickup'}
                {modalType === 'maintenance' && 'File Service Ticket'}
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1">Item: {selectedRental.product?.name}</p>
            </div>

            {/* EXTEND LEASE FORM */}
            {modalType === 'extend' && (
              <form onSubmit={handleExtendLeaseSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5" htmlFor="extMonths">
                    Select Additional Lease Duration
                  </label>
                  <select
                    id="extMonths"
                    value={extendMonths}
                    onChange={(e) => setExtendMonths(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="1">1 Month (Standard)</option>
                    <option value="3">3 Months (Discounted)</option>
                    <option value="6">6 Months (Save 15%)</option>
                    <option value="12">12 Months (Best Value)</option>
                  </select>
                </div>
                
                <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 text-xs font-semibold text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Current End Date</span>
                    <span className="text-slate-200">{new Date(selectedRental.endDate).toDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Extended Date</span>
                    <span className="text-brand-350 font-extrabold">
                      {(() => {
                        const d = new Date(selectedRental.endDate);
                        d.setMonth(d.getMonth() + Number(extendMonths));
                        return d.toDateString();
                      })()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3.5 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand-500/10"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            )}

            {/* SCHEDULE RETURN FORM */}
            {modalType === 'return' && (
              <form onSubmit={handleReturnSubmit} className="space-y-5 text-left">
                <p className="text-slate-400 text-xs leading-relaxed font-bold">
                  Confirm return pickup details. Our logistics team will inspect the item during pickup. Refundable deposits will be processed upon approval.
                </p>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5" htmlFor="retDate">
                    Pickup Date
                  </label>
                  <input
                    id="retDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full glass-input rounded-xl py-3 px-4 text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5" htmlFor="retSlot">
                    Preferred Time Slot
                  </label>
                  <select
                    id="retSlot"
                    value={returnSlot}
                    onChange={(e) => setReturnSlot(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="09:00 AM - 01:00 PM">Morning (09:00 AM - 01:00 PM)</option>
                    <option value="02:00 PM - 06:00 PM">Afternoon (02:00 PM - 06:00 PM)</option>
                    <option value="06:00 PM - 10:00 PM">Evening (06:00 PM - 10:00 PM)</option>
                  </select>
                </div>

                <div className="flex space-x-3.5 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                  >
                    Schedule Pickup
                  </button>
                </div>
              </form>
            )}

            {/* REQUEST REPAIR FORM */}
            {modalType === 'maintenance' && (
              <form onSubmit={handleMaintenanceSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5" htmlFor="issType">
                    Issue Type
                  </label>
                  <select
                    id="issType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                  >
                    <option value="Malfunction">Malfunction (Not working correctly)</option>
                    <option value="Damage">Physical Damage (Scratches/breaks)</option>
                    <option value="Replacement">Replacement Request (Upgrade/Swap)</option>
                    <option value="General Service">General Service (Cleaning/Maintenance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5" htmlFor="issDesc">
                    Describe the Problem
                  </label>
                  <textarea
                    id="issDesc"
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                    placeholder="Provide details about the issue so our engineer can bring the right parts..."
                    rows={3}
                    className="w-full bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-2" htmlFor="pDate">
                      Preferred Date
                    </label>
                    <input
                      id="pDate"
                      type="date"
                      value={prefDate}
                      onChange={(e) => setPrefDate(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-2" htmlFor="pSlot">
                      Preferred Slot
                    </label>
                    <select
                      id="pSlot"
                      value={prefSlot}
                      onChange={(e) => setPrefSlot(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-pink-500 transition-colors"
                    >
                      <option value="09:00 AM - 01:00 PM">Morning</option>
                      <option value="02:00 PM - 06:00 PM">Afternoon</option>
                      <option value="06:00 PM - 10:00 PM">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3.5 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default MyRentals;
