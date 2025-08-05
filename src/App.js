import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';
import Navbar from './Navbar';
import MainContent from './MainContent';
import Login from './Login';
import { GOOGLE_CLIENT_ID } from './config';

function AppContent() {
  const [currentTool, setCurrentTool] = useState('markdown');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <Navbar currentTool={currentTool} onToolChange={setCurrentTool} />
      <MainContent currentTool={currentTool} />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
