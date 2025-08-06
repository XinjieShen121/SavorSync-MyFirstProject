// Helper functions to calculate recipe metrics from MongoDB data

export const getEstimatedCookTime = (recipe: any): string => {
  const instructionCount = recipe.instructions?.length || 0;
  const ingredientCount = recipe.ingredients?.length || 0;
  
  // Base time: 15 minutes + 2 minutes per instruction + 1 minute per ingredient
  const totalMinutes = 15 + (instructionCount * 2) + ingredientCount;
  
  if (totalMinutes < 30) return '20-30 min';
  if (totalMinutes < 60) return '30-45 min';
  if (totalMinutes < 90) return '45-60 min';
  return '60+ min';
};



export const getEstimatedServings = (recipe: any): string => {
  // Check ingredients for serving indicators
  if (recipe.ingredients) {
    for (const ingredient of recipe.ingredients) {
      const lowerIngredient = ingredient.toLowerCase();
      if (lowerIngredient.includes('4 servings') || lowerIngredient.includes('4 people')) return '4 servings';
      if (lowerIngredient.includes('6 servings') || lowerIngredient.includes('6 people')) return '6 servings';
      if (lowerIngredient.includes('2 servings') || lowerIngredient.includes('2 people')) return '2 servings';
    }
  }
  
  // Default based on cuisine type
  const cuisineServings: { [key: string]: string } = {
    'Italian': '4 servings',
    'Indian': '4-6 servings',
    'Chinese': '4 servings',
    'Mexican': '4 servings',
    'Japanese': '2-4 servings',
    'French': '4 servings',
    'Thai': '4 servings',
    'Greek': '4 servings',
    'Spanish': '4 servings',
    'Korean': '4 servings',
    'Lebanese': '4 servings',
    'Vietnamese': '4 servings'
  };
  
  return cuisineServings[recipe.cuisine] || '4 servings';
};

export const getComplexityLevel = (recipe: any): string => {
  // Use spice level if available
  if (recipe.spiceLevel && recipe.spiceLevel !== 'Medium') {
    return recipe.spiceLevel;
  }
  
  // Calculate complexity based on instruction and ingredient count
  const instructionCount = recipe.instructions?.length || 0;
  const ingredientCount = recipe.ingredients?.length || 0;
  
  const complexity = instructionCount + ingredientCount;
  
  if (complexity < 15) return 'Easy';
  if (complexity < 20) return 'Medium';
  return 'Hard';
}; 