import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Navbar.css';

const Navbar = ({ currentTool, onToolChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleToolClick = (tool) => {
    onToolChange(tool);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>Dev Utils</h1>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <button 
            onClick={() => handleToolClick('markdown')} 
            className={`nav-link ${currentTool === 'markdown' ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            Markdown Preview
          </button>
          <button 
            onClick={() => handleToolClick('json')} 
            className={`nav-link ${currentTool === 'json' ? 'active' : ''}`}
          >
            <span className="nav-icon">🔧</span>
            JSON Visualizer
          </button>
          <button 
            onClick={() => handleToolClick('jwt')} 
            className={`nav-link ${currentTool === 'jwt' ? 'active' : ''}`}
          >
            <span className="nav-icon">🔐</span>
            JWT Decoder
          </button>
        </div>
        
        {user && (
          <div className="navbar-profile">
            <div className="profile-container" onClick={toggleProfile}>
              <img 
                src={user.picture} 
                alt={user.name} 
                className="profile-picture"
              />
              <span className="profile-name">{user.name}</span>
              <span className="profile-arrow">▼</span>
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
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 