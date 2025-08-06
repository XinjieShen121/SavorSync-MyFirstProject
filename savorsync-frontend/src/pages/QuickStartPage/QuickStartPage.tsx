import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCuisines, getRecipesWithFilter } from '../../services/apiRecipe';
import './QuickStartPage.css';

interface QuickStartSelections {
  mood: string | null;
  cuisine: string | null;
  time: string | null;
}

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Cuisine icons mapping
const cuisineIcons: { [key: string]: string } = {
  'Japanese': '🍜',
  'Mexican': '🌮',
  'Italian': '🍝',
  'Vietnamese': '🍲',
  'Korean': '🥘',
  'Indian': '🍛',
  'American': '🍔',
  'French': '🥖',
  'Chinese': '🥢',
  'Thai': '🍜',
  'Greek': '🥙',
  'Spanish': '🥘',
  'Lebanese': '🥙',
  'Mediterranean': '🥙',
  'Asian': '🍜',
  'Latin': '🌮'
};

const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<QuickStartSelections>({
    mood: null,
    cuisine: null,
    time: null
  });
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Fetch cuisines from MongoDB when modal opens
  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching cuisines for QuickStart...');
        const cuisinesData = await getAllCuisines();
        console.log('🌍 Available cuisines:', cuisinesData);
        setCuisines(cuisinesData);
      } catch (err: any) {
        console.error('❌ Error fetching cuisines:', err);
        if (err.code === 'ECONNREFUSED') {
          setError('Backend server is not running. Please start the server.');
        } else if (err.response?.status === 404) {
          setError('API endpoint not found. Please check the backend configuration.');
        } else {
          setError(err.message || 'Failed to fetch cuisines. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCuisines();
    }
  }, [isOpen]);

  // Reset selections when modal opens and scroll to top
  useEffect(() => {
    if (isOpen) {
      setSelections({
        mood: null,
        cuisine: null,
        time: null
      });
      setShowCuisineDropdown(false);
      
      // Scroll to top when modal opens
      setTimeout(() => {
        window.scrollTo(0, 0);
        // Also scroll the modal content to top
        const modalElement = document.querySelector('.quick-start-modal');
        if (modalElement) {
          modalElement.scrollTop = 0;
        }
      }, 100);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside and handle scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.cuisine-dropdown-container')) {
        setShowCuisineDropdown(false);
      }
    };

    const handleScroll = () => {
      const modalElement = document.querySelector('.quick-start-modal');
      if (modalElement) {
        setShowScrollButton(modalElement.scrollTop > 100);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      const modalElement = document.querySelector('.quick-start-modal');
      if (modalElement) {
        modalElement.addEventListener('scroll', handleScroll);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      const modalElement = document.querySelector('.quick-start-modal');
      if (modalElement) {
        modalElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isOpen]);

  const handleMoodSelect = (mood: string) => {
    setSelections(prev => ({ ...prev, mood }));
  };

  const handleCuisineSelect = (cuisine: string) => {
    setSelections(prev => ({ ...prev, cuisine }));
    setShowCuisineDropdown(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelections(prev => ({ ...prev, time }));
  };

  const handleFindRecipes = async () => {
    if (!selections.cuisine) {
      alert('Please select a cuisine first!');
      return;
    }

    try {
      // Navigate to cuisine page with selections
      const cuisineMap: { [key: string]: string } = {
        'Asian': 'asian',
        'Mediterranean': 'mediterranean',
        'Latin': 'latin',
        'American': 'american',
        'Indian': 'indian',
        'French': 'french',
        'Italian': 'italian',
        'Thai': 'thai',
        'Mexican': 'mexican',
        'Japanese': 'japanese',
        'Korean': 'korean',
        'Chinese': 'chinese',
        'Vietnamese': 'vietnamese',
        'Greek': 'greek',
        'Spanish': 'spanish',
        'Lebanese': 'lebanese'
      };
      
      const cuisineId = cuisineMap[selections.cuisine] || selections.cuisine.toLowerCase();
      
      // Close modal first
      onClose();
      
      // Navigate to cuisine page with time filter
      navigate(`/cuisine/${cuisineId}`, { 
        state: { 
          mood: selections.mood,
          time: selections.time,
          quickStart: true
        }
      });
    } catch (error) {
      console.error('Error navigating to recipes:', error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="quick-start-modal-overlay">
      <div className="quick-start-modal">
        <div className="quick-start-container">
          {/* Header */}
          <div className="quick-start-header">
            <h2>Let's Start Cooking!</h2>
            <button className="close-button" onClick={handleClose}>×</button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="loading">Loading cuisines...</div>
          )}

          {/* Error state */}
          {error && (
            <div className="error">
              <h2>Error loading cuisines</h2>
              <p>{error}</p>
            </div>
          )}

          {/* Content when not loading or error */}
          {!loading && !error && (
            <>
              {/* Cooking Mood Section */}
              <div className="selection-section">
                <h2>What's your cooking mood today?</h2>
                <div className="mood-grid">
                  <button 
                    className={`mood-button ${selections.mood === 'comfort' ? 'active' : ''}`}
                    onClick={() => handleMoodSelect('comfort')}
                  >
                    <i className="bi bi-heart-fill"></i>
                    <span>Comfort Food</span>
                  </button>
                  <button 
                    className={`mood-button ${selections.mood === 'healthy' ? 'active' : ''}`}
                    onClick={() => handleMoodSelect('healthy')}
                  >
                    <i className="bi bi-house-fill"></i>
                    <span>Healthy & Fresh</span>
                  </button>
                  <button 
                    className={`mood-button ${selections.mood === 'quick' ? 'active' : ''}`}
                    onClick={() => handleMoodSelect('quick')}
                  >
                    <i className="bi bi-lightning-fill"></i>
                    <span>Quick & Easy</span>
                  </button>
                  <button 
                    className={`mood-button ${selections.mood === 'adventure' ? 'active' : ''}`}
                    onClick={() => handleMoodSelect('adventure')}
                  >
                    <i className="bi bi-compass-fill"></i>
                    <span>Culinary Adventure</span>
                  </button>
                </div>
              </div>

              {/* Cuisine Selection Section */}
              <div className="selection-section">
                <h2>Which cuisine interests you?</h2>
                <div className="cuisine-dropdown-container">
                  <button 
                    className={`cuisine-dropdown-button ${showCuisineDropdown ? 'active' : ''}`}
                    onClick={() => setShowCuisineDropdown(!showCuisineDropdown)}
                  >
                    <span className="dropdown-icon">
                      {selections.cuisine ? cuisineIcons[selections.cuisine] || '🍽️' : '🍽️'}
                    </span>
                    <span className="dropdown-text">
                      {selections.cuisine || 'Select a cuisine'}
                    </span>
                    <i className={`bi bi-chevron-${showCuisineDropdown ? 'up' : 'down'}`}></i>
                  </button>
                  
                  {showCuisineDropdown && (
                    <div className="cuisine-dropdown-list">
                      {cuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          className={`cuisine-dropdown-option ${selections.cuisine === cuisine ? 'active' : ''}`}
                          onClick={() => handleCuisineSelect(cuisine)}
                        >
                          <span className="cuisine-icon">{cuisineIcons[cuisine] || '🍽️'}</span>
                          <span className="cuisine-name">{cuisine}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Time Selection Section */}
              <div className="selection-section">
                <h2>How much time do you have?</h2>
                <div className="time-grid">
                  <button 
                    className={`time-button ${selections.time === '15' ? 'active' : ''}`}
                    onClick={() => handleTimeSelect('15')}
                  >
                    <i className="bi bi-clock"></i>
                    <span>15 minutes</span>
                  </button>
                  <button 
                    className={`time-button ${selections.time === '30' ? 'active' : ''}`}
                    onClick={() => handleTimeSelect('30')}
                  >
                    <i className="bi bi-clock"></i>
                    <span>30 minutes</span>
                  </button>
                  <button 
                    className={`time-button ${selections.time === '45' ? 'active' : ''}`}
                    onClick={() => handleTimeSelect('45')}
                  >
                    <i className="bi bi-clock"></i>
                    <span>45 minutes</span>
                  </button>
                  <button 
                    className={`time-button ${selections.time === '60' ? 'active' : ''}`}
                    onClick={() => handleTimeSelect('60')}
                  >
                    <i className="bi bi-clock"></i>
                    <span>1 hour+</span>
                  </button>
                </div>
              </div>

              {/* Find Recipes Button */}
              <div className="find-recipes-section">
                <button 
                  className={`find-recipes-button ${selections.cuisine ? 'active' : 'disabled'}`}
                  onClick={handleFindRecipes}
                  disabled={!selections.cuisine}
                >
                  <i className="bi bi-search"></i>
                  Find Recipes
                </button>
                
                {selections.cuisine && (
                  <div className="selection-summary">
                    <p>
                      Finding {selections.mood ? selections.mood : 'delicious'} {selections.cuisine} recipes
                      {selections.time && ` that take ${selections.time} minutes or less`}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Scroll to Top Button */}
        {showScrollButton && (
          <button 
            className="scroll-to-top-btn"
            onClick={() => {
              window.scrollTo(0, 0);
              const modalElement = document.querySelector('.quick-start-modal');
              if (modalElement) {
                modalElement.scrollTop = 0;
              }
            }}
            title="Scroll to top"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickStartModal; 