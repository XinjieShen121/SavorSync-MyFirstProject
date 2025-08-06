import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById } from '../../services/apiRecipe';
import { getCulturalInsight, CulturalInsightResponse } from '../../services/apiCultural';
import CulturalMusic from '../../components/CulturalMusic';
import './RecipeDetailPage.css';

const RecipeDetailPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Authentic Recipe');
  const [currentStep, setCurrentStep] = useState(1);
  const [substitutedIngredients, setSubstitutedIngredients] = useState<{[key: string]: string}>({});
  const [culturalInsight, setCulturalInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Debug: Log the recipe ID from URL params
  console.log(`📍 RecipeDetailPage - URL recipeId: ${recipeId}`);
  console.log(`📍 RecipeDetailPage - Current URL: ${window.location.href}`);

  // Helper function to convert YouTube URLs to embed format
  const convertToEmbedUrl = (url: string): string => {
    if (!url) {
      console.log(`❌ No URL provided`);
      return '';
    }
    
    console.log(`🔧 Converting URL: ${url}`);
    
    // Check if it's a placeholder URL (contains 'example')
    if (url.includes('example')) {
      console.log(`❌ Placeholder URL detected: ${url}`);
      return '';
    }
    
    // Handle youtu.be format - extract video ID and convert to embed URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId && videoId !== 'example') {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log(`✅ Converted youtu.be URL: ${embedUrl}`);
        return embedUrl;
      }
    }
    
    // Handle youtube.com/watch format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId && videoId !== 'example') {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log(`✅ Converted youtube.com/watch URL: ${embedUrl}`);
        return embedUrl;
      }
    }
    
    // Handle youtube.com/embed format (already correct)
    if (url.includes('youtube.com/embed')) {
      console.log(`✅ Already embed format: ${url}`);
      return url;
    }
    
    // Handle youtube.com/v/ format
    if (url.includes('youtube.com/v/')) {
      const videoId = url.split('youtube.com/v/')[1]?.split('?')[0];
      if (videoId && videoId !== 'example') {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log(`✅ Converted youtube.com/v/ URL: ${embedUrl}`);
        return embedUrl;
      }
    }
    
    console.log(`❌ Could not convert URL: ${url}`);
    return '';
  };

  const isValidVideoUrl = (url: string): boolean => {
    if (!url) {
      console.log(`❌ No URL provided`);
      return false;
    }
    
    console.log(`🔍 Validating URL: "${url}"`);
    
    // Check if it's a placeholder URL (contains 'example')
    if (url.includes('example')) {
      console.log(`❌ Placeholder URL detected: ${url}`);
      return false;
    }
    
    // Check if it's a valid YouTube URL format
    const validFormats = [
      'youtu.be/',
      'youtube.com/watch',
      'youtube.com/embed',
      'youtube.com/v/'
    ];
    
    const isValid = validFormats.some(format => url.includes(format));
    console.log(`🔍 URL validation for "${url}": ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  };

  // Fetch recipe when component mounts
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (recipeId) {
          console.log(`🔍 Fetching recipe with ID: ${recipeId}`);
          const data = await getRecipeById(recipeId);
          
          console.log(`📊 Recipe data received:`, {
            id: data._id,
            title: data.title,
            recipe_name: data.recipe_name,
            cuisine: data.cuisine,
            shortform_video_url: data.shortform_video_url,
            longform_video_url: data.longform_video_url,
            shortform_valid: isValidVideoUrl(data.shortform_video_url),
            longform_valid: isValidVideoUrl(data.longform_video_url)
          });
          
          // Validate that we got the correct recipe
          if (data._id !== recipeId) {
            console.error(`❌ Recipe ID mismatch! Expected: ${recipeId}, Got: ${data._id}`);
            setError('Recipe ID mismatch - wrong recipe loaded');
            return;
          }
          
          setRecipe(data);
          
          // Log video URL conversion for debugging
          if (data.shortform_video_url) {
            const convertedUrl = convertToEmbedUrl(data.shortform_video_url);
            console.log(`🎥 Video URL conversion:`, {
              original: data.shortform_video_url,
              converted: convertedUrl,
              will_embed: !!convertedUrl
            });
          }
          
        } else {
          setError('No recipe ID provided');
        }
      } catch (err: any) {
        console.error('❌ Error fetching recipe:', err);
        setError(err.message || 'Failed to fetch recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleBackToHome = () => {
    // Try to go back to previous page, if not available go to all recipes
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/all-recipes');
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setCurrentStep(1); // Reset to first step when changing filters
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (recipe?.instructions && currentStep < recipe.instructions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGetCulturalInsight = async () => {
    if (!recipeId) {
      setInsightError('Recipe ID not available');
      return;
    }

    setLoadingInsight(true);
    setInsightError(null);
    
    try {
      console.log('🧠 Requesting cultural insight for recipe:', recipeId);
      const response = await getCulturalInsight(recipeId);
      
      setCulturalInsight(response.insight);
      console.log('✨ Cultural insight received successfully');
    } catch (error: any) {
      console.error('❌ Error getting cultural insight:', error);
      setInsightError(error.message || 'Failed to get cultural insight. Please try again.');
    } finally {
      setLoadingInsight(false);
    }
  };

  // Substitution helper functions
  const getSubstitution = (ingredient: string, dietType: string) => {
    const ingredientSubstitutions = {
      'chicken breast': {
        vegetarian: 'tempeh or tofu',
        'low-sodium': 'low-sodium chicken breast',
        'gluten-free': 'gluten-free chicken breast'
      },
      'soy sauce': {
        vegetarian: 'tamari (gluten-free soy sauce)',
        'low-sodium': 'low-sodium soy sauce',
        'gluten-free': 'tamari or coconut aminos'
      },
      'flour': {
        vegetarian: 'flour (already vegetarian)',
        'low-sodium': 'flour (no sodium)',
        'gluten-free': 'almond flour or coconut flour'
      },
      'beef': {
        vegetarian: 'lentils or mushrooms',
        'low-sodium': 'lean beef',
        'gluten-free': 'gluten-free beef'
      },
      'pork': {
        vegetarian: 'jackfruit or seitan',
        'low-sodium': 'lean pork',
        'gluten-free': 'gluten-free pork'
      }
    };

    const lowerIngredient = ingredient.toLowerCase();
    for (const [key, substitutions] of Object.entries(ingredientSubstitutions)) {
      if (lowerIngredient.includes(key)) {
        return substitutions[dietType as keyof typeof substitutions] || ingredient;
      }
    }
    return ingredient;
  };

  const hasSubstitution = (ingredient: string) => {
    const vegSub = getSubstitution(ingredient, 'vegetarian');
    const lowSodSub = getSubstitution(ingredient, 'low-sodium');
    const glutenSub = getSubstitution(ingredient, 'gluten-free');
    return vegSub !== ingredient || lowSodSub !== ingredient || glutenSub !== ingredient;
  };

  const getBestSubstitution = (ingredient: string) => {
    // Priority: vegetarian > gluten-free > low-sodium
    const vegSub = getSubstitution(ingredient, 'vegetarian');
    if (vegSub !== ingredient) return vegSub;
    
    const glutenSub = getSubstitution(ingredient, 'gluten-free');
    if (glutenSub !== ingredient) return glutenSub;
    
    const lowSodSub = getSubstitution(ingredient, 'low-sodium');
    if (lowSodSub !== ingredient) return lowSodSub;
    
    return ingredient;
  };

  const handleIngredientSubstitution = (ingredient: string) => {
    if (substitutedIngredients[ingredient]) {
      // Revert to original
      const newSubstitutions = { ...substitutedIngredients };
      delete newSubstitutions[ingredient];
      setSubstitutedIngredients(newSubstitutions);
    } else {
      // Substitute
      const substitution = getBestSubstitution(ingredient);
      if (substitution !== ingredient) {
        setSubstitutedIngredients({
          ...substitutedIngredients,
          [ingredient]: substitution
        });
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <div className="loading">Loading recipe...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <h2>Error loading recipe</h2>
          <p>{error}</p>
          <p>Recipe ID: {recipeId}</p>
          <button 
            className="back-button"
            onClick={handleBackToHome}
          >
            ← Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  // No recipe found
  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <h2>Recipe not found</h2>
          <p>The recipe you're looking for doesn't exist.</p>
          <p>Recipe ID: {recipeId}</p>
          <button 
            className="back-button"
            onClick={handleBackToHome}
          >
            ← Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const renderCulturalStory = () => {
    console.log(`🎬 Starting renderCulturalStory for recipe:`, recipe);
    console.log(`🎬 Recipe shortform_video_url: "${recipe.shortform_video_url}"`);
    console.log(`🎬 Recipe title: "${recipe.title}"`);
    console.log(`🎬 Recipe ID: "${recipe._id}"`);
    console.log(`🎬 Full recipe object:`, recipe);
    
    // SIMPLIFIED LOGIC: Direct check for valid video URL
    const hasValidVideo = recipe.shortform_video_url && 
                         !recipe.shortform_video_url.includes('example') &&
                         (recipe.shortform_video_url.includes('youtu.be/') || 
                          recipe.shortform_video_url.includes('youtube.com/watch') ||
                          recipe.shortform_video_url.includes('youtube.com/embed'));
    
    const shortformEmbedUrl = hasValidVideo ? convertToEmbedUrl(recipe.shortform_video_url) : '';
    
    // Check if longform video URL is valid
    const isLongformValid = isValidVideoUrl(recipe.longform_video_url);
    
    console.log(`🎥 SIMPLIFIED LOGIC:`, {
      recipe_id: recipe._id,
      recipe_title: recipe.title,
      shortform_video_url: recipe.shortform_video_url,
      hasValidVideo: hasValidVideo,
      shortform_embed_url: shortformEmbedUrl,
      longform_video_url: recipe.longform_video_url,
      longform_valid: isLongformValid,
      will_show_video: !!shortformEmbedUrl,
      will_show_view_more: isLongformValid
    });
    
    return (
      <div className="cultural-story-section">
        <h3>Cultural Background</h3>
        <p>{recipe.culturalBackground || recipe.fun_facts?.[0] || 'Learn about the cultural significance of this dish.'}</p>
        
        {/* YouTube Video Section */}
        <div className="video-section">
          <h4>A Brief Journey into {recipe.recipe_name || recipe.title}'s Cultural Heritage</h4>
          

          
          <div className="video-container">
            {(() => {
              console.log(`🎬 About to render video. shortformEmbedUrl: "${shortformEmbedUrl}"`);
              console.log(`🎬 Recipe has video URL: "${recipe.shortform_video_url}"`);
              console.log(`🎬 Has valid video: ${hasValidVideo}`);
              return null;
            })()}
            {shortformEmbedUrl ? (
              <>
                {(() => {
                  console.log(`🎬 Rendering iframe with src: ${shortformEmbedUrl}`);
                  return null;
                })()}
                <iframe
                  width="100%"
                  height="315"
                  src={shortformEmbedUrl}
                  title={`${recipe.recipe_name || recipe.title} Cultural Video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </>
            ) : (
              <>
                {(() => {
                  console.log(`🎬 Rendering video unavailable message`);
                  console.log(`🎬 Reason: shortformEmbedUrl is empty`);
                  return null;
                })()}
                <div className="video-unavailable">
                  <div className="video-placeholder">
                    <i className="bi bi-play-circle"></i>
                    <p>Video not available</p>
                    <small>This recipe does not have a valid video yet</small>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* View More button - only show if longform video is valid */}
          {isLongformValid && (
            <div className="video-navigation">
              <button 
                className="view-more-btn"
                onClick={() => window.open(recipe.longform_video_url, '_blank')}
              >
                <i className="bi bi-play-circle"></i>
                View More
              </button>
            </div>
          )}
        </div>

        <button 
          className="cultural-insight-btn"
          onClick={handleGetCulturalInsight}
          disabled={loadingInsight}
        >
          <i className={`bi ${loadingInsight ? 'bi-hourglass-split' : 'bi-lightbulb'}`}></i>
          {loadingInsight ? 'Generating Insight...' : 'Get Cultural Insight'}
        </button>
        
        {/* Cultural Insight Display */}
        {culturalInsight && (
          <div className="cultural-insight-display">
            <div className="insight-header">
              <i className="bi bi-book"></i>
              <h4>Cultural Insight</h4>
            </div>
            <div className="insight-content">
              <p>{culturalInsight}</p>
            </div>
          </div>
        )}
        
        {insightError && (
          <div className="cultural-insight-error">
            <i className="bi bi-exclamation-triangle"></i>
            <p>{insightError}</p>
          </div>
        )}
        </div>
    );
  };

  const renderAuthenticRecipe = () => (
    <div className="recipe-section">
      <div className="recipe-header">
        <h3>Authentic Recipe</h3>
        <div className="recipe-meta">
          <span>⏱️ {recipe.prepTime || '30 min'}</span>
          <span>🔥 {recipe.cookTime || '45 min'}</span>
          <span>👥 {recipe.servings || '4'} servings</span>
          <span>📊 {recipe.difficulty || 'Medium'}</span>
        </div>
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <h4>Ingredients</h4>
          <ul>
            {recipe.ingredients && recipe.ingredients.map((ingredient: string, index: number) => {
              const isSubstituted = substitutedIngredients[ingredient];
              const displayIngredient = isSubstituted || ingredient;
              const hasSub = hasSubstitution(ingredient);
              
              // Smart parsing function to separate ingredient name and quantity
              const parseIngredient = (ingredientText: string) => {
                // Handle " | " separator format
                if (ingredientText.includes(' | ')) {
                  const parts = ingredientText.split(' | ');
                  return {
                    name: parts[0]?.trim() || '',
                    quantity: parts[1]?.trim() || ''
                  };
                }
                
                // Handle patterns like "500g boneless chicken breast" or "2 tablespoons soy sauce"
                const measurementPattern = /^([\d\/\s\.]+(?:\s*(?:cup|tbsp|tsp|oz|g|kg|ml|l|pound|lb|slice|clove|bunch|handful|pinch|dash|teaspoon|tablespoon|ounce|gram|kilogram|milliliter|liter|pounds?|ounces?|grams?|kilograms?|milliliters?|liters?|cups?|tablespoons?|teaspoons?|slices?|cloves?|bunches?|handfuls?|pinches?|dashes?))?)\s*(.+)$/i;
                let match = ingredientText.match(measurementPattern);
                
                if (match && match[1]?.trim()) {
                  return {
                    quantity: match[1]?.trim() || '',
                    name: match[2]?.trim() || ingredientText
                  };
                }
                
                // Handle simple numbers at the beginning like "1 green bell pepper"
                const simpleNumberPattern = /^(\d+)\s+(.+)$/;
                match = ingredientText.match(simpleNumberPattern);
                
                if (match) {
                  return {
                    quantity: match[1]?.trim() || '',
                    name: match[2]?.trim() || ingredientText
                  };
                }
                
                // If no pattern found, return as is
                return {
                  name: ingredientText,
                  quantity: ''
                };
              };
              
              const { name, quantity } = parseIngredient(displayIngredient);
              
              return (
                <li key={index} className={isSubstituted ? 'substituted' : ''}>
                  <input type="checkbox" id={`ingredient-${index}`} />
                  <div className="ingredient-content">
                    <div className="ingredient-name-section">
                      <label htmlFor={`ingredient-${index}`} className="ingredient-name">{name}</label>
                      {hasSub && (
                        <button 
                          className="substitute-btn" 
                          title={isSubstituted ? "Revert to original" : "View substitution"}
                          onClick={() => handleIngredientSubstitution(ingredient)}
                        >
                          <i className={`bi ${isSubstituted ? 'bi-arrow-counterclockwise' : 'bi-arrow-repeat'}`}></i>
                        </button>
                      )}
                    </div>
                    {quantity && <span className="ingredient-quantity">{quantity}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="instructions-section">
          <h4>Instructions</h4>
          
          {/* Progress Timeline */}
          <div className="progress-timeline">
            <div className="timeline-header">
              <span className="progress-text">Step {currentStep} of {recipe.instructions?.length || 0}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / (recipe.instructions?.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="timeline-steps">
              {recipe.instructions && recipe.instructions.map((_: string, index: number) => (
                <div 
                  key={index}
                  className={`timeline-step ${currentStep > index + 1 ? 'completed' : currentStep === index + 1 ? 'current' : 'pending'}`}
                  onClick={() => handleStepClick(index + 1)}
                >
                  <div className="step-indicator">
                    {currentStep > index + 1 ? (
                      <i className="bi bi-check-circle-fill"></i>
                    ) : currentStep === index + 1 ? (
                      <i className="bi bi-circle-fill"></i>
                    ) : (
                      <i className="bi bi-circle"></i>
                    )}
                  </div>
                  <span className="step-number">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="current-step">
            <h5>Step {currentStep}</h5>
            <p>{recipe.instructions && recipe.instructions[currentStep - 1] || 'Step instructions will be displayed here.'}</p>
            
            {/* Fun Fact Section - Display if fun_facts array exists and has a fact for this step */}
            {recipe.fun_facts && 
             recipe.fun_facts[currentStep - 1] && (
              <div className="fun-fact-box">
                <div className="fun-fact-icon">
                  <i className="bi bi-info-circle"></i>
                </div>
                <div className="fun-fact-content">
                  <p>{recipe.fun_facts[currentStep - 1]}</p>
                </div>
              </div>
            )}

            {/* Congratulations Message - Show when user reaches the last step */}
            {currentStep === (recipe.instructions?.length || 1) && (
              <div className="congratulations-box">
                <div className="congratulations-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="congratulations-content">
                  <h4>🎉 Recipe Complete!</h4>
                  <p>Great job! You've successfully prepared <strong>{recipe.recipe_name || recipe.title}</strong>.</p>
                  <p>Enjoy your delicious {recipe.cuisine} dish!</p>
                </div>
              </div>
            )}

            <div className="step-navigation">
              <button 
                className="nav-btn prev-btn"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
              >
                ← Previous
            </button>
            <button 
                className="nav-btn next-btn"
              onClick={handleNextStep}
                disabled={currentStep === (recipe.instructions?.length || 1)}
            >
              Next →
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHealthConscious = () => {
    // Check if longform video URL is valid
    const isLongformValid = isValidVideoUrl(recipe.longform_video_url);
    const longformEmbedUrl = isLongformValid ? convertToEmbedUrl(recipe.longform_video_url) : '';
    
    // Sample ingredient substitutions (in a real app, these would come from the database)
    const ingredientSubstitutions = {
      'chicken breast': {
        vegetarian: 'tempeh or tofu',
        'low-sodium': 'low-sodium chicken breast',
        'gluten-free': 'gluten-free chicken breast'
      },
      'soy sauce': {
        vegetarian: 'tamari (gluten-free soy sauce)',
        'low-sodium': 'low-sodium soy sauce',
        'gluten-free': 'tamari or coconut aminos'
      },
      'flour': {
        vegetarian: 'flour (already vegetarian)',
        'low-sodium': 'flour (no sodium)',
        'gluten-free': 'almond flour or coconut flour'
      },
      'beef': {
        vegetarian: 'lentils or mushrooms',
        'low-sodium': 'lean beef',
        'gluten-free': 'gluten-free beef'
      },
      'pork': {
        vegetarian: 'jackfruit or seitan',
        'low-sodium': 'lean pork',
        'gluten-free': 'gluten-free pork'
      }
    };

    const getSubstitution = (ingredient: string, dietType: string) => {
      const lowerIngredient = ingredient.toLowerCase();
      for (const [key, substitutions] of Object.entries(ingredientSubstitutions)) {
        if (lowerIngredient.includes(key)) {
          return substitutions[dietType as keyof typeof substitutions] || ingredient;
        }
      }
      return ingredient; // Return original if no substitution found
    };
    
    return (
      <div className="health-section">
        <h3>Health-Conscious Options</h3>
        <p>Discover healthier alternatives and nutritional information for this recipe.</p>
        
        {/* Ingredient Substitutions Section */}
        <div className="ingredients-substitutions">
          <h4>Ingredient Substitutions</h4>
          <p>See healthier alternatives for each ingredient below:</p>
          
          <div className="substitution-categories">
            {/* Vegetarian Substitutions */}
            {(() => {
              const vegetarianSubstitutions = recipe.ingredients?.filter((ingredient: string) => {
                const substitution = getSubstitution(ingredient, 'vegetarian');
                return substitution !== ingredient;
              }).map((ingredient: string, index: number) => ({
                original: ingredient,
                substitution: getSubstitution(ingredient, 'vegetarian')
              })) || [];

              return vegetarianSubstitutions.length > 0 ? (
                <div className="substitution-category vegetarian-category">
                  <div className="category-header">
                    <img 
                      src="https://img.icons8.com/?size=100&id=3380&format=png&color=000000" 
                      alt="Vegetarian" 
                      className="category-icon"
                    />
                    <h5>Vegetarian Alternatives</h5>
                  </div>
                  <div className="substitution-list">
                    {vegetarianSubstitutions.map((item: { original: string; substitution: string }, index: number) => (
                      <div key={`veg-${index}`} className="substitution-item has-substitution">
                        <div className="original-ingredient">
                          <span className="ingredient-label">Original:</span>
                          <span className="ingredient-text">{item.original}</span>
                        </div>
                        <div className="substitution-ingredient">
                          <span className="ingredient-label">Vegetarian:</span>
                          <span className="ingredient-text substitute">{item.substitution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Low-Sodium Substitutions */}
            {(() => {
              const lowSodiumSubstitutions = recipe.ingredients?.filter((ingredient: string) => {
                const substitution = getSubstitution(ingredient, 'low-sodium');
                return substitution !== ingredient;
              }).map((ingredient: string, index: number) => ({
                original: ingredient,
                substitution: getSubstitution(ingredient, 'low-sodium')
              })) || [];

              return lowSodiumSubstitutions.length > 0 ? (
                <div className="substitution-category low-sodium-category">
                  <div className="category-header">
                    <img 
                      src="https://img.icons8.com/?size=100&id=6820&format=png&color=000000" 
                      alt="Low Sodium" 
                      className="category-icon"
                    />
                    <h5>Low-Sodium Alternatives</h5>
                  </div>
                  <div className="substitution-list">
                    {lowSodiumSubstitutions.map((item: { original: string; substitution: string }, index: number) => (
                      <div key={`low-sodium-${index}`} className="substitution-item has-substitution">
                        <div className="original-ingredient">
                          <span className="ingredient-label">Original:</span>
                          <span className="ingredient-text">{item.original}</span>
                        </div>
                        <div className="substitution-ingredient">
                          <span className="ingredient-label">Low-Sodium:</span>
                          <span className="ingredient-text substitute">{item.substitution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Gluten-Free Substitutions */}
            {(() => {
              const glutenFreeSubstitutions = recipe.ingredients?.filter((ingredient: string) => {
                const substitution = getSubstitution(ingredient, 'gluten-free');
                return substitution !== ingredient;
              }).map((ingredient: string, index: number) => ({
                original: ingredient,
                substitution: getSubstitution(ingredient, 'gluten-free')
              })) || [];

              return glutenFreeSubstitutions.length > 0 ? (
                <div className="substitution-category gluten-free-category">
                  <div className="category-header">
                    <img 
                      src="https://img.icons8.com/?size=100&id=6758&format=png&color=000000" 
                      alt="Gluten Free" 
                      className="category-icon"
                    />
                    <h5>Gluten-Free Alternatives</h5>
                  </div>
                  <div className="substitution-list">
                    {glutenFreeSubstitutions.map((item: { original: string; substitution: string }, index: number) => (
                      <div key={`gluten-free-${index}`} className="substitution-item has-substitution">
                        <div className="original-ingredient">
                          <span className="ingredient-label">Original:</span>
                          <span className="ingredient-text">{item.original}</span>
                        </div>
                        <div className="substitution-ingredient">
                          <span className="ingredient-label">Gluten-Free:</span>
                          <span className="ingredient-text substitute">{item.substitution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* No Substitutions Available Message */}
            {(() => {
              const hasAnySubstitutions = 
                (recipe.ingredients?.filter((ingredient: string) => {
                  const vegSub = getSubstitution(ingredient, 'vegetarian');
                  const lowSodSub = getSubstitution(ingredient, 'low-sodium');
                  const glutenSub = getSubstitution(ingredient, 'gluten-free');
                  return vegSub !== ingredient || lowSodSub !== ingredient || glutenSub !== ingredient;
                }).length || 0) > 0;

              return !hasAnySubstitutions ? (
                <div className="no-substitutions-message">
                  <i className="bi bi-check-circle"></i>
                  <h5>Great News!</h5>
                  <p>This recipe is already quite healthy and doesn't require major ingredient substitutions. All ingredients are suitable for most dietary preferences.</p>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderCulturalMusic = () => (
    <div className="music-section">
      <CulturalMusic recipe={recipe} />
    </div>
  );

  const renderContent = () => {
    switch (activeFilter) {
      case 'Authentic Recipe':
        return renderAuthenticRecipe();
      case 'Cultural Story':
        return renderCulturalStory();
      case 'Health-Conscious':
        return renderHealthConscious();
      case 'Cultural Music':
        return renderCulturalMusic();
      default:
        return renderAuthenticRecipe();
    }
  };

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-container">
        {/* Header */}
        <div className="recipe-detail-header">
          <button className="back-button" onClick={handleBackToHome}>
            ← Back to Recipes
          </button>
          <h1 className="recipe-detail-title">{recipe.title || recipe.recipe_name}</h1>
          <p className="recipe-detail-subtitle">
            {recipe.subtitle || `A delicious ${recipe.cuisine} dish`}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          {['Authentic Recipe', 'Cultural Story', 'Health-Conscious', 'Cultural Music'].map(filter => (
          <button 
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterClick(filter)}
          >
              {filter === 'Cultural Music' && <i className="bi bi-music-note"></i>}
              {filter}
          </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage; 