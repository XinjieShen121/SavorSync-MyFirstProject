// localStorage key for the step cook mode was left at, per recipe (design.md 4.6)
export const savedStepKey = (recipeId: string) => `savorsync:cook-step:${recipeId}`;

// Words that don't name an ingredient, so they never link an ingredient to a step
const NOT_NAMES = new Set(['fresh', 'freshly', 'large', 'small', 'medium', 'whole', 'ground', 'cooked', 'dried', 'finely', 'thinly',
  'chopped', 'sliced', 'minced', 'grated', 'diced', 'crushed', 'toasted', 'boneless', 'skin', 'plus', 'more', 'with',
  'taste', 'serve', 'garnish', 'water', 'warm', 'bunch', 'handful', 'pinch', 'cups', 'tablespoons', 'teaspoons', 'about',
  'into', 'pieces', 'strips', 'cubes', 'leaves', 'extra', 'virgin', 'regular', 'short-grain', 'style', 'other',
  'and', 'the', 'oil', 'cup', 'can', 'cans', 'each', 'half', 'left', 'red', 'hot', 'raw', 'g', 'kg', 'ml']);

// "Oil", "sauce" and the like only count together with the word before them,
// so "sesame oil" in a step doesn't pull in "sesame seeds"
const QUALIFIERS = new Set(['oil', 'seed', 'seeds', 'sauce', 'paste', 'milk', 'powder', 'leaves', 'stock']);

const singular = (word: string) => word.replace(/oes$/, 'o').replace(/([^s])s$/, '$1');

export const ingredientTerms = (name: string) => {
  const words = name
    .toLowerCase()
    .split(/,|\(| or | for | to /)[0]
    .split(/[^a-z\u00C0-\u024F-]+/)
    .filter(Boolean);
  const terms: string[] = [];
  words.forEach((word, i) => {
    const nextWord = words[i + 1];
    if (nextWord && QUALIFIERS.has(nextWord) && !NOT_NAMES.has(word)) terms.push(`${word} ${singular(nextWord)}`);
    else if (word.length > 2 && !NOT_NAMES.has(word) && !QUALIFIERS.has(word)) terms.push(singular(word));
  });
  return terms;
};

// Indexes of the ingredients a step mentions, e.g. "Stir-fry the carrot and mushrooms" -> carrot, shiitake mushrooms
export const ingredientsInStep = (step: string, names: string[]): number[] => {
  const text = step.toLowerCase();
  return names
    .map((name, index) => ({ index, words: ingredientTerms(name) }))
    .filter(({ words }) => words.some((word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(e?s)?\\b`).test(text)))
    .map(({ index }) => index);
};
