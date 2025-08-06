const OpenAI = require('openai');

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate cultural cooking insights for a recipe
 * @param {Object} recipe - Recipe object with name, cuisine, ingredients, etc.
 * @returns {Promise<string>} - Cultural insight text
 */
const generateCulturalInsight = async (recipe) => {
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      console.log('⚠️ OpenAI API key not configured, using fallback insights');
      return getFallbackInsight(recipe);
    }

    const prompt = `You are a cultural food expert and cooking historian. Please provide interesting cultural insights about this recipe:

Recipe Name: ${recipe.recipe_name || recipe.title}
Cuisine: ${recipe.cuisine}
Ingredients: ${recipe.ingredients ? recipe.ingredients.join(', ') : 'Not specified'}

Please provide:
1. Historical background and cultural significance
2. Traditional cooking techniques or customs
3. Regional variations or family traditions
4. Interesting cultural facts about the ingredients
5. How this dish connects people to their heritage

Keep the response engaging, informative, and about 200-300 words. Make it feel like a knowledgeable friend sharing fascinating food culture stories.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a passionate food historian and cultural expert who loves sharing fascinating stories about food traditions around the world. Your responses are warm, engaging, and educational."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Provide fallback cultural insights based on cuisine
    return getFallbackInsight(recipe);
  }
};

/**
 * Fallback cultural insights when OpenAI is unavailable
 * @param {Object} recipe - Recipe object
 * @returns {string} - Fallback cultural insight
 */
const getFallbackInsight = (recipe) => {
  const cuisine = recipe.cuisine?.toLowerCase();
  const recipeName = recipe.recipe_name || recipe.title;
  
  const fallbackInsights = {
    'italian': `${recipeName} represents the heart of Italian cooking philosophy - using simple, high-quality ingredients to create something extraordinary. Italian cuisine emphasizes the importance of family gatherings around the dinner table, where recipes are passed down through generations. Each region of Italy has its own unique interpretation of classic dishes, reflecting local ingredients and traditions that have been perfected over centuries.`,
    
    'chinese': `${recipeName} is rooted in thousands of years of Chinese culinary tradition, where cooking is considered both an art and a way to maintain harmony and balance. Chinese cuisine follows the principles of balancing flavors (sweet, sour, bitter, spicy, and salty) and textures. Food is deeply connected to Chinese culture, representing prosperity, luck, and family unity during celebrations and daily meals.`,
    
    'indian': `${recipeName} showcases the incredible diversity of Indian cuisine, where spices are not just flavor enhancers but are believed to have medicinal properties. Indian cooking is deeply spiritual, with many dishes having religious significance and being prepared during festivals and ceremonies. The art of spice blending varies from region to region, with recipes often being closely guarded family secrets.`,
    
    'japanese': `${recipeName} embodies the Japanese philosophy of "washoku" - the harmonious relationship between nature, ingredients, and presentation. Japanese cuisine emphasizes seasonal ingredients, minimalism, and the natural flavors of food. Every meal is an artistic expression that reflects the beauty of the changing seasons and the Japanese respect for nature.`,
    
    'mexican': `${recipeName} represents the rich fusion of indigenous Mesoamerican and Spanish colonial influences that define Mexican cuisine. Mexican food is deeply connected to ancient traditions, with many ingredients like corn, beans, and chili peppers being sacred to pre-Hispanic cultures. Food is central to Mexican celebrations and family gatherings, representing love, community, and cultural identity.`,
    
    'french': `${recipeName} exemplifies the French dedication to culinary excellence and the "art de vivre" (art of living). French cuisine has influenced cooking worldwide through its precise techniques and emphasis on quality ingredients. Food in France is a cultural institution, with long, leisurely meals being an essential part of social life and family bonding.`,
    
    'thai': `${recipeName} reflects the Thai principle of balancing the four fundamental flavors: sweet, sour, salty, and spicy. Thai cuisine is heavily influenced by Buddhist philosophy, emphasizing fresh ingredients and harmonious cooking. Food plays a central role in Thai hospitality and community life, with sharing meals being an expression of care and friendship.`,
    
    'american': `${recipeName} represents the melting pot nature of American cuisine, which combines influences from immigrants around the world with indigenous ingredients and techniques. American food culture emphasizes comfort, abundance, and innovation, often adapting traditional recipes to local tastes and available ingredients. Regional American cuisines tell the story of the nation's diverse cultural heritage.`,
    
    'mediterranean': `${recipeName} embodies the Mediterranean lifestyle that celebrates fresh, seasonal ingredients and the social aspect of dining. Mediterranean cuisine is built around olive oil, fresh vegetables, seafood, and herbs, reflecting the region's climate and agricultural traditions. Meals are meant to be shared slowly with family and friends, emphasizing the importance of community and conversation.`
  };
  
  return fallbackInsights[cuisine] || `${recipeName} represents a wonderful example of ${recipe.cuisine} cuisine, which has its own unique cultural traditions and cooking techniques that have been passed down through generations. Food is a universal language that connects us to our heritage and brings people together around the table to share stories, traditions, and create lasting memories.`;
};

module.exports = {
  generateCulturalInsight
}; 