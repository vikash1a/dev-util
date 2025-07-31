import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ currentTool, onToolChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleToolClick = (tool) => {
    onToolChange(tool);
    setIsMenuOpen(false);
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