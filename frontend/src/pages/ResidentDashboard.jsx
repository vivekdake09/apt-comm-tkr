import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/apiClient';
import Sidebar from '../components/Sidebar';
import {
  AlertCircle,
  Users,
  Package,
  CreditCard,
  Calendar,
  Vote,
  Plus,
  QrCode,
  CheckCircle,
  Clock
} from 'lucide-react';

export const ResidentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // States for data
  const [complaints, setComplaints] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [polls, setPolls] = useState([]);

  // States for modals
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeQrPass, setActiveQrPass] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  // Form states
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'PLUMBING' });
  const [visitorForm, setVisitorForm] = useState({ name: '', phone: '', purpose: '', vehicleNumber: '' });
  const [bookingForm, setBookingForm] = useState({ facilityName: 'CLUBHOUSE', bookingDate: '', startTime: '09:00', endTime: '10:00' });
  const [txnId, setTxnId] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'complaints') {
        const cData = await apiClient.get('/api/complaints');
        setComplaints(cData);
      }
      if (activeTab === 'dashboard' || activeTab === 'visitors') {
        const vData = await apiClient.get('/api/visitors');
        setVisitors(vData);
      }
      if (activeTab === 'dashboard' || activeTab === 'parcels') {
        const paData = await apiClient.get('/api/parcels');
        setParcels(paData);
      }
      if (activeTab === 'dashboard' || activeTab === 'payments') {
        const pyData = await apiClient.get('/api/payments');
        setPayments(pyData);
      }
      if (activeTab === 'dashboard' || activeTab === 'bookings') {
        const bData = await apiClient.get('/api/bookings');
        setBookings(bData);
      }
      if (activeTab === 'dashboard' || activeTab === 'polls') {
        const poData = await apiClient.get('/api/polls');
        setPolls(poData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    setError('');
    setSuccess('');
  }, [activeTab]);

  // Submit Complaint
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/complaints', complaintForm);
      setSuccess('Complaint filed successfully.');
      setComplaintForm({ title: '', description: '', category: 'PLUMBING' });
      setShowComplaintModal(false);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Submit Visitor Pre-approval
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiClient.post('/api/visitors/pre-approve', visitorForm);
      setSuccess('Visitor pre-approval registered.');
      setVisitorForm({ name: '', phone: '', purpose: '', vehicleNumber: '' });
      setShowVisitorModal(false);
      
      // Fetch the generated QR code right away
      const qrData = await apiClient.get(`/api/visitors/${response.id}/qr-pass`);
      setActiveQrPass(qrData);
      setShowQrModal(true);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // View QR Pass
  const viewQrPass = async (visitorId) => {
    try {
      const qrData = await apiClient.get(`/api/visitors/${visitorId}/qr-pass`);
      setActiveQrPass(qrData);
      setShowQrModal(true);
    } catch (err) {
      alert('Error fetching QR Pass');
    }
  };

  // Submit Booking Slot
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/bookings', bookingForm);
      setSuccess('Facility booked successfully.');
      setShowBookingModal(false);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Cancel Booking
  const cancelBookingSlot = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking slot?')) return;
    try {
      await apiClient.delete(`/api/bookings/${bookingId}`);
      fetchData();
    } catch (err) {
      alert(err);
    }
  };

  // Trigger Pay Modal
  const initiatePayment = (paymentObj) => {
    setActivePayment(paymentObj);
    setTxnId('TXN_' + Math.floor(Math.random() * 100000000));
    setShowPaymentModal(true);
  };

  // Submit Bill Payment
  const processMockPayment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Mock payment gateway call integration
      await apiClient.post(`/api/payments/${activePayment.id}/pay`, { transactionId: txnId });
      setSuccess('Payment captured successfully.');
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Cast Vote
  const castVote = async (pollId, optionId) => {
    try {
      await apiClient.post(`/api/polls/${pollId}/vote`, { optionId });
      fetchData();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {/* Alerts */}
        {error && (
          <div style={{ background: 'var(--danger-glow)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}>
            {success}
          </div>
        )}

        {/* 1. Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Welcome Back, {user?.fullName}!</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Flat {user?.flatNumber} | Resident Portal</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Unpaid Dues</h3>
                  <div className="value" style={{ color: 'var(--danger)' }}>
                    ${payments.filter(p => p.status === 'UNPAID').reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--danger)' }}><CreditCard size={24} /></div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Waiting Parcels</h3>
                  <div className="value" style={{ color: 'var(--success)' }}>
                    {parcels.filter(p => p.status === 'RECEIVED').length}
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--success)' }}><Package size={24} /></div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Active Complaints</h3>
                  <div className="value" style={{ color: 'var(--warning)' }}>
                    {complaints.filter(c => c.status !== 'RESOLVED').length}
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--warning)' }}><AlertCircle size={24} /></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} /> Visitor Operations
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
                    <Plus size={16} /> Pre-approve Visitor
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('visitors')}>
                    View History
                  </button>
                </div>
              </div>

              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} /> Support Helpdesk
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => setShowComplaintModal(true)}>
                    <Plus size={16} /> File Complaint
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('complaints')}>
                    Track Issues
                  </button>
                </div>
              </div>
            </div>

            {/* In-Line Polls Preview */}
            {polls.length > 0 && (
              <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Vote size={20} /> Active Community Survey
                </h2>
                <div key={polls[0].id}>
                  <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>{polls[0].question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {polls[0].options.map(opt => {
                      const totalVotes = polls[0].options.reduce((acc, o) => acc + o.voteCount, 0);
                      const pct = totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(0) : 0;
                      return (
                        <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <button
                            disabled={polls[0].hasVoted}
                            onClick={() => castVote(polls[0].id, opt.id)}
                            className="btn btn-secondary"
                            style={{
                              justifyContent: 'space-between',
                              width: '100%',
                              background: polls[0].votedOptionId === opt.id ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.03)',
                              border: polls[0].votedOptionId === opt.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                              textAlign: 'left'
                            }}
                          >
                            <span>{opt.optionText}</span>
                            {polls[0].hasVoted && <span style={{ fontWeight: 'bold' }}>{pct}% ({opt.voteCount})</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Complaints View */}
        {activeTab === 'complaints' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Support Complaints</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track and raise maintenance support requests</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowComplaintModal(true)}>
                <Plus size={16} /> Raise Complaint
              </button>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No complaints logged.</td>
                    </tr>
                  ) : (
                    complaints.map(comp => (
                      <tr key={comp.id}>
                        <td>#{comp.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{comp.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{comp.description}</div>
                        </td>
                        <td><span className="badge badge-info">{comp.category}</span></td>
                        <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${
                            comp.status === 'RESOLVED' ? 'badge-success' : comp.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-pending'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Visitors View */}
        {activeTab === 'visitors' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Pre-Approved Visitor Passes</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Invite friends and deliveries to bypass manual security registration</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
                <Plus size={16} /> Pre-approve Visitor
              </button>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Visitor Name</th>
                    <th>Phone</th>
                    <th>Purpose</th>
                    <th>Vehicle</th>
                    <th>Pass Token</th>
                    <th>Status</th>
                    <th>Check In/Out</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No visitor records found.</td>
                    </tr>
                  ) : (
                    visitors.map(vis => (
                      <tr key={vis.id}>
                        <td style={{ fontWeight: 600 }}>{vis.name}</td>
                        <td>{vis.phone}</td>
                        <td>{vis.purpose || '-'}</td>
                        <td>{vis.vehicleNumber || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{vis.qrCodeToken}</td>
                        <td>
                          <span className={`badge ${
                            vis.status === 'CHECKED_IN' ? 'badge-success' : vis.status === 'CHECKED_OUT' ? 'badge-danger' : 'badge-pending'
                          }`}>
                            {vis.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {vis.checkInTime && <div>In: {new Date(vis.checkInTime).toLocaleString()}</div>}
                          {vis.checkOutTime && <div>Out: {new Date(vis.checkOutTime).toLocaleString()}</div>}
                          {!vis.checkInTime && '-'}
                        </td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => viewQrPass(vis.id)}>
                            <QrCode size={14} /> Get QR
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Parcels View */}
        {activeTab === 'parcels' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Package Tracking Desk</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track parcels accepted on your behalf by security gates</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Parcel ID</th>
                    <th>Carrier</th>
                    <th>Tracking Number</th>
                    <th>Received At</th>
                    <th>Collected At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No packages registered.</td>
                    </tr>
                  ) : (
                    parcels.map(p => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td style={{ fontWeight: 600 }}>{p.carrier}</td>
                        <td>{p.trackingNumber || '-'}</td>
                        <td>{new Date(p.receivedAt).toLocaleString()}</td>
                        <td>{p.collectedAt ? new Date(p.collectedAt).toLocaleString() : '-'}</td>
                        <td>
                          <span className={`badge ${p.status === 'COLLECTED' ? 'badge-success' : 'badge-pending'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Payments View */}
        {activeTab === 'payments' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Outstanding Invoices & Bills</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Pay rent and monthly maintenance levies securely</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Bill Category</th>
                    <th>Amount Due</th>
                    <th>Due Date</th>
                    <th>Paid Date</th>
                    <th>Transaction Reference</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No invoice records available.</td>
                    </tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay.id}>
                        <td>#{pay.id}</td>
                        <td style={{ fontWeight: 600 }}>{pay.type}</td>
                        <td style={{ color: pay.status === 'UNPAID' ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                          ${pay.amount.toFixed(2)}
                        </td>
                        <td>{new Date(pay.dueDate).toLocaleDateString()}</td>
                        <td>{pay.paymentDate ? new Date(pay.paymentDate).toLocaleString() : '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{pay.transactionId || '-'}</td>
                        <td>
                          <span className={`badge ${
                            pay.status === 'PAID' ? 'badge-success' : pay.status === 'FAILED' ? 'badge-danger' : 'badge-pending'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td>
                          {pay.status === 'UNPAID' && (
                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => initiatePayment(pay)}>
                              Pay Now
                            </button>
                          )}
                          {pay.status !== 'UNPAID' && '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Amenity Bookings View */}
        {activeTab === 'bookings' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Facility Amenity Bookings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Book Clubhouses, Gyms, or Tennis Courts without paperwork</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>
                <Plus size={16} /> Reserve Amenity
              </button>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Facility Space</th>
                    <th>Reservation Date</th>
                    <th>Timings</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No active bookings found.</td>
                    </tr>
                  ) : (
                    bookings.map(bk => (
                      <tr key={bk.id}>
                        <td>#{bk.id}</td>
                        <td style={{ fontWeight: 600 }}>{bk.facilityName}</td>
                        <td>{new Date(bk.bookingDate).toLocaleDateString()}</td>
                        <td>{bk.startTime.substring(0,5)} - {bk.endTime.substring(0,5)}</td>
                        <td>
                          <span className={`badge ${bk.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                            {bk.status}
                          </span>
                        </td>
                        <td>
                          {bk.status === 'CONFIRMED' && (
                            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => cancelBookingSlot(bk.id)}>
                              Cancel Slot
                            </button>
                          )}
                          {bk.status !== 'CONFIRMED' && '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Polls View */}
        {activeTab === 'polls' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Active Polls & Surveys</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Participate in community decisions and vote on open issues</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {polls.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No active polls currently available.
                </div>
              ) : (
                polls.map(poll => (
                  <div key={poll.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Posted by {poll.createdBy}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>Expires: {new Date(poll.expiresAt).toLocaleString()}</span>
                    </div>
                    
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>{poll.question}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {poll.options.map(opt => {
                        const totalVotes = poll.options.reduce((acc, o) => acc + o.voteCount, 0);
                        const pct = totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(0) : 0;
                        const isVotedOption = poll.votedOptionId === opt.id;
                        
                        return (
                          <div key={opt.id} style={{ position: 'relative' }}>
                            <button
                              disabled={poll.hasVoted}
                              onClick={() => castVote(poll.id, opt.id)}
                              className="btn btn-secondary"
                              style={{
                                width: '100%',
                                justifyContent: 'space-between',
                                background: isVotedOption ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.03)',
                                border: isVotedOption ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                                zIndex: 2,
                                position: 'relative',
                                cursor: poll.hasVoted ? 'default' : 'pointer'
                              }}
                            >
                              <span>{opt.optionText}</span>
                              {poll.hasVoted && <span style={{ fontWeight: 'bold' }}>{pct}% ({opt.voteCount})</span>}
                            </button>
                            {poll.hasVoted && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: `${pct}%`,
                                background: 'rgba(79, 70, 229, 0.08)',
                                borderRadius: '10px',
                                zIndex: 1
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================= MODALS ========================================= */}

      {/* Raise Complaint Modal */}
      {showComplaintModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleComplaintSubmit}>
              <div className="modal-header">
                <h2>Raise Support Complaint</h2>
                <button type="button" onClick={() => setShowComplaintModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" required className="input-control" placeholder="Short summary of issue" value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="input-control" value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}>
                    <option value="PLUMBING">PLUMBING</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="CLEANLINESS">CLEANLINESS</option>
                    <option value="PARKING">PARKING</option>
                    <option value="OTHERS">OTHERS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description Details</label>
                  <textarea rows="4" required className="input-control" placeholder="Explain the problem in detail (e.g. location, severity)" value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} style={{ resize: 'none' }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowComplaintModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">File Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-approve Visitor Modal */}
      {showVisitorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleVisitorSubmit}>
              <div className="modal-header">
                <h2>Pre-Approve Visitor</h2>
                <button type="button" onClick={() => setShowVisitorModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Visitor Name</label>
                  <input type="text" required className="input-control" placeholder="Visitor full name" value={visitorForm.name} onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" required className="input-control" placeholder="+15550291" value={visitorForm.phone} onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Purpose of Visit</label>
                  <input type="text" className="input-control" placeholder="e.g. Delivery, Dinner Guest" value={visitorForm.purpose} onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Vehicle Number (Optional)</label>
                  <input type="text" className="input-control" placeholder="e.g. NY-982-KK" value={visitorForm.vehicleNumber} onChange={(e) => setVisitorForm({ ...visitorForm, vehicleNumber: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVisitorModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Pre-Approve</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR pass display modal */}
      {showQrModal && activeQrPass && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <h2>Gate Entry QR Pass</h2>
              <button type="button" onClick={() => { setShowQrModal(false); setActiveQrPass(null); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Share this pass code with your guest. Security will scan this upon arrival.
              </p>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1.5rem' }}>
                <img src={activeQrPass.qrCodeBase64} alt="Visitor QR Pass" style={{ width: '200px', height: '200px' }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {activeQrPass.qrCodeToken}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setShowQrModal(false); setActiveQrPass(null); }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amenity Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleBookingSubmit}>
              <div className="modal-header">
                <h2>Book Amenity Space</h2>
                <button type="button" onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Facility</label>
                  <select className="input-control" value={bookingForm.facilityName} onChange={(e) => setBookingForm({ ...bookingForm, facilityName: e.target.value })}>
                    <option value="CLUBHOUSE">CLUBHOUSE</option>
                    <option value="GYM">GYM</option>
                    <option value="TENNIS_COURT">TENNIS COURT</option>
                    <option value="PARTY_HALL">PARTY HALL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" required className="input-control" value={bookingForm.bookingDate} onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Start Time</label>
                    <input type="time" required className="input-control" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>End Time</label>
                    <input type="time" required className="input-control" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Book Amenity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentModal && activePayment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <form onSubmit={processMockPayment}>
              <div className="modal-header">
                <h2>Secure Pay Gateway (Mock)</h2>
                <button type="button" onClick={() => { setShowPaymentModal(false); setActivePayment(null); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body">
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Billing Item:</span>
                    <span style={{ fontWeight: 600 }}>{activePayment.type} Invoice #{activePayment.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>${activePayment.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Card Issuer / Channel</label>
                  <select className="input-control" defaultValue="visa">
                    <option value="visa">Credit/Debit Card (Visa/Mastercard)</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="upi">UPI / Instant Pay</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mock Transaction Ref ID</label>
                  <input type="text" required className="input-control" value={txnId} onChange={(e) => setTxnId(e.target.value)} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Type <code style={{ color: 'var(--danger)' }}>FAIL_TXN</code> to simulate a bank-declined processing failure.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowPaymentModal(false); setActivePayment(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
