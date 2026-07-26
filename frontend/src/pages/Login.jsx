import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'RESIDENT',
    flatNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const response = await login(formData.username, formData.password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          if (response.role === 'ADMIN') navigate('/admin');
          else if (response.role === 'SECURITY') navigate('/security');
          else navigate('/resident');
        }, 800);
      } else {
        await register(formData);
        setSuccess('Registration successful! Please sign in using your credentials.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err || 'Authentication failed. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(9, 13, 22) 0%, rgb(18, 16, 42) 90%)',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>Apt-Comm</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Apartment Community Platform</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.25rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: isLogin ? 'var(--accent-color)' : 'transparent',
              color: isLogin ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font-title)',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: !isLogin ? 'var(--accent-color)' : 'transparent',
              color: !isLogin ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font-title)',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-glow)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username"
              required
              className="input-control" 
              placeholder="Enter username" 
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  className="input-control" 
                  placeholder="Enter full name" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="input-control" 
                  placeholder="name@email.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  className="input-control" 
                  placeholder="+15550100" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role"
                  className="input-control"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ appearance: 'none', background: 'rgba(255,255,255,0.04) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px' }}
                >
                  <option value="RESIDENT" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Resident</option>
                  <option value="SECURITY" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Security Guard</option>
                  <option value="ADMIN" style={{ background: 'var(--bg-secondary)', color: 'white' }}>System Admin</option>
                </select>
              </div>

              {formData.role === 'RESIDENT' && (
                <div className="form-group">
                  <label>Flat Number / Unit</label>
                  <input 
                    type="text" 
                    name="flatNumber"
                    required
                    className="input-control" 
                    placeholder="e.g. 101-A" 
                    value={formData.flatNumber}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </>
          )}

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="input-control" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
