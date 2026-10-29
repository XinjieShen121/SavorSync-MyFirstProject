import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSignUpClick = () => {
    navigate('/register');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      {/* Back to Home Button - positioned under navigation */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>
      
      <div className="signin-section">
        <div className="signin-container">
          <h1>Welcome back</h1>
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input 
                id="login-email"
                type="email" 
                name="email"
                placeholder="Enter your email" 
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading || loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input 
                id="login-password"
                type="password" 
                name="password"
                placeholder="Enter your password" 
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading || loading}
              />
            </div>
            <button 
              type="submit" 
              className="signin-button" 
              disabled={isLoading || loading}
            >
              {isLoading || loading ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <p className="error-message">{error}</p>}
            <p className="signup-link">
              Don't have an account? <button type="button" onClick={handleSignUpClick}>Sign up</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 