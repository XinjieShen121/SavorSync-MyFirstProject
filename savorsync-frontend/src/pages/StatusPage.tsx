import React, { useState, useEffect } from 'react';
import { healthAPI } from '../services/apiUser';

const StatusPage: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await healthAPI.check();
        setStatus(JSON.stringify(response, null, 2));
      } catch (err: any) {
        setError(err.message);
      }
    };

    checkStatus();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>API Status Check</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Backend Health Check:</h2>
        {error ? (
          <div style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <div style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '5px' }}>
            <strong>Status:</strong> {status}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Links:</h2>
        <ul>
          <li><a href="/login">Login Page</a></li>
          <li><a href="/register">Register Page</a></li>
          <li><a href="/profile">Profile Page</a></li>
          <li><a href="/">Home Page</a></li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Expected Behavior:</h2>
        <ul>
          <li>✅ Backend should show "User database connected"</li>
          <li>✅ Login/Register should work</li>
          <li>❌ Recipe pages will show mock data (API not connected)</li>
        </ul>
      </div>
    </div>
  );
};

export default StatusPage; 