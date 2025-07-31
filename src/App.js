import React, { useState } from 'react';
import './App.css';
import Navbar from './Navbar';
import MainContent from './MainContent';

function App() {
  const [currentTool, setCurrentTool] = useState('markdown');

  return (
    <div className="App">
      <Navbar currentTool={currentTool} onToolChange={setCurrentTool} />
      <MainContent currentTool={currentTool} />
    </div>
  );
}

export default App;
