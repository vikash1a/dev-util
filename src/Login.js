import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        given_name: decoded.given_name,
        family_name: decoded.family_name
      };
      login(userData);
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to Dev Utils</h1>
          <p>Sign in to access your development tools</p>
        </div>
        
        <div className="login-content">
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          
          <div className="login-info">
            <p>🔧 Access powerful development tools</p>
            <p>📝 Markdown Preview</p>
            <p>🔧 JSON Visualizer</p>
            <p>🔐 JWT Decoder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 