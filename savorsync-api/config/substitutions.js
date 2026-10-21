const { getOpenAIClient, CHAT_MODEL } = require('./openai');

// Ingredient swaps for three diets (README "Smart ingredient substitutions").
// The AI looks at every ingredient at once; without an API key, or if the AI
// fails, a hand-checked table covers the most common ingredients.

const DIETS = ['vegetarian', 'gluten-free', 'low-sodium'];
const MAX_OPTIONS = 3;

// Keys are matched as whole words against the ingredient text. Order matters:
// more specific keys come first so "chicken stock" wins over "chicken".
const FALLBACK_SWAPS = [
  ['chicken stock', { vegetarian: ['vegetable stock', 'Same savoury base without meat.'], 'low-sodium': ['low-sodium chicken stock', 'Cuts most of the salt.'] }],
  ['chicken broth', { vegetarian: ['vegetable broth', 'Same savoury base without meat.'], 'low-sodium': ['low-sodium chicken broth', 'Cuts most of the salt.'] }],
  ['beef stock', { vegetarian: ['mushroom stock', 'Deep, meaty flavour from mushrooms.'], 'low-sodium': ['low-sodium beef stock', 'Cuts most of the salt.'] }],
  ['beef broth', { vegetarian: ['mushroom broth', 'Deep, meaty flavour from mushrooms.'], 'low-sodium': ['low-sodium beef broth', 'Cuts most of the salt.'] }],
  ['fish sauce', { vegetarian: ['soy sauce with a little seaweed', 'Keeps the salty, savoury depth.'], 'low-sodium': ['half the fish sauce plus lime juice', 'Lime keeps it bright with less salt.'] }],
  ['oyster sauce', { vegetarian: ['mushroom oyster sauce', 'Made from mushrooms, same texture.'] }],
  ['soy sauce', { 'gluten-free': ['tamari', 'Brewed without wheat; check the label.'], 'low-sodium': ['low-sodium soy sauce', 'About 40% less salt.'] }],
  ['chicken', { vegetarian: ['extra-firm tofu', 'Holds its shape and takes on marinades.'] }],
  ['beef', { vegetarian: ['mushrooms or lentils', 'Gives a hearty, meaty bite.'] }],
  ['pork', { vegetarian: ['jackfruit or seitan', 'Shreds and browns like pork.'] }],
  ['bacon', { vegetarian: ['smoked tempeh', 'Smoky and crisp when fried.'], 'low-sodium': ['unsalted pork belly', 'Same richness with far less salt.'] }],
  ['pancetta', { vegetarian: ['smoked mushrooms', 'Brings back the smoky, savoury note.'] }],
  ['guanciale', { vegetarian: ['smoked mushrooms', 'Brings back the smoky, savoury note.'] }],
  ['sausage', { vegetarian: ['plant-based sausage', 'Same seasoning and shape.'] }],
  ['lamb', { vegetarian: ['eggplant or chickpeas', 'Absorbs the spices well.'] }],
  ['shrimp', { vegetarian: ['king oyster mushrooms', 'Firm, slightly sweet bite.'] }],
  ['fish', { vegetarian: ['firm tofu', 'Flakes gently and soaks up sauce.'] }],
  ['anchovies', { vegetarian: ['capers or miso', 'Salty, savoury depth.'] }],
  ['gelatin', { vegetarian: ['agar agar', 'Sets the same way; use less.'] }],
  ['all-purpose flour', { 'gluten-free': ['1:1 gluten-free flour blend', 'Swaps cup for cup.'] }],
  ['flour', { 'gluten-free': ['1:1 gluten-free flour blend', 'Swaps cup for cup.'] }],
  ['breadcrumbs', { 'gluten-free': ['gluten-free breadcrumbs or crushed rice crackers', 'Same crunch without wheat.'] }],
  ['panko', { 'gluten-free': ['gluten-free panko', 'Same light crunch.'] }],
  ['spaghetti', { 'gluten-free': ['gluten-free spaghetti', 'Cook a minute less; it softens fast.'] }],
  ['pasta', { 'gluten-free': ['gluten-free pasta', 'Cook a minute less; it softens fast.'] }],
  ['noodles', { 'gluten-free': ['rice noodles', 'Naturally wheat-free.'] }],
  ['couscous', { 'gluten-free': ['quinoa', 'Similar size and texture.'] }],
  ['bulgur', { 'gluten-free': ['quinoa', 'Similar size and texture.'] }],
  ['tortillas', { 'gluten-free': ['corn tortillas', 'Made from corn, no wheat.'] }],
  ['bread', { 'gluten-free': ['gluten-free bread', 'Same use, no wheat.'] }],
  ['beer', { 'gluten-free': ['gluten-free beer', 'Brewed without barley.'] }],
  ['miso', { 'low-sodium': ['reduced-sodium miso', 'Keeps the umami with less salt.'] }],
  ['parmesan', { 'low-sodium': ['a smaller amount of parmesan plus lemon zest', 'Zest keeps it bright with less salt.'] }],
  ['feta', { 'low-sodium': ['fresh ricotta or soaked feta', 'Much less salt, still creamy.'] }],
  ['salt', { 'low-sodium': ['half the salt plus herbs or lemon', 'Herbs and acid make up the flavour.'] }],
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const fallbackSwaps = (ingredients) => ingredients.map((ingredient, index) => {
  const lower = ingredient.toLowerCase();
  const options = [];
  const usedDiets = new Set();
  for (const [key, byDiet] of FALLBACK_SWAPS) {
    if (!new RegExp(`\\b${escapeRegExp(key)}\\b`).test(lower)) continue;
    for (const diet of DIETS) {
      if (!byDiet[diet] || usedDiets.has(diet)) continue;
      usedDiets.add(diet);
      options.push({ diet, name: byDiet[diet][0], reason: byDiet[diet][1], matchKey: key });
    }
  }
  return { index, options: options.slice(0, MAX_OPTIONS) };
}).filter(entry => entry.options.length);

const cleanText = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// Keep only well-formed swaps whose matchKey really appears in that ingredient,
// so the swap shows on the right line and highlights the right words in the steps.
const validateAiSwaps = (raw, ingredients) => {
  const items = Array.isArray(raw?.swaps) ? raw.swaps : [];
  const byIndex = new Map();
  for (const item of items) {
    const index = Number(item?.index);
    if (!Number.isInteger(index) || index < 0 || index >= ingredients.length) continue;
    const diet = item?.diet;
    const name = cleanText(item?.substitute, 80);
    const reason = cleanText(item?.reason, 160);
    let matchKey = cleanText(item?.original, 60).toLowerCase();
    if (!DIETS.includes(diet) || !name) continue;
    if (!matchKey || !ingredients[index].toLowerCase().includes(matchKey)) continue;

    const options = byIndex.get(index) || [];
    if (options.length >= MAX_OPTIONS || options.some(o => o.diet === diet)) continue;
    options.push({ diet, name, reason, matchKey });
    byIndex.set(index, options);
  }
  return [...byIndex.entries()].sort((a, b) => a[0] - b[0]).map(([index, options]) => ({ index, options }));
};

const aiSwaps = async (recipe, ingredients) => {
  const openai = getOpenAIClient();
  if (!openai) return null;

  const list = ingredients.map((text, i) => `${i}. ${text}`).join('\n');
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content: 'You are a careful recipe developer. You suggest ingredient substitutions that keep a dish true to its culture and actually work in the cooking method. Never suggest a substitute that still breaks the diet (for example "gluten-free chicken" or regular soy sauce for gluten-free). Only include ingredients that need a change for that diet.'
      },
      {
        role: 'user',
        content: `Dish: ${recipe.recipe_name || recipe.title} (${recipe.cuisine || 'unknown cuisine'})
Ingredients:
${list}

For each ingredient that is not already vegetarian, gluten-free, or low-sodium, give the best substitute for that diet.
Reply as JSON: {"swaps": [{"index": <ingredient number>, "original": "<the exact words from that ingredient line being replaced, e.g. chicken breast>", "diet": "vegetarian" | "gluten-free" | "low-sodium", "substitute": "<short name>", "reason": "<one short sentence on why it works or how to use it>"}]}`
      }
    ]
  });

  const content = completion.choices?.[0]?.message?.content;
  return validateAiSwaps(JSON.parse(content || '{}'), ingredients);
};

const getSubstitutions = async (recipe) => {
  const ingredients = (recipe.ingredients || []).filter(i => typeof i === 'string').slice(0, 60);
  if (!ingredients.length) return { swaps: [], source: 'fallback' };
  try {
    const swaps = await aiSwaps(recipe, ingredients);
    if (swaps) return { swaps, source: 'ai' };
  } catch (error) {
    console.error('AI substitutions failed, using fallback:', error.message);
  }
  return { swaps: fallbackSwaps(ingredients), source: 'fallback' };
};

module.exports = { getSubstitutions, fallbackSwaps, validateAiSwaps, DIETS };
