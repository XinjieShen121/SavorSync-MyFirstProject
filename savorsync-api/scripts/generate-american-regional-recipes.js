require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.RECIPE_MONGODB_URI);
    console.log('✅ Connected to MongoDB for American regional recipe generation');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Regional American Recipes
const regionalAmericanRecipes = [
  // SOUTHERN RECIPES
  {
    recipe_name: "Classic Southern Fried Chicken",
    cuisine: "American",
    region: "Southern",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "4 hours",
    cook_time: "20 minutes",
    servings: 6,
    difficulty: "Medium",
    fun_facts: [
      "Southern fried chicken was perfected by enslaved African Americans who combined West African cooking techniques with available ingredients.",
      "The secret to perfect Southern fried chicken is the buttermilk marinade and seasoned flour coating.",
      "Colonel Sanders' famous KFC recipe was inspired by traditional Southern fried chicken methods."
    ],
    ingredients: [
      "1 whole chicken, cut into pieces",
      "2 cups buttermilk",
      "2 cups all-purpose flour",
      "1 tablespoon paprika",
      "1 tablespoon garlic powder",
      "1 tablespoon onion powder",
      "1 teaspoon cayenne pepper",
      "2 teaspoons salt",
      "1 teaspoon black pepper",
      "Vegetable oil for frying"
    ],
    instructions: [
      "Marinate chicken pieces in buttermilk for at least 4 hours or overnight",
      "Mix flour with all spices in a large bowl",
      "Remove chicken from buttermilk, letting excess drip off",
      "Dredge each piece thoroughly in seasoned flour",
      "Heat oil to 350°F in a large cast iron skillet",
      "Fry chicken pieces skin-side down for 7-8 minutes",
      "Flip and fry another 7-8 minutes until golden brown and internal temp reaches 165°F",
      "Drain on paper towels and serve hot"
    ],
    tags: ["american", "southern", "fried chicken", "comfort food", "traditional"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Medium"
  },

  {
    recipe_name: "Southern Shrimp and Grits",
    cuisine: "American", 
    region: "Southern",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "15 minutes",
    cook_time: "25 minutes", 
    servings: 4,
    difficulty: "Medium",
    fun_facts: [
      "Shrimp and grits originated in the South Carolina Lowcountry as a fisherman's breakfast.",
      "Grits are made from ground hominy corn, a staple crop of Native Americans.",
      "This dish gained national popularity in the 1980s when Southern chefs elevated it to fine dining."
    ],
    ingredients: [
      "1 cup stone-ground grits",
      "4 cups water",
      "1 cup heavy cream",
      "4 tablespoons butter",
      "1 cup sharp cheddar cheese, grated",
      "1 pound large shrimp, peeled and deveined",
      "6 slices bacon, chopped",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "Salt and pepper to taste",
      "2 green onions, chopped"
    ],
    instructions: [
      "Bring water to boil, slowly whisk in grits",
      "Reduce heat and simmer 20 minutes, stirring frequently",
      "Stir in cream, butter, and cheese; season with salt and pepper",
      "Cook bacon in large skillet until crispy, remove and set aside",
      "Sauté onion in bacon fat until soft, add garlic",
      "Add shrimp, cook 2-3 minutes per side until pink",
      "Return bacon to pan, toss with shrimp",
      "Serve shrimp over creamy grits, garnish with green onions"
    ],
    tags: ["american", "southern", "shrimp", "grits", "seafood"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild"
  },

  // TEX-MEX RECIPES
  {
    recipe_name: "Authentic Tex-Mex Beef Fajitas",
    cuisine: "American",
    region: "Tex-Mex", 
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "30 minutes",
    cook_time: "15 minutes",
    servings: 4,
    difficulty: "Easy",
    fun_facts: [
      "Fajitas originated in the Rio Grande Valley of Texas in the 1930s as a way to use less expensive cuts of beef.",
      "The word 'fajita' comes from 'faja' meaning belt or strip, referring to the skirt steak cut.",
      "Fajitas were popularized nationwide in the 1980s by Tex-Mex restaurant chains."
    ],
    ingredients: [
      "2 pounds skirt steak",
      "2 bell peppers, sliced",
      "2 onions, sliced", 
      "3 tablespoons lime juice",
      "3 tablespoons olive oil",
      "2 teaspoons chili powder",
      "1 teaspoon cumin",
      "1 teaspoon paprika",
      "1/2 teaspoon garlic powder",
      "8 flour tortillas",
      "Guacamole, salsa, sour cream for serving"
    ],
    instructions: [
      "Marinate steak in lime juice, oil, and spices for 30 minutes",
      "Heat cast iron skillet or grill pan over high heat",
      "Cook steak 3-4 minutes per side for medium-rare",
      "Remove steak and let rest 5 minutes, then slice against grain",
      "In same pan, sauté peppers and onions until softened",
      "Warm tortillas in dry skillet or microwave",
      "Serve sliced steak with vegetables in warm tortillas",
      "Top with guacamole, salsa, and sour cream"
    ],
    tags: ["american", "tex-mex", "beef", "fajitas", "grilled"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Medium"
  },

  {
    recipe_name: "Texas-Style Beef Chili",
    cuisine: "American",
    region: "Tex-Mex",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "20 minutes",
    cook_time: "2 hours",
    servings: 8,
    difficulty: "Medium",
    fun_facts: [
      "Texas chili contains no beans - it's all about the beef and chili peppers.",
      "The dish originated with Texas cowboys who needed hearty, portable meals on cattle drives.",
      "San Antonio chili queens made the dish famous in the late 1800s by selling it from outdoor stands."
    ],
    ingredients: [
      "3 pounds beef chuck, cut into cubes",
      "6 dried ancho chiles",
      "4 dried chipotle chiles", 
      "2 dried guajillo chiles",
      "4 cups beef broth",
      "1 onion, diced",
      "4 cloves garlic, minced",
      "2 tablespoons cumin",
      "1 tablespoon oregano",
      "2 tablespoons tomato paste",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Toast dried chiles in dry skillet until fragrant, about 2 minutes",
      "Soak chiles in hot broth for 20 minutes until softened", 
      "Blend soaked chiles with 1 cup soaking liquid until smooth",
      "Brown beef cubes in batches in heavy pot",
      "Sauté onion and garlic until soft",
      "Add chile puree, remaining broth, cumin, oregano, and tomato paste",
      "Bring to boil, then simmer covered 2 hours until beef is tender",
      "Season with salt and pepper, serve with cornbread"
    ],
    tags: ["american", "tex-mex", "chili", "beef", "spicy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Hot"
  },

  // CAJUN RECIPES
  {
    recipe_name: "Classic Cajun Jambalaya",
    cuisine: "American",
    region: "Cajun",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "20 minutes",
    cook_time: "45 minutes",
    servings: 6,
    difficulty: "Medium",
    fun_facts: [
      "Jambalaya is a Creole and Cajun dish influenced by Spanish paella, French cooking, and West African techniques.",
      "There are two main types: Creole (red) with tomatoes, and Cajun (brown) without tomatoes.",
      "The 'Holy Trinity' of Cajun cooking - onions, celery, and bell peppers - forms the base of jambalaya."
    ],
    ingredients: [
      "1 pound andouille sausage, sliced",
      "1 pound chicken thighs, diced",
      "1 pound shrimp, peeled",
      "2 cups long-grain white rice",
      "4 cups chicken stock",
      "1 onion, diced",
      "2 celery stalks, diced",
      "1 bell pepper, diced",
      "3 cloves garlic, minced",
      "2 bay leaves",
      "1 teaspoon cajun seasoning",
      "1/2 teaspoon thyme",
      "Green onions for garnish"
    ],
    instructions: [
      "Brown sausage in large heavy pot, remove and set aside",
      "Brown chicken in sausage fat, remove and set aside",
      "Sauté onion, celery, and bell pepper in same pot until soft",
      "Add garlic, cook 1 minute more",
      "Add rice, stirring to coat with vegetables",
      "Pour in stock, add bay leaves, cajun seasoning, and thyme",
      "Bring to boil, add sausage and chicken back to pot",
      "Simmer covered 20 minutes, add shrimp last 5 minutes",
      "Let stand 5 minutes, garnish with green onions"
    ],
    tags: ["american", "cajun", "jambalaya", "rice", "seafood"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Medium"
  },

  {
    recipe_name: "Cajun Blackened Catfish",
    cuisine: "American",
    region: "Cajun",
    image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "10 minutes",
    cook_time: "8 minutes",
    servings: 4,
    difficulty: "Easy",
    fun_facts: [
      "Blackening was popularized by Chef Paul Prudhomme in the 1980s at his New Orleans restaurant.",
      "The technique involves coating fish in spices and cooking in a very hot cast iron skillet.",
      "Catfish is a staple in Southern and Cajun cooking, prized for its mild flavor and firm texture."
    ],
    ingredients: [
      "4 catfish fillets",
      "4 tablespoons butter, melted",
      "2 teaspoons paprika",
      "1 teaspoon garlic powder",
      "1 teaspoon onion powder",
      "1 teaspoon thyme",
      "1 teaspoon oregano",
      "1/2 teaspoon cayenne pepper",
      "1/2 teaspoon black pepper",
      "1/2 teaspoon white pepper",
      "1 teaspoon salt"
    ],
    instructions: [
      "Heat cast iron skillet over high heat until smoking",
      "Mix all spices together in a shallow dish",
      "Brush catfish fillets with melted butter on both sides",
      "Coat fish thoroughly with spice mixture",
      "Carefully place fish in hot skillet",
      "Cook 3-4 minutes until blackened and crispy",
      "Flip and cook another 3-4 minutes",
      "Serve immediately with lemon wedges and rice"
    ],
    tags: ["american", "cajun", "catfish", "blackened", "spicy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Hot"
  },

  // NEW ENGLAND RECIPES
  {
    recipe_name: "New England Clam Chowder",
    cuisine: "American",
    region: "New England",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "20 minutes",
    cook_time: "30 minutes",
    servings: 6,
    difficulty: "Medium",
    fun_facts: [
      "New England clam chowder dates back to the 1700s and was originally made by fishermen.",
      "The cream-based 'white' chowder distinguishes it from Manhattan's tomato-based 'red' version.",
      "Oyster crackers are the traditional accompaniment, first served with chowder in the 1840s."
    ],
    ingredients: [
      "4 slices thick-cut bacon, diced",
      "1 large onion, diced",
      "2 celery stalks, diced",
      "3 tablespoons flour",
      "4 cups clam juice",
      "2 pounds potatoes, diced",
      "2 cups heavy cream",
      "2 cans chopped clams with juice",
      "1 bay leaf",
      "1/2 teaspoon thyme",
      "Salt and white pepper to taste",
      "Oyster crackers for serving"
    ],
    instructions: [
      "Cook bacon in large pot until crispy, remove and set aside",
      "Sauté onion and celery in bacon fat until soft",
      "Sprinkle flour over vegetables, cook 2 minutes",
      "Gradually whisk in clam juice until smooth",
      "Add potatoes, bay leaf, and thyme",
      "Simmer 15 minutes until potatoes are tender",
      "Stir in cream and clams with their juice",
      "Heat through but don't boil, season with salt and pepper",
      "Serve hot with bacon bits and oyster crackers"
    ],
    tags: ["american", "new england", "chowder", "clams", "soup"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild"
  },

  {
    recipe_name: "Boston Baked Beans",
    cuisine: "American",
    region: "New England",
    image: "https://images.unsplash.com/photo-1544825977-073faf9e5be6?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1544825977-073faf9e5be6?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "8 hours",
    cook_time: "6 hours",
    servings: 8,
    difficulty: "Easy",
    fun_facts: [
      "Boston baked beans earned the city its nickname 'Beantown'.",
      "Puritan New Englanders prepared beans on Saturday to eat on Sunday when cooking was forbidden.",
      "Molasses was a key ingredient due to Boston's role in the colonial molasses trade."
    ],
    ingredients: [
      "2 cups navy beans, soaked overnight",
      "1/2 pound salt pork, diced",
      "1 onion, chopped",
      "1/3 cup molasses",
      "1/4 cup brown sugar",
      "2 tablespoons tomato paste",
      "1 tablespoon mustard powder",
      "1 teaspoon salt",
      "1/4 teaspoon black pepper",
      "Boiling water as needed"
    ],
    instructions: [
      "Preheat oven to 250°F",
      "Drain and rinse soaked beans",
      "Layer salt pork and onion in bottom of bean pot",
      "Add beans on top",
      "Mix molasses, brown sugar, tomato paste, mustard, salt, and pepper",
      "Pour mixture over beans, add boiling water to cover",
      "Cover and bake 6 hours, checking hourly and adding water as needed",
      "Uncover last hour to brown the top",
      "Serve hot with brown bread"
    ],
    tags: ["american", "new england", "beans", "baked", "traditional"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild"
  },

  // CALIFORNIA RECIPES
  {
    recipe_name: "California Avocado Toast",
    cuisine: "American",
    region: "California",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "10 minutes",
    cook_time: "5 minutes",
    servings: 2,
    difficulty: "Easy",
    fun_facts: [
      "California produces 95% of all avocados grown in the United States.",
      "Avocado toast became a millennial food trend but has roots in 1990s California health culture.",
      "The Hass avocado, most common variety, was first grown in California in the 1920s."
    ],
    ingredients: [
      "4 slices artisan sourdough bread",
      "2 ripe avocados",
      "1 lemon, juiced",
      "1/4 cup cherry tomatoes, halved", 
      "1/4 cup microgreens",
      "2 tablespoons extra virgin olive oil",
      "1/4 cup crumbled goat cheese",
      "1/4 red onion, thinly sliced",
      "Sea salt and cracked pepper",
      "Red pepper flakes (optional)"
    ],
    instructions: [
      "Toast bread slices until golden and crispy",
      "Mash avocados with lemon juice, salt, and pepper",
      "Spread avocado mixture generously on each toast",
      "Top with cherry tomatoes, microgreens, and red onion",
      "Drizzle with olive oil and sprinkle with goat cheese",
      "Season with additional salt, pepper, and red pepper flakes",
      "Serve immediately while toast is warm"
    ],
    tags: ["american", "california", "avocado", "healthy", "vegetarian"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild"
  },

  {
    recipe_name: "California Fish Tacos",
    cuisine: "American",
    region: "California",
    image: "https://images.unsplash.com/photo-1565299585323-38174c5b5e70?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1565299585323-38174c5b5e70?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "20 minutes",
    cook_time: "10 minutes",
    servings: 4,
    difficulty: "Easy",
    fun_facts: [
      "Fish tacos originated in Baja California and became popular in Southern California in the 1980s.",
      "The combination of fresh fish, cabbage slaw, and lime crema reflects California's fresh, healthy cuisine.",
      "Rubio's Coastal Grill helped popularize fish tacos across America starting in San Diego."
    ],
    ingredients: [
      "1 pound white fish fillets (mahi-mahi or cod)",
      "8 corn tortillas",
      "2 cups cabbage, shredded",
      "1/2 cup sour cream",
      "2 limes, juiced",
      "1/4 cup cilantro, chopped",
      "1 jalapeño, minced",
      "1 teaspoon cumin",
      "1 teaspoon chili powder",
      "1/2 teaspoon garlic powder",
      "Salt and pepper to taste",
      "Avocado slices for serving"
    ],
    instructions: [
      "Season fish with cumin, chili powder, garlic powder, salt, and pepper",
      "Grill or pan-sear fish 3-4 minutes per side until flaky",
      "Mix sour cream with half the lime juice, cilantro, and jalapeño",
      "Toss cabbage with remaining lime juice and salt",
      "Warm tortillas in dry skillet or microwave",
      "Flake fish into bite-sized pieces",
      "Fill tortillas with fish, cabbage slaw, and crema",
      "Top with avocado slices and extra cilantro"
    ],
    tags: ["american", "california", "fish", "tacos", "healthy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild"
  },

  // MIDWEST RECIPES
  {
    recipe_name: "Classic Midwest Hotdish",
    cuisine: "American",
    region: "Midwest",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "15 minutes",
    cook_time: "35 minutes",
    servings: 6,
    difficulty: "Easy",
    fun_facts: [
      "Hotdish is Minnesota's signature comfort food, distinct from casseroles by its one-dish nature.",
      "The basic formula is meat, vegetables, starch, and cream soup - all in one pan.",
      "Tater tot hotdish is the most famous variation, invented in the 1950s when tater tots were new."
    ],
    ingredients: [
      "1 pound ground beef",
      "1 onion, diced",
      "1 bag frozen mixed vegetables",
      "1 can cream of mushroom soup",
      "1 can cream of celery soup",
      "1/2 cup milk",
      "1 cup shredded cheddar cheese",
      "1 bag frozen tater tots",
      "Salt and pepper to taste",
      "1/2 teaspoon garlic powder"
    ],
    instructions: [
      "Preheat oven to 375°F",
      "Brown ground beef and onion in large skillet, drain fat",
      "Stir in frozen vegetables, both soups, milk, and seasonings",
      "Add half the cheese and mix well",
      "Transfer mixture to greased 9x13 baking dish",
      "Arrange tater tots in single layer on top",
      "Bake 25 minutes until tater tots are golden",
      "Sprinkle remaining cheese on top, bake 5 more minutes",
      "Let rest 5 minutes before serving"
    ],
    tags: ["american", "midwest", "hotdish", "casserole", "comfort food"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild"
  },

  {
    recipe_name: "Chicago Deep Dish Pizza",
    cuisine: "American",
    region: "Midwest",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
    shortform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    longform_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    prep_time: "2 hours",
    cook_time: "45 minutes",
    servings: 8,
    difficulty: "Hard",
    fun_facts: [
      "Chicago deep dish pizza was invented in 1943 at Pizzeria Uno by Ike Sewell.",
      "The pizza is built 'upside down' with cheese on bottom and sauce on top.",
      "A true deep dish pizza takes 30-45 minutes to bake due to its thickness."
    ],
    ingredients: [
      "3 cups all-purpose flour",
      "1/2 cup cornmeal",
      "1 packet active dry yeast",
      "1 teaspoon sugar",
      "1 teaspoon salt",
      "1/4 cup olive oil",
      "1 cup warm water",
      "2 cups mozzarella cheese, shredded",
      "1 pound Italian sausage, cooked and crumbled",
      "2 cups pizza sauce",
      "1/2 cup parmesan cheese",
      "2 tablespoons butter for pan"
    ],
    instructions: [
      "Dissolve yeast and sugar in warm water, let foam 5 minutes",
      "Mix flour, cornmeal, and salt in large bowl",
      "Add yeast mixture and olive oil, knead until smooth",
      "Let rise 1 hour until doubled",
      "Grease deep dish pizza pan with butter",
      "Roll dough and press into pan, forming high edges",
      "Layer mozzarella, then sausage in crust",
      "Top with pizza sauce and parmesan",
      "Bake at 425°F for 35-45 minutes until crust is golden",
      "Let cool 10 minutes before cutting"
    ],
    tags: ["american", "midwest", "chicago", "pizza", "deep dish"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild"
  }
];

// Function to add regional recipes to database
const addRegionalAmericanRecipes = async () => {
  try {
    console.log('🇺🇸 Starting to add regional American recipes to database...');
    
    // Check if these specific recipes already exist
    const existingCount = await Recipe.countDocuments({
      recipe_name: { $in: regionalAmericanRecipes.map(r => r.recipe_name) }
    });
    
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing recipes with same names. Skipping duplicates...`);
      
      // Only add recipes that don't exist
      const existingNames = await Recipe.find({
        recipe_name: { $in: regionalAmericanRecipes.map(r => r.recipe_name) }
      }).distinct('recipe_name');
      
      const newRecipes = regionalAmericanRecipes.filter(
        recipe => !existingNames.includes(recipe.recipe_name)
      );
      
      if (newRecipes.length === 0) {
        console.log('✅ All regional recipes already exist in database');
        return;
      }
      
      const addedRecipes = await Recipe.insertMany(newRecipes);
      console.log(`✅ Successfully added ${addedRecipes.length} new regional American recipes!`);
      
    } else {
      // Add all recipes
      const addedRecipes = await Recipe.insertMany(regionalAmericanRecipes);
      console.log(`✅ Successfully added ${addedRecipes.length} regional American recipes to database!`);
    }
    
    // Show breakdown by region
    console.log('\n📍 Regional breakdown:');
    const regions = ['Southern', 'Tex-Mex', 'Cajun', 'New England', 'California', 'Midwest'];
    
    for (const region of regions) {
      const count = await Recipe.countDocuments({ region: region });
      console.log(`   ${region}: ${count} recipes`);
    }

  } catch (error) {
    console.error('❌ Error adding regional American recipes:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await addRegionalAmericanRecipes();
  console.log('\n🎉 Regional American recipe generation complete!');
  console.log('💡 Your American Comfort section should now show recipes for all regions!');
  process.exit(0);
};

main(); 