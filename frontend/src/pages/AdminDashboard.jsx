import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import Sidebar from '../components/Sidebar';
import {
  AlertCircle,
  CreditCard,
  Calendar,
  Vote,
  UserCheck,
  Plus,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Users
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [complaints, setComplaints] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [polls, setPolls] = useState([]);
  const [staff, setStaff] = useState([]);

  // Modals / Form states
  const [showPollModal, setShowPollModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  
  const [pollForm, setPollForm] = useState({ question: '', option1: '', option2: '', option3: '', expiresAt: '' });
  const [staffForm, setStaffForm] = useState({ name: '', role: 'MAINTENANCE', phone: '', status: 'ACTIVE' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'complaints') {
        const cData = await apiClient.get('/api/complaints');
        setComplaints(cData);
      }
      if (activeTab === 'dashboard' || activeTab === 'predictions') {
        const pData = await apiClient.get('/api/complaints/predictions');
        setPredictions(pData);
      }
      if (activeTab === 'dashboard' || activeTab === 'payments') {
        const payData = await apiClient.get('/api/payments');
        setPayments(payData);
      }
      if (activeTab === 'dashboard' || activeTab === 'bookings') {
        const bData = await apiClient.get('/api/bookings');
        setBookings(bData);
      }
      if (activeTab === 'dashboard' || activeTab === 'polls') {
        const poData = await apiClient.get('/api/polls');
        setPolls(poData);
      }
      if (activeTab === 'dashboard' || activeTab === 'staff') {
        const sData = await apiClient.get('/api/staff');
        setStaff(sData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    setError('');
    setSuccess('');
  }, [activeTab]);

  // Update Complaint Status
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await apiClient.put(`/api/complaints/${complaintId}/status`, { status: newStatus });
      setSuccess(`Complaint #${complaintId} status updated to ${newStatus}.`);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Submit Poll
  const handlePollSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const options = [pollForm.option1, pollForm.option2].filter(o => o.trim() !== '');
    if (pollForm.option3.trim() !== '') options.push(pollForm.option3);

    if (options.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    try {
      await apiClient.post('/api/polls', {
        question: pollForm.question,
        options,
        expiresAt: pollForm.expiresAt + 'T23:59:59' // Expire at end of day
      });
      setSuccess('Poll created successfully.');
      setPollForm({ question: '', option1: '', option2: '', option3: '', expiresAt: '' });
      setShowPollModal(false);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Submit Staff Member
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/staff', staffForm);
      setSuccess('Staff member registered.');
      setStaffForm({ name: '', role: 'MAINTENANCE', phone: '', status: 'ACTIVE' });
      setShowStaffModal(false);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Toggle Staff status
  const toggleStaffStatus = async (staffMember) => {
    const nextStatus = staffMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.put(`/api/staff/${staffMember.id}`, {
        name: staffMember.name,
        role: staffMember.role,
        phone: staffMember.phone,
        status: nextStatus
      });
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
                <h1 style={{ fontSize: '2rem' }}>Administration Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome, Administrator. Aggregated insights for management operations.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Total Collections</h3>
                  <div className="value" style={{ color: 'var(--success)' }}>
                    ${payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--success)' }}><CreditCard size={24} /></div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Outstanding Dues</h3>
                  <div className="value" style={{ color: 'var(--danger)' }}>
                    ${payments.filter(p => p.status === 'UNPAID').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--danger)' }}><CreditCard size={24} /></div>
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

            {/* Quick Analytics & Prediction alert */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={20} /> AI Recurrence Trends Summary
                </h2>
                {predictions.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No recurring systemic complaints detected. System is running cleanly.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {predictions.slice(0, 2).map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(255,255,255,0.01)' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', display: 'block', textTransform: 'uppercase' }}>
                            {p.category} - {p.location}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.statusDescription}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--danger)', fontSize: '1.1rem' }}>{p.recurrenceRiskScore.toFixed(0)}%</span>
                      </div>
                    ))}
                    <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setActiveTab('predictions')}>
                      View Analytics Panel
                    </button>
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Vote size={20} /> Quick Utilities
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={() => setShowPollModal(true)}>
                    <Plus size={16} /> Create Community Poll
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowStaffModal(true)}>
                    <Plus size={16} /> Register New Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Complaints View */}
        {activeTab === 'complaints' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Community Complaints Console</h1>
                <p style={{ color: 'var(--text-secondary)' }}>View, inspect, and update resident filed support issues</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Resident</th>
                    <th>Flat</th>
                    <th>Issue details</th>
                    <th>Category</th>
                    <th>Logged At</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No complaints found.</td>
                    </tr>
                  ) : (
                    complaints.map(comp => (
                      <tr key={comp.id}>
                        <td>#{comp.id}</td>
                        <td style={{ fontWeight: 600 }}>{comp.resident ? comp.resident.fullName : 'System'}</td>
                        <td>{comp.resident ? comp.resident.flatNumber : '-'}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{comp.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{comp.description}</div>
                        </td>
                        <td><span className="badge badge-info">{comp.category}</span></td>
                        <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${
                            comp.status === 'RESOLVED' ? 'badge-success' : comp.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-pending'
                          }`}>{comp.status}</span>
                        </td>
                        <td>
                          <select
                            className="input-control"
                            value={comp.status}
                            onChange={(e) => handleStatusUpdate(comp.id, e.target.value)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto', background: 'rgba(255,255,255,0.03)' }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Predictions View */}
        {activeTab === 'predictions' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>AI Recurring Complaints Predictor</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Statistical density modeling identifying recurring systemic faults</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {predictions.length === 0 ? (
                <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No warnings reported. Low systemic risk detected.
                </div>
              ) : (
                predictions.map((pred, idx) => (
                  <div key={idx} className="glass-card" style={{ borderLeft: '5px solid var(--danger)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                        <ShieldAlert size={12} /> Recurrence Risk
                      </span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>
                        {pred.recurrenceRiskScore.toFixed(0)}%
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{pred.category} - {pred.location}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      {pred.statusDescription}
                    </p>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '0.85rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--danger)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Action Recommendation
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {pred.recommendations}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. Finance View */}
        {activeTab === 'payments' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Financial Collection Ledgers</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track billing statuses, outstanding balances, and transaction references</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Resident</th>
                    <th>Flat</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Transaction Ref</th>
                    <th>Date Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No ledger records logged.</td>
                    </tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay.id}>
                        <td>#{pay.id}</td>
                        <td style={{ fontWeight: 600 }}>{pay.resident ? pay.resident.fullName : 'Unknown'}</td>
                        <td>{pay.resident ? pay.resident.flatNumber : '-'}</td>
                        <td><span className="badge badge-info">{pay.type}</span></td>
                        <td style={{ fontWeight: 'bold', color: pay.status === 'PAID' ? 'var(--success)' : 'var(--danger)' }}>
                          ${pay.amount.toFixed(2)}
                        </td>
                        <td>{new Date(pay.dueDate).toLocaleDateString()}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{pay.transactionId || '-'}</td>
                        <td>{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className={`badge ${
                            pay.status === 'PAID' ? 'badge-success' : 'badge-pending'
                          }`}>{pay.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Bookings View */}
        {activeTab === 'bookings' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Amenity Bookings Audit</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Monitor Clubhouse, Gym, and Tennis Court bookings</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Resident</th>
                    <th>Flat</th>
                    <th>Facility Space</th>
                    <th>Booking Date</th>
                    <th>Time Slots</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No reservations found.</td>
                    </tr>
                  ) : (
                    bookings.map(bk => (
                      <tr key={bk.id}>
                        <td>#{bk.id}</td>
                        <td style={{ fontWeight: 600 }}>{bk.resident ? bk.resident.fullName : 'Deleted Resident'}</td>
                        <td>{bk.resident ? bk.resident.flatNumber : '-'}</td>
                        <td style={{ fontWeight: 600 }}>{bk.facilityName}</td>
                        <td>{new Date(bk.bookingDate).toLocaleDateString()}</td>
                        <td>{bk.startTime.substring(0,5)} - {bk.endTime.substring(0,5)}</td>
                        <td>
                          <span className={`badge ${bk.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                            {bk.status}
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

        {/* 6. Polls Tab */}
        {activeTab === 'polls' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Community Survey Manager</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Create polls and view live resident participation data</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowPollModal(true)}>
                <Plus size={16} /> Create Survey Poll
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {polls.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No polls active or archived.
                </div>
              ) : (
                polls.map(p => {
                  const totalVotes = p.options.reduce((acc, o) => acc + o.voteCount, 0);
                  return (
                    <div key={p.id} className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>Created by Admin</span>
                        <span>Total Votes: {totalVotes}</span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>{p.question}</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {p.options.map(opt => {
                          const pct = totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(0) : 0;
                          return (
                            <div key={opt.id} style={{ position: 'relative' }}>
                              <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between', cursor: 'default', background: 'rgba(255,255,255,0.03)', zIndex: 2, position: 'relative' }}>
                                <span>{opt.optionText}</span>
                                <span style={{ fontWeight: 'bold' }}>{pct}% ({opt.voteCount} votes)</span>
                              </div>
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 7. Staff Management Tab */}
        {activeTab === 'staff' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Operations Staff Directory</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage guards, electrical technicians, and building maintenance rosters</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowStaffModal(true)}>
                <Plus size={16} /> Register Staff
              </button>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Designated Role</th>
                    <th>Work Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No staff registered in directory.</td>
                    </tr>
                  ) : (
                    staff.map(s => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.phone}</td>
                        <td><span className="badge badge-info">{s.role}</span></td>
                        <td>
                          <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn ${s.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => toggleStaffStatus(s)}
                          >
                            {s.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
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
      </main>

      {/* ========================================= MODALS ========================================= */}

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handlePollSubmit}>
              <div className="modal-header">
                <h2>Create Community Survey Poll</h2>
                <button type="button" onClick={() => setShowPollModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Survey Question</label>
                  <input type="text" required className="input-control" placeholder="e.g. repainting clubhouse, parking rules" value={pollForm.question} onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Option 1</label>
                  <input type="text" required className="input-control" placeholder="Enter option 1" value={pollForm.option1} onChange={(e) => setPollForm({ ...pollForm, option1: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Option 2</label>
                  <input type="text" required className="input-control" placeholder="Enter option 2" value={pollForm.option2} onChange={(e) => setPollForm({ ...pollForm, option2: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Option 3 (Optional)</label>
                  <input type="text" className="input-control" placeholder="Enter option 3" value={pollForm.option3} onChange={(e) => setPollForm({ ...pollForm, option3: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Expires At</label>
                  <input type="date" required className="input-control" value={pollForm.expiresAt} onChange={(e) => setPollForm({ ...pollForm, expiresAt: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPollModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Publish Survey</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Staff Modal */}
      {showStaffModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleStaffSubmit}>
              <div className="modal-header">
                <h2>Register Operations Staff</h2>
                <button type="button" onClick={() => setShowStaffModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Staff Name</label>
                  <input type="text" required className="input-control" placeholder="Staff full name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Roster Phone</label>
                  <input type="text" required className="input-control" placeholder="+15550291" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Operations Role</label>
                  <select className="input-control" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                    <option value="MAINTENANCE">MAINTENANCE (Plumbing/Electrical)</option>
                    <option value="CLEANING">CLEANING (Housekeeping)</option>
                    <option value="SECURITY">SECURITY (Guard duty)</option>
                    <option value="MANAGEMENT">MANAGEMENT (Office/Supervision)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Status</label>
                  <select className="input-control" value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStaffModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Register Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
