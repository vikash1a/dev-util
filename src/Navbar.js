import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Navbar.css';

const Navbar = ({ currentTool, onToolChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleToolClick = (tool) => {
    onToolChange(tool);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" title="Dev Utils">
          <span className="brand-logo">🛠️</span>
          <span className="brand-text">Dev Utils</span>
        </div>
        
        <div className="navbar-menu">
          <button 
            onClick={() => handleToolClick('markdown')} 
            className={`nav-link ${currentTool === 'markdown' ? 'active' : ''}`}
            title="Markdown Editor"
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Markdown Editor</span>
          </button>
          <button 
            onClick={() => handleToolClick('json')} 
            className={`nav-link ${currentTool === 'json' ? 'active' : ''}`}
            title="JSON Visualizer"
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">JSON Visualizer</span>
          </button>
          <button 
            onClick={() => handleToolClick('jwt')} 
            className={`nav-link ${currentTool === 'jwt' ? 'active' : ''}`}
            title="JWT Decoder"
          >
            <span className="nav-icon">🔐</span>
            <span className="nav-text">JWT Decoder</span>
          </button>
        </div>
        
        {user && (
          <div className="navbar-profile">
            <div className="profile-container" onClick={toggleProfile} title={user.name}>
              <img 
                src={user.picture} 
                alt={user.name} 
                className="profile-picture"
              />
              <span className="profile-name">{user.name}</span>
              <span className="profile-arrow">▲</span>
            </div>
            
            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <img src={user.picture} alt={user.name} />
                  <div>
                    <p className="profile-full-name">{user.name}</p>
                    <p className="profile-email">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="logout-button">
                  <span>🚪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 