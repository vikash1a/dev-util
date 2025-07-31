import React, { useState } from 'react';
import './JsonVisualizer.css';

const JsonVisualizer = () => {
  const [jsonInput, setJsonInput] = useState(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": [
    "reading",
    "swimming",
    "coding"
  ],
  "active": true,
  "metadata": {
    "created": "2023-01-15",
    "lastModified": "2023-12-01"
  }
}`);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedJson, setParsedJson] = useState(null);

  const validateAndParseJson = (input) => {
    try {
      const parsed = JSON.parse(input);
      setIsValid(true);
      setErrorMessage('');
      setParsedJson(parsed);
      return parsed;
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error.message);
      setParsedJson(null);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setJsonInput(input);
    if (input.trim()) {
      validateAndParseJson(input);
    } else {
      setIsValid(true);
      setErrorMessage('');
      setParsedJson(null);
    }
  };

  const formatJson = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formatted);
    }
  };

  const clearJson = () => {
    setJsonInput('');
    setIsValid(true);
    setErrorMessage('');
    setParsedJson(null);
  };

  const copyToClipboard = () => {
    if (parsedJson) {
      navigator.clipboard.writeText(JSON.stringify(parsedJson, null, 2));
    }
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
    <div className="json-visualizer-container">
      <div className="json-header">
        <h2>JSON Visualizer</h2>
        <div className="json-actions">
          <button onClick={formatJson} className="action-btn format-btn" disabled={!isValid || !parsedJson}>
            Format JSON
          </button>
          <button onClick={clearJson} className="action-btn clear-btn">
            Clear
          </button>
          <button onClick={copyToClipboard} className="action-btn copy-btn" disabled={!isValid || !parsedJson}>
            Copy
          </button>
        </div>
      </div>

      <div className="json-content">
        <div className="input-section">
          <h3>Input JSON</h3>
          <div className="input-container">
            <textarea
              value={jsonInput}
              onChange={handleInputChange}
              placeholder="Enter your JSON here..."
              className={`json-input ${!isValid ? 'error' : ''}`}
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
          <h3>Visualized JSON</h3>
          <div className="output-container">
            {parsedJson ? (
              <div className="json-display">
                {renderJsonValue(parsedJson)}
              </div>
            ) : (
              <div className="json-placeholder">
                {isValid ? 'Enter valid JSON to see visualization' : 'Invalid JSON format'}
              </div>
            )}
          </div>
        </div>
      </div>

      {parsedJson && (
        <div className="json-info">
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span className="info-value">{Array.isArray(parsedJson) ? 'Array' : 'Object'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Size:</span>
            <span className="info-value">{JSON.stringify(parsedJson).length} characters</span>
          </div>
          <div className="info-item">
            <span className="info-label">Keys:</span>
            <span className="info-value">{Object.keys(parsedJson).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonVisualizer; 