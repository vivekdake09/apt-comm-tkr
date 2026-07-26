import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import Sidebar from '../components/Sidebar';
import {
  Users,
  Truck,
  Package,
  Search,
  Plus,
  QrCode,
  CheckCircle,
  ArrowRight,
  LogOut,
  MapPin
} from 'lucide-react';

export const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data lists
  const [residents, setResidents] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [parcels, setParcels] = useState([]);

  // Scanning token state
  const [scanToken, setScanToken] = useState('');
  const [scannedVisitor, setScannedVisitor] = useState(null);
  const [scanError, setScanError] = useState('');

  // Registry form states
  const [walkinForm, setWalkinForm] = useState({ name: '', phone: '', purpose: '', vehicleNumber: '' });
  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: '', driverName: '' });
  const [parcelForm, setParcelForm] = useState({ residentId: '', carrier: '', trackingNumber: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'visitors') {
        const vData = await apiClient.get('/api/visitors');
        setVisitors(vData);
        // Fetch residents for dropdowns
        const rData = await apiClient.get('/api/auth/residents');
        setResidents(rData);
      }
      if (activeTab === 'dashboard' || activeTab === 'vehicles') {
        const vehData = await apiClient.get('/api/vehicles/active');
        setActiveVehicles(vehData);
      }
      if (activeTab === 'dashboard' || activeTab === 'parcels') {
        const pData = await apiClient.get('/api/parcels');
        setParcels(pData.filter(p => p.status === 'RECEIVED')); // only show pending pickup
        const rData = await apiClient.get('/api/auth/residents');
        setResidents(rData);
      }
    } catch (err) {
      console.error('Error loading security data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    setError('');
    setSuccess('');
    setScannedVisitor(null);
    setScanToken('');
    setScanError('');
  }, [activeTab]);

  // Scan & Verify QR
  const handleScanVerify = async (e) => {
    e.preventDefault();
    setScanError('');
    setScannedVisitor(null);
    try {
      const response = await apiClient.get(`/api/visitors/qr/${scanToken}`);
      setScannedVisitor(response);
    } catch (err) {
      setScanError(err || 'QR Pass not recognized');
    }
  };

  // Check-in QR
  const triggerCheckIn = async (token) => {
    try {
      await apiClient.post(`/api/visitors/qr/${token}/check-in`);
      setSuccess('Visitor checked in successfully.');
      setScannedVisitor(null);
      setScanToken('');
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Check-out QR
  const triggerCheckOut = async (token) => {
    try {
      await apiClient.post(`/api/visitors/qr/${token}/check-out`);
      setSuccess('Visitor checked out successfully.');
      setScannedVisitor(null);
      setScanToken('');
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Submit Walk-in visitor
  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/visitors/walk-in', walkinForm);
      setSuccess('Walk-in visitor checked in.');
      setWalkinForm({ name: '', phone: '', purpose: '', vehicleNumber: '' });
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Log unknown vehicle
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/api/vehicles/log-entry', vehicleForm);
      setSuccess('Vehicle entry logged.');
      setVehicleForm({ vehicleNumber: '', driverName: '' });
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Log exit for vehicle
  const handleVehicleExit = async (logId) => {
    try {
      await apiClient.put(`/api/vehicles/${logId}/log-exit`);
      setSuccess('Vehicle exit registered.');
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Log incoming package
  const handleParcelSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!parcelForm.residentId) {
      setError('Please select a resident');
      return;
    }
    try {
      await apiClient.post('/api/parcels', {
        residentId: parseInt(parcelForm.residentId),
        carrier: parcelForm.carrier,
        trackingNumber: parcelForm.trackingNumber
      });
      setSuccess('Parcel logged successfully.');
      setParcelForm({ residentId: '', carrier: '', trackingNumber: '' });
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  // Mark parcel picked up by resident
  const collectParcel = async (parcelId) => {
    try {
      await apiClient.put(`/api/parcels/${parcelId}/collect`);
      setSuccess('Parcel marked as collected.');
      fetchData();
    } catch (err) {
      setError(err);
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

        {/* 1. Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 style={{ fontSize: '2rem' }}>Gatehouse Operations</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome, Security Desk. Manage entries, vehicle gates, and incoming mail.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Active Vehicles Inside</h3>
                  <div className="value">{activeVehicles.length}</div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--accent-color)' }}><Truck size={24} /></div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Parcels in Locker</h3>
                  <div className="value">{parcels.length}</div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--warning)' }}><Package size={24} /></div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Today's Registrations</h3>
                  <div className="value">
                    {visitors.filter(v => v.status === 'CHECKED_IN' || v.status === 'CHECKED_OUT').length}
                  </div>
                </div>
                <div className="metric-icon-box" style={{ color: 'var(--success)' }}><Users size={24} /></div>
              </div>
            </div>

            {/* Quick QR Scanner Widget */}
            <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} /> Guard QR Scanner Terminal
              </h2>
              
              <form onSubmit={handleScanVerify} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  required
                  className="input-control"
                  placeholder="Enter QR pass token code (e.g., QR_TOK_...)"
                  value={scanToken}
                  onChange={(e) => { setScanToken(e.target.value); setScanError(''); }}
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Search size={16} /> Scan Pass
                </button>
              </form>

              {scanError && (
                <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {scanError}
                </div>
              )}

              {scannedVisitor && (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Pass Details Verified</h3>
                    <span className={`badge ${
                      scannedVisitor.status === 'APPROVED' ? 'badge-info' : scannedVisitor.status === 'CHECKED_IN' ? 'badge-success' : 'badge-danger'
                    }`}>{scannedVisitor.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Visitor Name:</span>
                      <div style={{ fontWeight: 'bold' }}>{scannedVisitor.name}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                      <div style={{ fontWeight: 'bold' }}>{scannedVisitor.phone}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Invited By:</span>
                      <div style={{ fontWeight: 'bold' }}>
                        {scannedVisitor.resident ? `${scannedVisitor.resident.fullName} (Flat ${scannedVisitor.resident.flatNumber})` : 'Walk-in'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Purpose:</span>
                      <div style={{ fontWeight: 'bold' }}>{scannedVisitor.purpose || 'Personal visit'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {scannedVisitor.status === 'APPROVED' && (
                      <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => triggerCheckIn(scannedVisitor.qrCodeToken)}>
                        Approve Check In
                      </button>
                    )}
                    {scannedVisitor.status === 'CHECKED_IN' && (
                      <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={() => triggerCheckOut(scannedVisitor.qrCodeToken)}>
                        Log Check Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. QR Visitor Desk Tab */}
        {activeTab === 'visitors' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Active Visitor Logs</h2>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Flat</th>
                      <th>Purpose</th>
                      <th>Token</th>
                      <th>Time Log</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No entries today.</td>
                      </tr>
                    ) : (
                      visitors.map(v => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 600 }}>{v.name}</td>
                          <td>{v.resident ? v.resident.flatNumber : 'Walk-in'}</td>
                          <td>{v.purpose || '-'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.qrCodeToken}</td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {v.checkInTime && <div>In: {new Date(v.checkInTime).toLocaleTimeString()}</div>}
                            {v.checkOutTime && <div>Out: {new Date(v.checkOutTime).toLocaleTimeString()}</div>}
                          </td>
                          <td>
                            <span className={`badge ${
                              v.status === 'CHECKED_IN' ? 'badge-success' : v.status === 'CHECKED_OUT' ? 'badge-danger' : 'badge-pending'
                            }`}>{v.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Log Unexpected Guest</h2>
              <form onSubmit={handleWalkinSubmit}>
                <div className="form-group">
                  <label>Guest Name</label>
                  <input type="text" required className="input-control" placeholder="Visitor full name" value={walkinForm.name} onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" required className="input-control" placeholder="+15559812" value={walkinForm.phone} onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Purpose</label>
                  <input type="text" required className="input-control" placeholder="e.g. Electrician repair, Food Courier" value={walkinForm.purpose} onChange={(e) => setWalkinForm({ ...walkinForm, purpose: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Vehicle Number (Optional)</label>
                  <input type="text" className="input-control" placeholder="e.g. TX-992-ZZ" value={walkinForm.vehicleNumber} onChange={(e) => setWalkinForm({ ...walkinForm, vehicleNumber: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Log Walk-in & Check In
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. Vehicle Logs Tab */}
        {activeTab === 'vehicles' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Vehicles Inside Community</h2>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Vehicle Number</th>
                      <th>Driver Name</th>
                      <th>Entry Time</th>
                      <th>Category</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVehicles.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No vehicles logged inside.</td>
                      </tr>
                    ) : (
                      activeVehicles.map(veh => (
                        <tr key={veh.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{veh.vehicleNumber}</td>
                          <td>{veh.driverName || 'Unknown'}</td>
                          <td>{new Date(veh.entryTime).toLocaleString()}</td>
                          <td>
                            <span className="badge badge-info">
                              {veh.visitor ? 'INVITED VISITOR' : 'DIRECT LOG'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleVehicleExit(veh.id)}>
                              Log Exit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Register Gate Entry</h2>
              <form onSubmit={handleVehicleSubmit}>
                <div className="form-group">
                  <label>Vehicle Plate Number</label>
                  <input type="text" required className="input-control" placeholder="e.g. TX-992-ZZ" value={vehicleForm.vehicleNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Driver / Company Name</label>
                  <input type="text" className="input-control" placeholder="e.g. DHL Driver, UPS Courier" value={vehicleForm.driverName} onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Log Vehicle Gate Entry
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Parcel Desk Tab */}
        {activeTab === 'parcels' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pending Resident Pickups</h2>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Resident Name</th>
                      <th>Flat</th>
                      <th>Carrier</th>
                      <th>Tracking Code</th>
                      <th>Received</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcels.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending pickups in locker.</td>
                      </tr>
                    ) : (
                      parcels.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.resident.fullName}</td>
                          <td>{p.resident.flatNumber}</td>
                          <td><span className="badge badge-info">{p.carrier}</span></td>
                          <td>{p.trackingNumber || '-'}</td>
                          <td>{new Date(p.receivedAt).toLocaleTimeString()}</td>
                          <td>
                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => collectParcel(p.id)}>
                              Mark Picked Up
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Register Parcel Arrival</h2>
              <form onSubmit={handleParcelSubmit}>
                <div className="form-group">
                  <label>Assign to Flat / Resident</label>
                  <select
                    className="input-control"
                    required
                    value={parcelForm.residentId}
                    onChange={(e) => setParcelForm({ ...parcelForm, residentId: e.target.value })}
                    style={{ appearance: 'none', background: 'rgba(255,255,255,0.04) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px' }}
                  >
                    <option value="" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Select Resident</option>
                    {residents.map(r => (
                      <option key={r.userId} value={r.userId} style={{ background: 'var(--bg-secondary)', color: 'white' }}>
                        {r.fullName} (Flat {r.flatNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Carrier / Logistics</label>
                  <input type="text" required className="input-control" placeholder="e.g. Amazon, FedEx, DHL" value={parcelForm.carrier} onChange={(e) => setParcelForm({ ...parcelForm, carrier: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Tracking Number (Optional)</label>
                  <input type="text" className="input-control" placeholder="e.g. TRK9921004" value={parcelForm.trackingNumber} onChange={(e) => setParcelForm({ ...parcelForm, trackingNumber: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Log Incoming Parcel
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecurityDashboard;
