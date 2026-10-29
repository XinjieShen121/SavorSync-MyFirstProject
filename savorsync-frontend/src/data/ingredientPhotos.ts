// Free-licensed ingredient photos from Wikimedia Commons, shown in cook mode (design.md 4.6).
// Each one is credited where it is shown. Add more by appending to INGREDIENT_PHOTOS;
// `match` lists the words that name the ingredient in a recipe (longest wins).
export interface IngredientPhoto {
  key: string;
  match: string[];
  src: string;
  author: string;
  license: string;
  source: string;
}

const W = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';
const page = (file: string) => `https://commons.wikimedia.org/wiki/${file}`;

export const INGREDIENT_PHOTOS: IngredientPhoto[] = [
  { key: 'rice', match: ['rice'], src: `${W}d/d6/A_bowl_of_rice.jpg/500px-A_bowl_of_rice.jpg`, author: 'Douglas Perkins', license: 'CC0', source: page('File:A_bowl_of_rice.jpg') },
  { key: 'beef', match: ['beef', 'sirloin'], src: `${W}4/4d/Raw_beef_slices.jpg/500px-Raw_beef_slices.jpg`, author: 'J. Samuel Burner', license: 'CC BY 2.0', source: page('File:Raw_beef_slices.jpg') },
  { key: 'sesame-oil', match: ['sesame oil'], src: `${W}a/aa/Sesam%C3%B6l-1.jpg/500px-Sesam%C3%B6l-1.jpg`, author: 'Rainer Z', license: 'CC BY-SA 3.0', source: page('File:Sesam%C3%B6l-1.jpg') },
  { key: 'carrot', match: ['carrot'], src: `${W}a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/500px-Vegetable-Carrot-Bundle-wStalks.jpg`, author: 'Evan-Amos', license: 'Public domain', source: page('File:Vegetable-Carrot-Bundle-wStalks.jpg') },
  { key: 'zucchini', match: ['zucchini', 'courgette'], src: `${W}7/7c/Zucchini-Whole.jpg/500px-Zucchini-Whole.jpg`, author: 'Evan-Amos', license: 'Public domain', source: page('File:Zucchini-Whole.jpg') },
  { key: 'spinach', match: ['spinach'], src: `${W}f/fe/Spinach_leaves.jpg/500px-Spinach_leaves.jpg`, author: 'Nillerdk', license: 'CC BY 3.0', source: page('File:Spinach_leaves.jpg') },
  { key: 'bean-sprouts', match: ['bean sprouts', 'sprouts'], src: `${W}f/fe/Mung_bean_sprouts%2C_close-up.jpg/500px-Mung_bean_sprouts%2C_close-up.jpg`, author: 'pics_pd', license: 'CC0', source: page('File:Mung_bean_sprouts,_close-up.jpg') },
  { key: 'shiitake', match: ['shiitake', 'mushroom'], src: `${W}7/7c/Lentinula_edodes_20101113_a.jpg/500px-Lentinula_edodes_20101113_a.jpg`, author: 'Batholith', license: 'Public domain', source: page('File:Lentinula_edodes_20101113_a.jpg') },
  { key: 'egg', match: ['egg', 'yolk'], src: `${W}6/67/Egg_on_white_background.jpg/500px-Egg_on_white_background.jpg`, author: 'Paolo Neo', license: 'Public domain', source: page('File:Egg_on_white_background.jpg') },
  { key: 'gochujang', match: ['gochujang'], src: `${W}6/60/Gochujang_%28chilli_paste%29.jpg/500px-Gochujang_%28chilli_paste%29.jpg`, author: '온맘으로', license: 'CC BY 4.0', source: page('File:Gochujang_(chilli_paste).jpg') },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Every match word, longest first, so "sesame oil" wins over "sesame" and "rice paper" over "rice"
const MATCHERS = INGREDIENT_PHOTOS
  .flatMap((photo) => photo.match.map((word) => ({ photo, word, re: new RegExp(`\\b${escape(word)}(e?s)?\\b`, 'i') })))
  .sort((a, b) => b.word.length - a.word.length);

export const photoForIngredient = (name: string): IngredientPhoto | null =>
  MATCHERS.find((m) => m.re.test(name))?.photo || null;
