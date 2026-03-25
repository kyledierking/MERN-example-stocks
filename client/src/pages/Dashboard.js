import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StockSearch from '../components/StockSearch';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <h1>Stock Tracker</h1>
          <div className="nav-right">
            <span className="user-name">Welcome, {user?.name}!</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Stock Data Viewer</h2>
        <p>Search for stocks to view their opening price.</p>
        <StockSearch />
      </div>
    </div>
  );
};

export default Dashboard;
