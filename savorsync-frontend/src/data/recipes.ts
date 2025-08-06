import { Recipe, Cuisine } from '../types';

export const recipes: Recipe[] = [
  {
    id: 'ramen-noodle-soup',
    title: 'Ramen Noodle Soup',
    subtitle: 'A soul-warming Japanese noodle soup.',
    cuisine: 'Japanese',
    region: 'Asian',
    image: '/api/placeholder/600/400',
    videoUrl: 'https://www.youtube.com/embed/example',
    videoTitle: 'History of Ramen #short',
    culturalBackground: 'Ramen originated from Chinese noodles but has become a Japanese cultural icon. Each region in Japan has its own unique ramen style.',
    ingredients: [
      '4 cups chicken broth',
      '2 packages ramen noodles',
      '2 tablespoons soy sauce',
      '1 tablespoon miso paste',
      '2 cloves garlic, minced',
      '1 inch ginger, grated',
      '2 green onions, sliced',
      '1 soft-boiled egg',
      '2 slices chashu pork',
      'Nori sheets',
      'Bamboo shoots',
      'Corn kernels'
    ],
    instructions: [
      'Bring chicken broth to a boil in a large pot',
      'Add soy sauce, miso paste, garlic, and ginger',
      'Cook ramen noodles according to package instructions',
      'Divide noodles between two bowls',
      'Ladle hot broth over noodles',
      'Top with green onions, egg, pork, nori, bamboo shoots, and corn',
      'Serve immediately while hot'
    ],
    prepTime: '15 minutes',
    cookTime: '20 minutes',
    servings: 2,
    difficulty: 'Medium',
    tags: ['soup', 'noodles', 'japanese', 'comfort food']
  },
  {
    id: 'pad-thai',
    title: 'Pad Thai',
    subtitle: 'Classic Thai stir-fried rice noodles.',
    cuisine: 'Thai',
    region: 'Asian',
    image: '/api/placeholder/600/400',
    culturalBackground: 'Pad Thai is Thailand\'s national dish, created in the 1930s to promote rice noodles and reduce rice consumption.',
    ingredients: [
      '8 oz rice noodles',
      '2 tablespoons vegetable oil',
      '2 cloves garlic, minced',
      '2 eggs, beaten',
      '1/2 cup tofu, cubed',
      '2 tablespoons fish sauce',
      '2 tablespoons tamarind paste',
      '1 tablespoon palm sugar',
      '1/2 cup bean sprouts',
      '2 green onions, sliced',
      '1/4 cup peanuts, crushed',
      'Lime wedges for serving'
    ],
    instructions: [
      'Soak rice noodles in warm water for 30 minutes',
      'Heat oil in a wok over high heat',
      'Add garlic and stir-fry until fragrant',
      'Push ingredients aside and scramble eggs',
      'Add tofu and stir-fry briefly',
      'Add drained noodles and sauce ingredients',
      'Toss until noodles are coated and heated through',
      'Add bean sprouts and green onions',
      'Garnish with peanuts and serve with lime'
    ],
    prepTime: '30 minutes',
    cookTime: '10 minutes',
    servings: 4,
    difficulty: 'Medium',
    tags: ['thai', 'noodles', 'stir-fry', 'vegetarian option']
  },
  {
    id: 'paella',
    title: 'Spanish Paella',
    subtitle: 'Traditional rice dish from Valencia.',
    cuisine: 'Spanish',
    region: 'Mediterranean',
    image: '/api/placeholder/600/400',
    culturalBackground: 'Paella originated in Valencia, Spain, where farmers would cook rice with whatever ingredients were available in the fields.',
    ingredients: [
      '2 cups short-grain rice',
      '4 cups chicken stock',
      '1/2 cup olive oil',
      '1 onion, diced',
      '4 cloves garlic, minced',
      '1 red bell pepper, sliced',
      '1/2 cup green beans',
      '1/2 cup peas',
      '1/2 teaspoon saffron threads',
      '1 pound chicken thighs',
      '1/2 pound shrimp',
      '1/2 pound mussels',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Heat olive oil in a paella pan over medium heat',
      'Season and brown chicken thighs, remove and set aside',
      'Sauté onion, garlic, and bell pepper until softened',
      'Add rice and stir to coat with oil',
      'Add saffron and hot stock, bring to a boil',
      'Arrange chicken, shrimp, and mussels on top',
      'Reduce heat and simmer without stirring for 20 minutes',
      'Add green beans and peas in the last 5 minutes',
      'Let rest for 5 minutes before serving'
    ],
    prepTime: '20 minutes',
    cookTime: '30 minutes',
    servings: 6,
    difficulty: 'Hard',
    tags: ['spanish', 'rice', 'seafood', 'mediterranean']
  },
  {
    id: 'tacos-al-pastor',
    title: 'Tacos al Pastor',
    subtitle: 'Mexican pork tacos with pineapple.',
    cuisine: 'Mexican',
    region: 'Latin',
    image: '/api/placeholder/600/400',
    culturalBackground: 'Tacos al Pastor were inspired by Lebanese shawarma, brought to Mexico by Lebanese immigrants in the early 1900s.',
    ingredients: [
      '2 pounds pork shoulder, thinly sliced',
      '1/2 cup achiote paste',
      '1/4 cup white vinegar',
      '1/4 cup orange juice',
      '2 cloves garlic, minced',
      '1 teaspoon oregano',
      '1 teaspoon cumin',
      '1 pineapple, sliced',
      'Corn tortillas',
      '1 onion, diced',
      '1/2 cup cilantro, chopped',
      'Lime wedges',
      'Salsa verde'
    ],
    instructions: [
      'Mix achiote paste, vinegar, orange juice, garlic, and spices',
      'Marinate pork slices in the mixture for 2 hours',
      'Stack pork slices on a vertical spit or skewer',
      'Grill or roast until cooked through and slightly charred',
      'Warm tortillas on a griddle',
      'Slice pork thinly and serve on tortillas',
      'Top with diced onion, cilantro, and pineapple',
      'Serve with lime wedges and salsa'
    ],
    prepTime: '2 hours 30 minutes',
    cookTime: '20 minutes',
    servings: 8,
    difficulty: 'Medium',
    tags: ['mexican', 'pork', 'tacos', 'grilled']
  },
  {
    id: 'mac-and-cheese',
    title: 'Classic Mac and Cheese',
    subtitle: 'American comfort food at its finest.',
    cuisine: 'American',
    region: 'American',
    image: '/api/placeholder/600/400',
    culturalBackground: 'Mac and cheese became popular in America during the Great Depression as an affordable, filling meal that could feed a family.',
    ingredients: [
      '1 pound elbow macaroni',
      '4 tablespoons butter',
      '1/4 cup all-purpose flour',
      '2 cups milk',
      '2 cups shredded cheddar cheese',
      '1/2 cup shredded mozzarella',
      '1/4 cup grated parmesan',
      '1/2 teaspoon salt',
      '1/4 teaspoon black pepper',
      '1/4 teaspoon garlic powder',
      '1/2 cup breadcrumbs (optional)',
      '2 tablespoons butter for topping'
    ],
    instructions: [
      'Cook macaroni according to package directions',
      'Melt butter in a large saucepan over medium heat',
      'Whisk in flour and cook for 1 minute',
      'Gradually whisk in milk and cook until thickened',
      'Reduce heat and stir in cheeses until melted',
      'Season with salt, pepper, and garlic powder',
      'Stir in cooked macaroni',
      'Transfer to a baking dish',
      'Top with breadcrumbs and dot with butter',
      'Bake at 350°F for 20 minutes until bubbly'
    ],
    prepTime: '15 minutes',
    cookTime: '25 minutes',
    servings: 6,
    difficulty: 'Easy',
    tags: ['american', 'pasta', 'cheese', 'comfort food']
  }
];

