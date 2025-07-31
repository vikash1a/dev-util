import React from 'react';
import './App.css';
import Navbar from './Navbar';
import MarkdownPreview from './MarkdownPreview';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <MarkdownPreview />
      </main>
    </div>
  );
}

export default App;
