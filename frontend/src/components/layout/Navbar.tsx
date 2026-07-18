import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand text-gradient">
          ConsignArt
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/catalog" className="nav-link">Catalog</Link>
              <Link to="/exhibitions" className="nav-link">Exhibitions</Link>
              {user && user.role === 'admin' && (
                <Link to="/admin/users" className="nav-link" style={{ color: '#ef4444' }}>Users</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