export const cuisines: Cuisine[] = [
  {
    id: 'asian',
    name: 'Asian Heritage',
    region: 'Asian',
    image: '/api/placeholder/400/300',
    description: 'Explore the rich culinary traditions of Asia, from Japanese ramen to Thai curries.',
    recipes: recipes.filter(recipe => recipe.region === 'Asian')
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Classics',
    region: 'Mediterranean',
    image: '/api/placeholder/400/300',
    description: 'Discover the healthy and flavorful dishes of the Mediterranean region.',
    recipes: recipes.filter(recipe => recipe.region === 'Mediterranean')
  },
  {
    id: 'latin',
    name: 'Latin Flavors',
    region: 'Latin',
    image: '/api/placeholder/400/300',
    description: 'Experience the vibrant and spicy flavors of Latin American cuisine.',
    recipes: recipes.filter(recipe => recipe.region === 'Latin')
  },
  {
    id: 'american',
    name: 'American Comfort',
    region: 'American',
    image: '/api/placeholder/400/300',
    description: 'Classic American comfort food that warms the soul.',
    recipes: recipes.filter(recipe => recipe.region === 'American')
  }
];

export const getRecipeById = (id: string): Recipe | undefined => {
  return recipes.find(recipe => recipe.id === id);
};

export const getCuisineById = (id: string): Cuisine | undefined => {
  return cuisines.find(cuisine => cuisine.id === id);
}; 