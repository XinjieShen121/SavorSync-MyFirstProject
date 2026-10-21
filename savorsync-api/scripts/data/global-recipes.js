// Starter recipes for a fresh recipe database, one per cuisine in the Recipe model.
// Images are left out on purpose: add image_url values once you have photos you own or may use.
const globalRecipes = [
  {
    recipe_name: "Spaghetti Carbonara",
    subtitle: "Rome's silky pasta of egg, cheese and crisp pork",
    cuisine: "Italian",
    region: "Mediterranean",
    prep_time: "10 minutes",
    cook_time: "15 minutes",
    servings: 4,
    difficulty: "Medium",
    spiceLevel: "Mild",
    culturalBackground: "Carbonara is a Roman dish. Its exact origin is debated, but it first appears in print in the years after World War II, and Romans still insist on guanciale, Pecorino Romano and no cream.",
    fun_facts: [
      "Traditional carbonara never uses cream; the sauce comes from eggs, cheese and starchy pasta water.",
      "Guanciale is cured pork cheek, richer and more delicate than bacon.",
      "April 6 is celebrated online as Carbonara Day."
    ],
    ingredients: [
      "400 g spaghetti",
      "150 g guanciale or pancetta, cut into strips",
      "4 large egg yolks plus 1 whole egg",
      "60 g Pecorino Romano, finely grated",
      "Freshly ground black pepper",
      "Salt for the pasta water"
    ],
    instructions: [
      "Bring a large pot of salted water to a boil and cook the spaghetti until just al dente.",
      "Meanwhile, cook the guanciale in a dry pan over medium heat until golden and crisp. Turn off the heat.",
      "Whisk the yolks, whole egg, most of the Pecorino and plenty of black pepper in a bowl.",
      "Reserve a cup of pasta water, then drain the spaghetti and add it to the pan with the guanciale.",
      "Off the heat, pour in the egg mixture and toss quickly, adding splashes of pasta water until the sauce turns creamy.",
      "Serve at once with the remaining Pecorino and more pepper."
    ],
    tags: ["pasta", "italian", "roman", "quick"],
    substitutions: [
      { original: "guanciale", substitute: "smoked mushrooms or sun-dried tomatoes", reason: "Keeps a savory, smoky bite for a vegetarian version" },
      { original: "spaghetti", substitute: "gluten-free spaghetti", reason: "Works the same way; reserve extra pasta water as it can be starchier" }
    ],
    cookingTips: ["Take the pan off the heat before adding the eggs so they turn creamy instead of scrambling."],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    recipe_name: "Chana Masala",
    subtitle: "Punjabi chickpeas simmered in a tangy, spiced tomato gravy",
    cuisine: "Indian",
    region: "Asian",
    prep_time: "15 minutes",
    cook_time: "35 minutes",
    servings: 4,
    difficulty: "Easy",
    spiceLevel: "Medium",
    culturalBackground: "Chana masala comes from Punjab in northern India, where it is often paired with fried bhature bread. It is a staple of home kitchens, roadside dhabas and festival meals alike.",
    fun_facts: [
      "Amchur (dried green mango powder) gives the dish its gentle sourness.",
      "Chole bhature, chickpeas with puffy fried bread, is a classic Delhi breakfast.",
      "India grows the majority of the world's chickpeas."
    ],
    ingredients: [
      "2 cans (400 g each) chickpeas, drained",
      "2 tablespoons oil or ghee",
      "1 teaspoon cumin seeds",
      "1 large onion, finely chopped",
      "1 tablespoon grated ginger",
      "3 cloves garlic, minced",
      "1 green chili, slit",
      "2 tomatoes, pureed",
      "2 teaspoons chana masala or garam masala",
      "1 teaspoon ground coriander",
      "1/2 teaspoon turmeric",
      "1 teaspoon amchur or 1 tablespoon lemon juice",
      "Salt to taste",
      "Fresh cilantro to garnish"
    ],
    instructions: [
      "Heat the oil in a deep pan and add the cumin seeds until they sizzle.",
      "Add the onion and cook until deep golden, about 10 minutes.",
      "Stir in the ginger, garlic and chili and cook for 1 minute.",
      "Add the tomato puree, coriander, turmeric and masala, and cook until the oil separates.",
      "Add the chickpeas and 1 cup of water, then simmer for 15 minutes, mashing a few chickpeas to thicken.",
      "Stir in the amchur and salt, then garnish with cilantro and serve with rice or flatbread."
    ],
    tags: ["indian", "curry", "vegan", "chickpeas"],
    substitutions: [
      { original: "ghee", substitute: "vegetable oil", reason: "Keeps the dish fully vegan" }
    ],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true
  },
  {
    recipe_name: "Mapo Tofu",
    subtitle: "Sichuan tofu in a fiery, numbing chili bean sauce",
    cuisine: "Chinese",
    region: "Asian",
    prep_time: "10 minutes",
    cook_time: "15 minutes",
    servings: 3,
    difficulty: "Medium",
    spiceLevel: "Hot",
    culturalBackground: "Mapo tofu was named in Chengdu in the late 1800s after a restaurant cook remembered as 'pockmarked grandma'. It captures the Sichuan flavor called mala: numbing and spicy.",
    fun_facts: [
      "Sichuan peppercorns cause a tingling, numbing sensation rather than heat.",
      "Doubanjiang, the fermented broad bean paste, is often aged for years in Pixian county.",
      "The dish is traditionally judged on being spicy, numbing, hot, fresh, tender and aromatic."
    ],
    ingredients: [
      "400 g soft or silken tofu, cut into cubes",
      "150 g ground pork or beef",
      "2 tablespoons doubanjiang (chili bean paste)",
      "1 tablespoon fermented black beans, rinsed",
      "2 cloves garlic, minced",
      "1 teaspoon grated ginger",
      "1 cup chicken or vegetable stock",
      "1 teaspoon ground Sichuan peppercorns",
      "1 tablespoon cornstarch mixed with 2 tablespoons water",
      "2 scallions, sliced",
      "1 tablespoon soy sauce"
    ],
    instructions: [
      "Gently simmer the tofu cubes in lightly salted water for 2 minutes, then drain.",
      "Brown the ground meat in a hot wok with a little oil.",
      "Add the doubanjiang, black beans, garlic and ginger, and fry until the oil turns red.",
      "Pour in the stock and soy sauce, then slide in the tofu and simmer for 5 minutes.",
      "Stir in the cornstarch slurry to thicken the sauce.",
      "Finish with Sichuan pepper and scallions, and serve with steamed rice."
    ],
    tags: ["chinese", "sichuan", "tofu", "spicy"],
    substitutions: [
      { original: "ground pork", substitute: "chopped shiitake mushrooms", reason: "Gives the same savory depth for a vegetarian version" },
      { original: "soy sauce", substitute: "tamari", reason: "Gluten-free; also check that your bean paste is gluten-free" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    recipe_name: "Chicken Tinga Tostadas",
    subtitle: "Smoky chipotle chicken piled on crisp tortillas",
    cuisine: "Mexican",
    region: "Latin",
    prep_time: "15 minutes",
    cook_time: "30 minutes",
    servings: 4,
    difficulty: "Easy",
    spiceLevel: "Medium",
    culturalBackground: "Tinga comes from Puebla in central Mexico. Shredded meat is stewed with tomatoes, onions and smoky chipotle chiles, and it is a favorite for tostadas, tacos and family gatherings.",
    fun_facts: [
      "Chipotles are jalapeños that have been smoked and dried.",
      "Tostadas began as a way to use up tortillas that had gone stale.",
      "Puebla is also the home of mole poblano."
    ],
    ingredients: [
      "500 g boneless chicken thighs",
      "1 onion, half left whole and half thinly sliced",
      "2 cloves garlic",
      "3 tomatoes",
      "2 chipotles in adobo, plus 1 tablespoon sauce",
      "1 teaspoon dried oregano",
      "1 tablespoon oil",
      "8 corn tostadas",
      "Refried beans, shredded lettuce, crema and queso fresco to serve"
    ],
    instructions: [
      "Simmer the chicken with the onion half, garlic and salted water for 20 minutes, then shred it and keep 1 cup of broth.",
      "Blend the tomatoes, chipotles, adobo sauce, oregano and reserved broth until smooth.",
      "Soften the sliced onion in oil, then pour in the sauce and simmer for 5 minutes.",
      "Stir in the shredded chicken and cook until the sauce clings to it.",
      "Spread beans on each tostada, top with tinga, then lettuce, crema and crumbled queso fresco."
    ],
    tags: ["mexican", "latin", "chicken", "smoky"],
    substitutions: [
      { original: "chicken", substitute: "jackfruit or mushrooms", reason: "Shreds the same way for a vegetarian tinga" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true
  },
  {
    recipe_name: "Chicken Teriyaki Donburi",
    subtitle: "Glossy teriyaki chicken over a bowl of steamed rice",
    cuisine: "Japanese",
    region: "Asian",
    prep_time: "10 minutes",
    cook_time: "15 minutes",
    servings: 2,
    difficulty: "Easy",
    spiceLevel: "Mild",
    culturalBackground: "Teriyaki describes a cooking method: teri means shine and yaki means grilled. Donburi, or rice bowls, are everyday Japanese comfort food eaten at home and at quick counter restaurants.",
    fun_facts: [
      "Real teriyaki sauce needs only four ingredients: soy sauce, mirin, sake and sugar.",
      "In Japan teriyaki is traditionally used for fish such as yellowtail as often as chicken.",
      "Donburi literally means 'bowl'."
    ],
    ingredients: [
      "2 boneless chicken thighs, skin on",
      "3 tablespoons soy sauce",
      "3 tablespoons mirin",
      "2 tablespoons sake",
      "1 tablespoon sugar",
      "2 cups cooked Japanese short-grain rice",
      "1 scallion, sliced",
      "Toasted sesame seeds"
    ],
    instructions: [
      "Mix the soy sauce, mirin, sake and sugar in a small bowl.",
      "Cook the chicken skin-side down in a pan over medium heat until crisp, about 7 minutes, then flip and cook 4 more minutes.",
      "Wipe out excess fat, pour in the sauce and simmer, turning the chicken, until the sauce turns thick and glossy.",
      "Slice the chicken and arrange it over bowls of rice.",
      "Spoon over the remaining sauce and top with scallions and sesame seeds."
    ],
    tags: ["japanese", "asian", "rice bowl", "quick"],
    substitutions: [
      { original: "soy sauce", substitute: "tamari", reason: "Makes the dish gluten-free" },
      { original: "chicken", substitute: "firm tofu", reason: "Pan-fried tofu takes the glaze well for a vegetarian bowl" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    recipe_name: "Ratatouille",
    subtitle: "Provençal summer vegetables slowly stewed in olive oil",
    cuisine: "French",
    region: "European",
    prep_time: "20 minutes",
    cook_time: "50 minutes",
    servings: 6,
    difficulty: "Easy",
    spiceLevel: "Mild",
    culturalBackground: "Ratatouille comes from Nice in Provence, where it began as a humble farmer's stew of summer vegetables. Cooks in Provence argue about whether each vegetable should be cooked separately first.",
    fun_facts: [
      "The name comes from the Occitan word 'ratatolha', related to the French verb 'touiller', to stir.",
      "It tastes even better the next day, served warm or at room temperature.",
      "The 2007 film made a fancy layered version famous, called confit byaldi."
    ],
    ingredients: [
      "1 eggplant, cubed",
      "2 zucchini, cubed",
      "1 red and 1 yellow bell pepper, chopped",
      "1 onion, chopped",
      "4 cloves garlic, sliced",
      "4 ripe tomatoes, chopped",
      "5 tablespoons olive oil",
      "1 teaspoon herbes de Provence",
      "Fresh basil",
      "Salt and pepper"
    ],
    instructions: [
      "Brown the eggplant in 2 tablespoons of olive oil and set it aside. Do the same with the zucchini.",
      "In the same pot, soften the onion and peppers in the remaining oil for 8 minutes.",
      "Add the garlic and cook for 1 minute, then add the tomatoes and herbes de Provence.",
      "Return the eggplant and zucchini, season, cover and simmer gently for 30 minutes.",
      "Tear in fresh basil and serve warm with crusty bread."
    ],
    tags: ["french", "vegetarian", "vegan", "summer"],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true
  },
  {
    recipe_name: "Thai Green Curry",
    subtitle: "Fragrant coconut curry with chicken, eggplant and Thai basil",
    cuisine: "Thai",
    region: "Asian",
    prep_time: "15 minutes",
    cook_time: "20 minutes",
    servings: 4,
    difficulty: "Medium",
    spiceLevel: "Hot",
    culturalBackground: "Green curry, kaeng khiao wan, is one of central Thailand's best-known dishes. Its color comes from fresh green chilies pounded into the paste with lemongrass, galangal and makrut lime.",
    fun_facts: [
      "'Khiao wan' means 'sweet green', describing the curry's color rather than its taste.",
      "Thai cooks often fry the curry paste in the thick coconut cream until it 'cracks' and releases its oil.",
      "Small round Thai eggplants are the traditional vegetable."
    ],
    ingredients: [
      "3 tablespoons green curry paste",
      "400 ml coconut milk",
      "400 g chicken thigh, sliced",
      "1 cup Thai or regular eggplant, cubed",
      "4 makrut lime leaves, torn",
      "1 tablespoon fish sauce",
      "1 teaspoon palm or brown sugar",
      "1 handful Thai basil",
      "1 red chili, sliced"
    ],
    instructions: [
      "Simmer half the coconut milk in a wok until it thickens and the oil starts to separate.",
      "Fry the curry paste in it for 2 minutes until fragrant.",
      "Add the chicken and stir until coated, then add the remaining coconut milk and the lime leaves.",
      "Add the eggplant and simmer until the chicken is cooked and the eggplant is tender.",
      "Season with fish sauce and sugar, then stir in the basil and chili. Serve with jasmine rice."
    ],
    tags: ["thai", "asian", "curry", "coconut"],
    substitutions: [
      { original: "fish sauce", substitute: "soy sauce or vegan fish sauce", reason: "For a vegetarian curry; also check your curry paste for shrimp paste" },
      { original: "chicken", substitute: "tofu and extra vegetables", reason: "Soaks up the curry for a vegetarian version" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true
  },
  {
    recipe_name: "Spanakopita",
    subtitle: "Golden Greek pie of spinach, feta and flaky phyllo",
    cuisine: "Greek",
    region: "Mediterranean",
    prep_time: "25 minutes",
    cook_time: "45 minutes",
    servings: 8,
    difficulty: "Medium",
    spiceLevel: "Mild",
    culturalBackground: "Spanakopita is baked across Greece for holidays, picnics and everyday meals. Village cooks often use whatever wild greens they forage, and Lenten versions leave out the cheese.",
    fun_facts: [
      "'Spanaki' means spinach and 'pita' means pie.",
      "Phyllo means 'leaf' in Greek, after its paper-thin sheets.",
      "Small triangle-shaped versions are called spanakopitakia."
    ],
    ingredients: [
      "1 kg fresh spinach, chopped (or 500 g frozen, thawed and squeezed)",
      "1 bunch scallions, sliced",
      "1 bunch dill, chopped",
      "250 g feta, crumbled",
      "2 eggs",
      "1 package phyllo pastry, thawed",
      "120 ml olive oil or melted butter",
      "Pinch of nutmeg",
      "Black pepper"
    ],
    instructions: [
      "Heat the oven to 180°C (350°F) and oil a 23 x 33 cm baking dish.",
      "Wilt the spinach with the scallions in a large pan, cool, then squeeze out as much liquid as possible.",
      "Mix the spinach with the dill, feta, eggs, nutmeg and pepper.",
      "Layer half the phyllo sheets in the dish, brushing each with oil.",
      "Spread in the filling, top with the remaining sheets, brushing each one, and score the top into squares.",
      "Bake for 45 minutes until deep golden, then rest for 10 minutes before cutting."
    ],
    tags: ["greek", "mediterranean", "vegetarian", "baked"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false
  },
  {
    recipe_name: "Paella Valenciana",
    subtitle: "Valencia's saffron rice with chicken, beans and a crispy base",
    cuisine: "Spanish",
    region: "Mediterranean",
    prep_time: "20 minutes",
    cook_time: "45 minutes",
    servings: 6,
    difficulty: "Hard",
    spiceLevel: "Mild",
    culturalBackground: "Paella was born in the rice fields around Valencia, cooked by farm workers over orange-wood fires. The original Valencian version uses chicken, rabbit and green beans rather than seafood.",
    fun_facts: [
      "'Paella' is the name of the wide, shallow pan itself.",
      "The prized crispy rice at the bottom is called socarrat.",
      "Valencians traditionally eat paella straight from the pan at Sunday lunch."
    ],
    ingredients: [
      "600 g chicken thighs, cut into pieces",
      "200 g flat green beans",
      "200 g cooked butter beans",
      "1 grated tomato",
      "400 g bomba or short-grain rice",
      "1.5 liters chicken stock",
      "1 pinch saffron",
      "1 teaspoon sweet smoked paprika",
      "5 tablespoons olive oil",
      "Rosemary sprig and lemon wedges"
    ],
    instructions: [
      "Brown the chicken well in the olive oil in a wide paella pan, then add the green beans and cook for 5 minutes.",
      "Add the tomato and paprika and cook for 2 minutes.",
      "Pour in the hot stock with the saffron and butter beans, and simmer for 10 minutes.",
      "Scatter the rice evenly and do not stir again.",
      "Cook on medium heat for 10 minutes, then low for 8 minutes, until the rice absorbs the liquid.",
      "Turn up the heat for the last minute to form the socarrat, then rest under a towel for 5 minutes."
    ],
    tags: ["spanish", "mediterranean", "rice", "one pan"],
    substitutions: [
      { original: "chicken stock", substitute: "vegetable stock", reason: "Lower in sodium when you choose a low-sodium stock" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true
  },
  {
    recipe_name: "Bibimbap",
    subtitle: "Korean rice bowl of seasoned vegetables, beef and a fried egg",
    cuisine: "Korean",
    region: "Asian",
    prep_time: "30 minutes",
    cook_time: "20 minutes",
    servings: 4,
    difficulty: "Medium",
    spiceLevel: "Medium",
    culturalBackground: "Bibimbap means 'mixed rice'. One story links it to clearing out leftover side dishes before the Lunar New Year, and the city of Jeonju is famous for its version.",
    fun_facts: [
      "Dolsot bibimbap is served in a sizzling stone bowl that crisps the rice.",
      "The colorful vegetables are traditionally arranged to reflect balance between the five elements.",
      "Gochujang, the red chili paste, is mixed in right before eating."
    ],
    ingredients: [
      "4 cups cooked short-grain rice",
      "200 g beef sirloin, thinly sliced",
      "2 tablespoons soy sauce",
      "1 tablespoon sesame oil, plus more for vegetables",
      "1 carrot, julienned",
      "1 zucchini, julienned",
      "200 g spinach",
      "150 g bean sprouts",
      "4 shiitake mushrooms, sliced",
      "4 eggs",
      "Gochujang and toasted sesame seeds to serve"
    ],
    instructions: [
      "Marinate the beef in the soy sauce and sesame oil for 15 minutes.",
      "Blanch the spinach and bean sprouts separately, squeeze dry, and season each with sesame oil and salt.",
      "Stir-fry the carrot, zucchini and mushrooms separately for 1 to 2 minutes each.",
      "Stir-fry the beef until just cooked.",
      "Fry the eggs sunny-side up.",
      "Arrange the vegetables and beef over bowls of rice, top with an egg, and serve with gochujang to mix in."
    ],
    tags: ["korean", "asian", "rice bowl", "vegetables"],
    substitutions: [
      { original: "beef", substitute: "marinated tofu", reason: "Makes a vegetarian bibimbap" },
      { original: "soy sauce", substitute: "tamari", reason: "Gluten-free; also check that your gochujang is gluten-free" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    recipe_name: "Tabbouleh",
    subtitle: "Lebanon's bright parsley salad with bulgur, lemon and mint",
    cuisine: "Lebanese",
    region: "Middle Eastern",
    prep_time: "25 minutes",
    cook_time: "0 minutes",
    servings: 4,
    difficulty: "Easy",
    spiceLevel: "Mild",
    culturalBackground: "Tabbouleh comes from the mountains of Lebanon and Syria and is a fixture of the mezze table. In Lebanon it is mostly parsley, with only a little bulgur, and is often scooped up with lettuce leaves.",
    fun_facts: [
      "Lebanon celebrates National Tabbouleh Day on the first Saturday of July.",
      "The name comes from the Arabic word 'tabil', meaning seasoning.",
      "Lebanese cooks chop the parsley by hand so it stays fluffy instead of bruised."
    ],
    ingredients: [
      "3 large bunches flat-leaf parsley, finely chopped",
      "1 small bunch mint, finely chopped",
      "1/4 cup fine bulgur",
      "3 ripe tomatoes, finely diced",
      "4 scallions, thinly sliced",
      "Juice of 2 lemons",
      "1/3 cup extra virgin olive oil",
      "1/2 teaspoon seven spice or allspice",
      "Salt"
    ],
    instructions: [
      "Rinse the bulgur and soak it in the lemon juice for 15 minutes.",
      "Dry the parsley and mint completely, then chop them finely with a sharp knife.",
      "Combine the herbs, tomatoes, scallions and bulgur in a large bowl.",
      "Dress with olive oil, seven spice and salt, and toss well.",
      "Serve right away with crisp romaine leaves."
    ],
    tags: ["lebanese", "mediterranean", "salad", "vegan"],
    substitutions: [
      { original: "bulgur", substitute: "cooked quinoa", reason: "Makes the salad gluten-free" }
    ],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false
  },
  {
    recipe_name: "Vietnamese Fresh Spring Rolls",
    subtitle: "Gỏi cuốn: shrimp, herbs and noodles wrapped in rice paper",
    cuisine: "Vietnamese",
    region: "Asian",
    prep_time: "30 minutes",
    cook_time: "5 minutes",
    servings: 4,
    difficulty: "Easy",
    spiceLevel: "Mild",
    culturalBackground: "Gỏi cuốn, often called summer rolls, is a fresh, unfried roll from southern Vietnam. It shows the Vietnamese love of raw herbs and is a popular snack at family gatherings.",
    fun_facts: [
      "'Gỏi cuốn' roughly means 'salad roll'.",
      "Rice paper is traditionally dried in the sun on bamboo mats, which leaves its crosshatch pattern.",
      "In the south the rolls are served with a peanut-hoisin dip; in the north, fish sauce dips are more common."
    ],
    ingredients: [
      "12 rice paper wrappers",
      "12 cooked shrimp, halved lengthwise",
      "100 g rice vermicelli, cooked",
      "1 head soft lettuce",
      "Fresh mint, cilantro and Thai basil",
      "1 cucumber, cut into thin sticks",
      "For the dip: 3 tablespoons hoisin, 1 tablespoon peanut butter, warm water, crushed peanuts"
    ],
    instructions: [
      "Whisk the hoisin and peanut butter with warm water until smooth, then top with crushed peanuts.",
      "Dip one rice paper in warm water for a few seconds until just pliable, then lay it flat.",
      "Place 3 shrimp halves cut-side up across the middle, then add lettuce, noodles, cucumber and herbs.",
      "Fold in the sides and roll up tightly.",
      "Repeat with the rest and serve with the dipping sauce."
    ],
    tags: ["vietnamese", "asian", "fresh", "no cook"],
    substitutions: [
      { original: "shrimp", substitute: "seared tofu", reason: "Makes the rolls vegetarian" },
      { original: "hoisin", substitute: "gluten-free hoisin", reason: "Regular hoisin usually contains wheat" }
    ],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  }
];

module.exports = { globalRecipes };
