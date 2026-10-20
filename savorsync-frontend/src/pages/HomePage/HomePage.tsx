import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import QuickStartModal from '../QuickStartPage/QuickStartModalMUI';
import './HomePage.css';

// Import images
import asianFood from "../../assets/asian-food.jpeg";
import mediterraneanFood from "../../assets/mediterranean-food.jpeg";
import latinFood from "../../assets/latin-food.jpg";
import americanFood from "../../assets/american-food.jpeg";



const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  
  // State variables
  const [displayText, setDisplayText] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(false);

  const mainFullText = "Connecting the World One Dish at a Time";

  // Function to handle cuisine card clicks
  const handleCuisineClick = (cuisine: string) => {
    // Map cuisine names to cuisine IDs
    const cuisineMap: { [key: string]: string } = {
      'Asian': 'asian',
      'Mediterranean': 'mediterranean',
      'Latin': 'latin',
      'American': 'american'
    };
    
    const cuisineId = cuisineMap[cuisine];
    if (cuisineId) {
      navigate(`/cuisine/${cuisineId}`);
    }
  };

  // Function to handle quick start modal
  const handleQuickStart = () => {
    setShowQuickStart(true);
  };

  // Main content animation effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(mainFullText.slice(0, index));
      index++;
      if (index > mainFullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      {/* Welcome Message Banner */}
      {isAuthenticated && user && (
        <div className="welcome-banner">
          <div className="welcome-content">
            <i className="bi bi-person-circle"></i>
            <span className="welcome-text">Welcome, {user.name}</span>
            <span className="welcome-subtitle">Ready to explore delicious recipes?</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="cultural-greetings">
          <div className="greeting greeting-1">Hello</div>
          <div className="greeting greeting-2">¡Hola!</div>
          <div className="greeting greeting-3">こんにちは (Konnichiwa)</div>
          <div className="greeting greeting-4">नमस्ते (Namaste)</div>
          <div className="greeting greeting-5">مرحبا (Marhaba)</div>
          <div className="greeting greeting-6">Bonjour</div>
          <div className="greeting greeting-7">안녕하세요 (Annyeonghaseyo)</div>
          <div className="greeting greeting-8">Ciao</div>
          <div className="greeting greeting-9">Здравствуйте (Zdravstvuyte)</div>
          <div className="greeting greeting-10">สวัสดี (Sawadee)</div>
          <div className="greeting greeting-11">你好 (Nǐ hǎo)</div>
        </div>
        <h1 className="main-heading">{displayText}</h1>
        <button 
          className="start-cooking-btn"
          onClick={handleQuickStart}
        >
          <span className="play-icon">▶</span> Start Cooking
        </button>

        {/* Cuisine Categories */}
        <div className="cuisine-categories">
          <div className="cuisine-card" onClick={() => handleCuisineClick('Asian')}>
            <img src={asianFood} alt="Asian Heritage" />
            <h3>Asian Heritage</h3>
          </div>
          <div className="cuisine-card" onClick={() => handleCuisineClick('Mediterranean')}>
            <img src={mediterraneanFood} alt="Mediterranean Classics" />
            <h3>Mediterranean Classics</h3>
          </div>
          <div className="cuisine-card" onClick={() => handleCuisineClick('Latin')}>
            <img src={latinFood} alt="Latin Flavors" />
            <h3>Latin Flavors</h3>
          </div>
          <div className="cuisine-card" onClick={() => handleCuisineClick('American')}>
            <img src={americanFood} alt="American Comfort" />
            <h3>American Comfort</h3>
          </div>
        </div>


      </main>

      {/* Copyright Footer */}
      <footer className="copyright-footer">
        <p>© {new Date().getFullYear()} SavorSync. All rights reserved.</p>
      </footer>

      {/* Quick Start Modal */}
      <QuickStartModal 
        isOpen={showQuickStart} 
        onClose={() => setShowQuickStart(false)} 
      />
    </div>
  );
};

export default HomePage; 