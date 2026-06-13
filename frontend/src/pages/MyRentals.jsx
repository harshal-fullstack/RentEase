import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Wrench, RefreshCw, Undo2, AlertCircle, CheckCircle, HelpCircle, FileText, ChevronDown } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Title */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">My Rentals Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Track active leases, scheduled deliveries, and manage maintenance tickets</p>
        </div>
        
        {/* Tab Selectors */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'rentals' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Active Rentals ({rentals.filter(r => r.status !== 'Returned').length})
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'deliveries' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Deliveries ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'tickets' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Service Tickets ({tickets.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Synchronizing database assets...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: ACTIVE RENTALS */}
          {activeTab === 'rentals' && (
            rentals.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No Active Rentals</h3>
                <p className="text-gray-400 text-sm mb-6">You do not have any active leased assets in this account.</p>
                <Link to="/catalog" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors">
                  Go to Catalog
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {rentals.map((rental) => (
                  <div
                    key={rental._id}
                    className={`glass p-6 rounded-3xl border-white/5 flex flex-col justify-between relative overflow-hidden ${
                      rental.status === 'Returned' ? 'opacity-50' : ''
                    }`}
                  >
                    
                    {/* Badge */}
                    <span className={`absolute top-4 right-4 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      rental.status === 'Active' ? 'bg-emerald-950 border border-emerald-500/20 text-emerald-400' :
                      rental.status === 'Extended' ? 'bg-brand-950 border border-brand-500/20 text-brand-300' :
                      rental.status === 'ReturnRequested' ? 'bg-amber-950 border border-amber-500/20 text-amber-400' :
                      'bg-slate-800 border border-slate-700/20 text-gray-400'
                    }`}>
                      {rental.status === 'ReturnRequested' ? 'Return Pending' : rental.status}
                    </span>

                    {/* Product Summary */}
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={rental.product?.imageUrl}
                          alt={rental.product?.name}
                          className="h-16 w-16 object-cover rounded-xl bg-slate-900 border border-white/5"
                        />
                        <div>
                          <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider">{rental.product?.subCategory}</span>
                          <h3 className="text-lg font-bold text-white leading-tight">{rental.product?.name}</h3>
                          <span className="text-xs text-gray-500 font-medium mt-0.5 block">Quantity: {rental.quantity}</span>
                        </div>
                      </div>

                      {/* Dates details */}
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900/80 mb-6 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lease Started</span>
                          <span className="text-white font-medium">{new Date(rental.startDate).toDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lease Ends</span>
                          <span className="text-white font-semibold">{new Date(rental.endDate).toDateString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-900/80 pt-2 text-gray-400">
                          <span>Monthly Cost</span>
                          <span className="text-white font-bold">₹{rental.pricePerMonth} × {rental.quantity} = ₹{rental.pricePerMonth * rental.quantity}/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (only if not returned) */}
                    {rental.status !== 'Returned' && (
                      <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/5">
                        <button
                          onClick={() => openModal(rental, 'extend')}
                          className="py-2.5 px-2 bg-slate-850 hover:bg-brand-600 hover:text-white rounded-xl text-center text-xs font-semibold text-brand-300 transition-colors flex flex-col items-center justify-center gap-1 border border-brand-500/10"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Extend Lease</span>
                        </button>
                        
                        <button
                          onClick={() => openModal(rental, 'return')}
                          className="py-2.5 px-2 bg-slate-855 hover:bg-amber-600 hover:text-white rounded-xl text-center text-xs font-semibold text-amber-300 transition-colors flex flex-col items-center justify-center gap-1 border border-amber-500/10"
                          disabled={rental.status === 'ReturnRequested'}
                        >
                          <Undo2 className="h-4 w-4" />
                          <span>{rental.status === 'ReturnRequested' ? 'Pending pickup' : 'Return Asset'}</span>
                        </button>

                        <button
                          onClick={() => openModal(rental, 'maintenance')}
                          className="py-2.5 px-2 bg-slate-860 hover:bg-pink-600 hover:text-white rounded-xl text-center text-xs font-semibold text-pink-300 transition-colors flex flex-col items-center justify-center gap-1 border border-pink-500/10"
                        >
                          <Wrench className="h-4 w-4" />
                          <span>Request Repair</span>
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
              <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
                <Truck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No Deliveries Scheduled</h3>
                <p className="text-gray-400 text-sm">All placed orders have been successfully delivered and initialized as active rentals.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                    
                    <div>
                      <div className="flex items-center space-x-2.5 mb-3">
                        <span className="bg-indigo-950 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          Scheduled Delivery
                        </span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-gray-400 text-xs">Order ID: #{order._id.substring(18)}</span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-xs mb-4">
                        <div className="flex items-center space-x-1.5 text-gray-400">
                          <Calendar className="h-4 w-4 text-indigo-400" />
                          <span>Date: <strong className="text-white">{new Date(order.deliveryDate).toDateString()}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-400">
                          <Clock className="h-4 w-4 text-indigo-400" />
                          <span>Slot: <strong className="text-white">{order.deliverySlot}</strong></span>
                        </div>
                      </div>

                      {/* Display items in delivery */}
                      <div className="space-y-2 mt-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <span className="h-1.5 w-1.5 bg-brand-500 rounded-full" />
                            <span className="text-gray-300 font-semibold">{item.product?.name || 'Asset'}</span>
                            <span className="text-gray-500">({item.tenure} mo plan • Qty {item.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simulation delivery control */}
                    <div className="pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-6 text-center shrink-0 flex flex-col items-center">
                      <span className="text-[10px] text-brand-300 font-semibold mb-2 max-w-[150px] leading-tight block">
                        Simulation Mode: Confirm delivery receipt below to activate lease
                      </span>
                      
                      <button
                        onClick={() => handleSimulateDelivery(order._id)}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                      >
                        Simulate Delivery Receipt
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
              <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
                <Wrench className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No Maintenance Tickets</h3>
                <p className="text-gray-400 text-sm">You have not registered any support or service tickets in this account.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tickets.map((tkt) => (
                  <div key={tkt._id} className="glass p-6 rounded-3xl border-white/5 relative">
                    
                    {/* Status Badge */}
                    <span className={`absolute top-4 right-4 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                      tkt.status === 'Open' ? 'bg-pink-950 border border-pink-500/20 text-pink-400' :
                      tkt.status === 'In Progress' ? 'bg-blue-950 border border-blue-500/20 text-blue-400' :
                      tkt.status === 'Resolved' ? 'bg-emerald-950 border border-emerald-500/20 text-emerald-400' :
                      'bg-slate-800 border border-slate-700/20 text-gray-400'
                    }`}>
                      {tkt.status}
                    </span>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-[10px] text-gray-500 mb-1">
                        <span className="font-bold uppercase tracking-wider text-pink-400">{tkt.issueType}</span>
                        <span>•</span>
                        <span>Ticket ID: #{tkt._id.substring(18)}</span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-tight">Service for: {tkt.product?.name}</h3>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900 mb-4 text-xs space-y-2 text-left">
                      <div className="text-gray-400">
                        <span className="font-bold text-white block mb-0.5">Reported Issue:</span>
                        {tkt.description}
                      </div>
                      <div className="flex justify-between border-t border-slate-900 pt-2 mt-2 text-gray-500">
                        <span>Preferred Visit Date:</span>
                        <span className="text-white font-medium">{new Date(tkt.preferredDate).toDateString()} ({tkt.preferredSlot})</span>
                      </div>
                    </div>

                    {/* Admin response notes */}
                    {tkt.adminNotes && (
                      <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-2xl text-xs text-left">
                        <span className="font-bold text-indigo-300 block mb-0.5">Technician Response:</span>
                        <p className="text-gray-300 italic">"{tkt.adminNotes}"</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
          
          <div className="glass-premium p-6 md:p-8 rounded-3xl w-full max-w-md border border-brand-500/20 relative animate-scaleUp">
            
            {/* Modal Header */}
            <div className="mb-6 text-left">
              <h3 className="text-xl font-bold text-white">
                {modalType === 'extend' && 'Extend Lease'}
                {modalType === 'return' && 'Schedule Return Pickup'}
                {modalType === 'maintenance' && 'File Service Ticket'}
              </h3>
              <p className="text-gray-400 text-xs mt-1">Item: {selectedRental.product?.name}</p>
            </div>

            {/* EXTEND LEASE FORM */}
            {modalType === 'extend' && (
              <form onSubmit={handleExtendLeaseSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="extMonths">
                    Select Additional Lease Duration
                  </label>
                  <select
                    id="extMonths"
                    value={extendMonths}
                    onChange={(e) => setExtendMonths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="1">1 Month (Standard)</option>
                    <option value="3">3 Months (Discounted)</option>
                    <option value="6">6 Months (Save 15%)</option>
                    <option value="12">12 Months (Best Value)</option>
                  </select>
                </div>
                
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Current End Date</span>
                    <span className="text-white font-medium">{new Date(selectedRental.endDate).toDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Extended Date</span>
                    <span className="text-brand-400 font-bold">
                      {(() => {
                        const d = new Date(selectedRental.endDate);
                        d.setMonth(d.getMonth() + Number(extendMonths));
                        return d.toDateString();
                      })()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-gray-300 font-bold rounded-xl text-xs transition-colors border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-500/10"
                  >
                    Confirm Extension
                  </button>
                </div>
              </form>
            )}

            {/* SCHEDULE RETURN FORM */}
            {modalType === 'return' && (
              <form onSubmit={handleReturnSubmit} className="space-y-4 text-left">
                <p className="text-gray-400 text-xs leading-relaxed">
                  Confirm return pickup details. Our logistics team will inspect the item during pickup. Refundable deposits will be processed upon approval.
                </p>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="retDate">
                    Pickup Date
                  </label>
                  <input
                    id="retDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="retSlot">
                    Preferred Time Slot
                  </label>
                  <select
                    id="retSlot"
                    value={returnSlot}
                    onChange={(e) => setReturnSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="09:00 AM - 01:00 PM">Morning (09:00 AM - 01:00 PM)</option>
                    <option value="02:00 PM - 06:00 PM">Afternoon (02:00 PM - 06:00 PM)</option>
                    <option value="06:00 PM - 10:00 PM">Evening (06:00 PM - 10:00 PM)</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-gray-300 font-bold rounded-xl text-xs transition-colors border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                  >
                    Schedule Pickup
                  </button>
                </div>
              </form>
            )}

            {/* REQUEST REPAIR FORM */}
            {modalType === 'maintenance' && (
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="issType">
                    Issue Type
                  </label>
                  <select
                    id="issType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-pink-500 focus:outline-none"
                  >
                    <option value="Malfunction">Malfunction (Not working correctly)</option>
                    <option value="Damage">Physical Damage (Scratches/breaks)</option>
                    <option value="Replacement">Replacement Request (Upgrade/Swap)</option>
                    <option value="General Service">General Service (Cleaning/Maintenance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5" htmlFor="issDesc">
                    Describe the Problem
                  </label>
                  <textarea
                    id="issDesc"
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                    placeholder="Provide details about the issue so our engineer can bring the right parts..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 text-sm focus:border-pink-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-[10px] font-semibold uppercase mb-1.5" htmlFor="pDate">
                      Preferred Date
                    </label>
                    <input
                      id="pDate"
                      type="date"
                      value={prefDate}
                      onChange={(e) => setPrefDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-semibold uppercase mb-1.5" htmlFor="pSlot">
                      Preferred Slot
                    </label>
                    <select
                      id="pSlot"
                      value={prefSlot}
                      onChange={(e) => setPrefSlot(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs focus:border-pink-500 focus:outline-none"
                    >
                      <option value="09:00 AM - 01:00 PM">Morning</option>
                      <option value="02:00 PM - 06:00 PM">Afternoon</option>
                      <option value="06:00 PM - 10:00 PM">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-gray-300 font-bold rounded-xl text-xs transition-colors border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
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
