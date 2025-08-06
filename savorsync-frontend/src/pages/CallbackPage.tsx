import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSpotifyCallback } from '../utils/spotify';
import './CallbackPage.css';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = () => {
      try {
        handleSpotifyCallback();
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect back to the previous page or home after a short delay
        setTimeout(() => {
          const returnUrl = localStorage.getItem('spotify_return_url') || '/';
          localStorage.removeItem('spotify_return_url');
          navigate(returnUrl);
        }, 2000);
      } catch (error) {
        console.error('Spotify callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="callback-page">
      <div className="callback-container">
        <div className="callback-content">
          {status === 'processing' && (
            <>
              <div className="loading-spinner"></div>
              <h2>Connecting to Spotify...</h2>
              <p>{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="success-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <h2>Successfully Connected!</h2>
              <p>{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="error-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <h2>Authentication Failed</h2>
              <p>{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallbackPage; 