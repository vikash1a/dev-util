import React, { useState } from 'react';
import './JwtDecoder.css';

const JwtDecoder = () => {
  const [jwtInput, setJwtInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [decodedToken, setDecodedToken] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const decodeJwt = (token) => {
    try {
      // Split the JWT into parts
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      const [header, payload, signature] = parts;

      // Decode header and payload
      const decodedHeader = JSON.parse(atob(header));
      const decodedPayload = JSON.parse(atob(payload));

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decodedPayload.exp && decodedPayload.exp < currentTime;

      setDecodedToken({
        header: decodedHeader,
        payload: decodedPayload,
        signature: signature,
        isExpired: isExpired,
        currentTime: currentTime
      });
      
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error.message);
      setDecodedToken(null);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setJwtInput(input);
    
    if (input.trim()) {
      decodeJwt(input);
    } else {
      setIsValid(true);
      setErrorMessage('');
      setDecodedToken(null);
    }
  };

  const clearJwt = () => {
    setJwtInput('');
    setIsValid(true);
    setErrorMessage('');
    setDecodedToken(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const renderJsonValue = (value, level = 0) => {
    const indent = '  '.repeat(level);
    
    if (value === null) {
      return <span className="json-null">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className={`json-boolean ${value ? 'true' : 'false'}`}>{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="json-number">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="json-string">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      return (
        <div className="json-array">
          <span className="json-bracket">[</span>
          {value.length === 0 ? (
            <span className="json-empty">empty</span>
          ) : (
            <div className="json-array-content">
              {value.map((item, index) => (
                <div key={index} className="json-array-item">
                  {indent}  {renderJsonValue(item, level + 1)}
                  {index < value.length - 1 && <span className="json-comma">,</span>}
                </div>
              ))}
            </div>
          )}
          <span className="json-bracket">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return (
        <div className="json-object">
          <span className="json-bracket">{'{'}</span>
          {keys.length === 0 ? (
            <span className="json-empty">empty</span>
          ) : (
            <div className="json-object-content">
              {keys.map((key, index) => (
                <div key={key} className="json-object-item">
                  {indent}  <span className="json-key">"{key}"</span>
                  <span className="json-colon">: </span>
                  {renderJsonValue(value[key], level + 1)}
                  {index < keys.length - 1 && <span className="json-comma">,</span>}
                </div>
              ))}
            </div>
          )}
          <span className="json-bracket">{'}'}</span>
        </div>
      );
    }
    
    return <span className="json-unknown">{String(value)}</span>;
  };

  return (
    <div className="jwt-decoder-container">
      <div className="jwt-header">
        <h2>JWT Decoder</h2>
        <div className="jwt-actions">
          <button onClick={clearJwt} className="action-btn clear-btn">
            Clear
          </button>
        </div>
      </div>

      <div className="jwt-content">
        <div className="input-section">
          <h3>JWT Token</h3>
          <div className="input-container">
            <textarea
              value={jwtInput}
              onChange={handleInputChange}
              placeholder="Enter your JWT token here..."
              className={`jwt-input ${!isValid ? 'error' : ''}`}
            />
            {!isValid && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="output-section">
          <h3>Decoded JWT</h3>
          <div className="output-container">
            {decodedToken ? (
              <div className="jwt-display">
                <div className="jwt-part">
                  <div className="part-header">
                    <h4>Header</h4>
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(decodedToken.header, null, 2))}
                      className="copy-btn-small"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="part-content">
                    {renderJsonValue(decodedToken.header)}
                  </div>
                </div>

                <div className="jwt-part">
                  <div className="part-header">
                    <h4>Payload</h4>
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(decodedToken.payload, null, 2))}
                      className="copy-btn-small"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="part-content">
                    {renderJsonValue(decodedToken.payload)}
                  </div>
                </div>

                <div className="jwt-part">
                  <div className="part-header">
                    <h4>Signature</h4>
                    <button 
                      onClick={() => copyToClipboard(decodedToken.signature)}
                      className="copy-btn-small"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="part-content signature-content">
                    <code>{decodedToken.signature}</code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="jwt-placeholder">
                {isValid ? 'Enter a JWT token to decode' : 'Invalid JWT token'}
              </div>
            )}
          </div>
        </div>
      </div>

      {decodedToken && (
        <div className="jwt-info">
          <div className="info-item">
            <span className="info-label">Algorithm:</span>
            <span className="info-value">{decodedToken.header.alg || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Token Type:</span>
            <span className="info-value">{decodedToken.header.typ || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Issued At:</span>
            <span className="info-value">{formatDate(decodedToken.payload.iat)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Expires At:</span>
            <span className="info-value">{formatDate(decodedToken.payload.exp)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className={`info-value ${decodedToken.isExpired ? 'expired' : 'valid'}`}>
              {decodedToken.isExpired ? 'Expired' : 'Valid'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JwtDecoder; 