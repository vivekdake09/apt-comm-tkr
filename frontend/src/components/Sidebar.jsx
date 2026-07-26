import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  Package,
  CreditCard,
  Calendar,
  Vote,
  Truck,
  UserCheck,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define menu items based on role
  const getMenuItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'predictions', label: 'AI Predictions', icon: Vote }, // Recurrence predictor
        { id: 'payments', label: 'Finance & Bills', icon: CreditCard },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'polls', label: 'Polls Manager', icon: Vote },
        { id: 'staff', label: 'Staff Roster', icon: UserCheck }
      ];
    }
    if (user?.role === 'SECURITY') {
      return [
        { id: 'dashboard', label: 'Security Portal', icon: LayoutDashboard },
        { id: 'visitors', label: 'QR Visitor Desk', icon: Users },
        { id: 'vehicles', label: 'Vehicle Logs', icon: Truck },
        { id: 'parcels', label: 'Parcel Registry', icon: Package }
      ];
    }
    // Resident Role
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'complaints', label: 'Complaints', icon: AlertCircle },
      { id: 'visitors', label: 'Visitor Invites', icon: Users },
      { id: 'parcels', label: 'My Parcels', icon: Package },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'bookings', label: 'Book Facility', icon: Calendar },
      { id: 'polls', label: 'Active Polls', icon: Vote }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Apt-Comm</div>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="profile-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.fullName || 'User'}</span>
            <span className="profile-role">
              {user?.role} {user?.flatNumber ? `(${user.flatNumber})` : ''}
            </span>
          </div>
        </div>
        
        <div onClick={handleLogout} className="sidebar-link" style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
