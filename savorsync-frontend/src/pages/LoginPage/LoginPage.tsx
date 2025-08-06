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

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in
    console.log('Google sign-in clicked');
  };

  const handleFacebookSignIn = () => {
    // TODO: Implement Facebook sign-in
    console.log('Facebook sign-in clicked');
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
          <h2>Welcome Back</h2>
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input 
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
              <label>Password</label>
              <input 
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
            <div className="social-signin">
              <p>Or sign in with</p>
              <div className="social-buttons">
                <button 
                  type="button"
                  className="social-button google"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || loading}
                >
                  <i className="bi bi-google"></i>
                  Google
                </button>
                <button 
                  type="button"
                  className="social-button facebook"
                  onClick={handleFacebookSignIn}
                  disabled={isLoading || loading}
                >
                  <i className="bi bi-facebook"></i>
                  Facebook
                </button>
              </div>
            </div>
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