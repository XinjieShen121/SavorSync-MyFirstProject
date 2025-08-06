import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
  FlashOn as FlashOnIcon,
  Explore as ExploreIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { getAllCuisines } from '../../services/apiRecipe';

interface QuickStartSelections {
  mood: string | null;
  cuisine: string | null;
  time: string | null;
}

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<QuickStartSelections>({
    mood: null,
    cuisine: null,
    time: null
  });
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuisine icons mapping
  const cuisineIcons: { [key: string]: string } = {
    'Italian': '🍝',
    'Asian': '🍜',
    'Mexican': '🌮',
    'Indian': '🍛',
    'French': '🥖',
    'Japanese': '🍱',
    'Korean': '🍲',
    'Thai': '🍜',
    'Chinese': '🥟',
    'Vietnamese': '🍜',
    'Greek': '🥙',
    'Spanish': '🥘',
    'Lebanese': '🥙'
  };

  // Mood options
  const moodOptions = [
    { value: 'comfort', label: 'Comfort Food', icon: <FavoriteIcon /> },
    { value: 'healthy', label: 'Healthy & Fresh', icon: <HomeIcon /> },
    { value: 'quick', label: 'Quick & Easy', icon: <FlashOnIcon /> },
    { value: 'adventure', label: 'Culinary Adventure', icon: <ExploreIcon /> }
  ];

  // Time options
  const timeOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour+' }
  ];

  // Fetch cuisines when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelections({
        mood: null,
        cuisine: null,
        time: null
      });
      fetchCuisines();
    }
  }, [isOpen]);

  const fetchCuisines = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCuisines();
      setCuisines(data);
    } catch (err: any) {
      console.error('Error fetching cuisines:', err);
      setError(err.message || 'Failed to load cuisines');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setSelections(prev => ({ ...prev, mood }));
  };

  const handleCuisineSelect = (cuisine: string) => {
    setSelections(prev => ({ ...prev, cuisine }));
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
          quickStartData: {
            mood: selections.mood,
            cuisine: selections.cuisine,
            time: selections.time
          }
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        pt: 3, 
        pb: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        <Typography variant="h4" sx={{ 
          background: 'linear-gradient(135deg, #FF6B35, #f7931e)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          textAlign: 'center',
          mb: 2
        }}>
          Let's Start Cooking!
        </Typography>
        
        {/* Short orange line below the title */}
        <Box sx={{
          width: '60px',
          height: '3px',
          background: 'linear-gradient(135deg, #FF6B35, #f7931e)',
          borderRadius: '2px',
          mb: 2
        }} />
        
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {/* Cooking Mood Section */}
            <Box mb={3}>
              <Typography variant="h6" textAlign="center" mb={2}>
                What's your cooking mood today?
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={selections.mood === mood.value ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{
                      height: 90,
                      flexDirection: 'column',
                      gap: 1,
                      py: 2
                    }}
                    onClick={() => handleMoodSelect(mood.value)}
                  >
                    {mood.icon}
                    <Typography variant="body2" fontWeight={600}>
                      {mood.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Cuisine Selection Section */}
            <Box mb={3}>
              <Typography variant="h6" textAlign="center" mb={2}>
                Which cuisine interests you?
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selections.cuisine || ''}
                  onChange={(e) => handleCuisineSelect(e.target.value)}
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) {
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <RestaurantIcon sx={{ color: 'text.secondary' }} />
                          <Typography sx={{ color: 'text.secondary' }}>
                            Which cuisine do you like?
                          </Typography>
                        </Box>
                      );
                    }
                    return (
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {cuisineIcons[value] || '🍽️'}
                        </span>
                        {value}
                      </Box>
                    );
                  }}
                >
                  {cuisines.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {cuisineIcons[cuisine] || '🍽️'}
                        </span>
                        {cuisine}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Time Selection Section */}
            <Box mb={3}>
              <Typography variant="h6" textAlign="center" mb={2}>
                How much time do you have?
              </Typography>
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2}>
                {timeOptions.map((time) => (
                  <Button
                    key={time.value}
                    variant={selections.time === time.value ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{
                      height: 90,
                      flexDirection: 'column',
                      gap: 1,
                      py: 2
                    }}
                    onClick={() => handleTimeSelect(time.value)}
                  >
                    <AccessTimeIcon />
                    <Typography variant="body2" fontWeight={600}>
                      {time.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Find Recipes Button */}
            <Box textAlign="center">
              <Button
                variant="contained"
                size="large"
                onClick={handleFindRecipes}
                disabled={!selections.cuisine}
                startIcon={<SearchIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  minWidth: 200
                }}
              >
                Find Recipes
              </Button>
            </Box>

            {/* Selection Summary */}
            {(selections.mood || selections.cuisine || selections.time) && (
              <Box 
                mt={2} 
                p={2} 
                sx={{ 
                  bgcolor: 'primary.light', 
                  borderRadius: 2, 
                  opacity: 0.1 
                }}
              >
                <Typography variant="body2" color="primary.contrastText">
                  {selections.mood && `Mood: ${moodOptions.find(m => m.value === selections.mood)?.label}`}
                  {selections.cuisine && ` • Cuisine: ${selections.cuisine}`}
                  {selections.time && ` • Time: ${timeOptions.find(t => t.value === selections.time)?.label}`}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickStartModal; 