import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    // Name validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    // Check for number
    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return false;
    }

    return true;
  };

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
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting registration with:', { name: formData.name, email: formData.email });
      await register(formData.name, formData.email, formData.password);
      console.log('Registration successful, navigating to home');
      navigate('/');
    } catch (err: any) {
      console.error('Registration error details:', err);
      // Display the specific error message from the backend
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign-up
    console.log('Google sign-up clicked');
  };

  const handleFacebookSignUp = () => {
    // TODO: Implement Facebook sign-up
    console.log('Facebook sign-up clicked');
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="register-page">
      {/* Back to Home Button - positioned under navigation */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>
      
      <div className="signin-section">
        <div className="signin-container">
          <h2>Create Account</h2>
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter your full name" 
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading || loading}
                minLength={2}
              />
            </div>
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
                placeholder="Create a password " 
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading || loading}
                minLength={6}
              />
              <small className="password-hint">
                *Password must be at least 6 characters with 1 uppercase letter, 1 lowercase letter, and 1 number
              </small>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Confirm your password" 
                value={formData.confirmPassword}
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
              {isLoading || loading ? 'Creating Account...' : 'Create Account'}
            </button>
            {error && <p className="error-message">{error}</p>}
            <div className="social-signin">
              <p>Or sign up with</p>
              <div className="social-buttons">
                <button 
                  type="button"
                  className="social-button google"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading || loading}
                >
                  <i className="bi bi-google"></i>
                  Google
                </button>
                <button 
                  type="button"
                  className="social-button facebook"
                  onClick={handleFacebookSignUp}
                  disabled={isLoading || loading}
                >
                  <i className="bi bi-facebook"></i>
                  Facebook
                </button>
              </div>
            </div>
            <p className="signup-link">
              Already have an account? <button type="button" onClick={handleSignInClick}>Sign in</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 