// Scale ingredient quantities and switch between US and metric units.
// Works on the quantity part of an ingredient ("1 1/2 cups", "200g", "2-3").

export type UnitSystem = 'us' | 'metric';

const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125,
};

// Leading amount: "1 1/2", "1/2", "1.5", "½", "1½", "2-3" (a range)
const AMOUNT = /^\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+[¼½¾⅓⅔⅛]?|[¼½¾⅓⅔⅛])(?:\s*(?:-|–|to)\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+[¼½¾⅓⅔⅛]?|[¼½¾⅓⅔⅛]))?/;

const toNumber = (text: string): number => {
  const t = text.trim();
  const unicode = t.match(/^(\d*)([¼½¾⅓⅔⅛])$/);
  if (unicode) return Number(unicode[1] || 0) + UNICODE_FRACTIONS[unicode[2]];
  const mixed = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = t.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[2]) ? Number(fraction[1]) / Number(fraction[2]) : NaN;
  return Number(t);
};

const NICE_FRACTIONS: [number, string][] = [
  [0.125, '1/8'], [0.25, '1/4'], [1 / 3, '1/3'], [0.5, '1/2'], [2 / 3, '2/3'], [0.75, '3/4'],
];

// 1.5 -> "1 1/2", 0.33 -> "1/3", 2.4 -> "2.4", 12.6 -> "13"
export const formatAmount = (value: number): string => {
  if (!isFinite(value) || value <= 0) return '';
  if (value >= 10) return String(Math.round(value));
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.06) return String(whole);
  if (rest > 0.94) return String(whole + 1);
  const nice = NICE_FRACTIONS.find(([v]) => Math.abs(rest - v) < 0.04);
  if (nice) return whole ? `${whole} ${nice[1]}` : nice[1];
  return String(Math.round(value * 10) / 10);
};

export const parseAmount = (quantity: string): { value: number; max?: number; rest: string } | null => {
  const match = quantity.match(AMOUNT);
  if (!match) return null;
  const value = toNumber(match[1]);
  if (!isFinite(value) || value <= 0) return null;
  const max = match[2] ? toNumber(match[2]) : undefined;
  return { value, max: max && isFinite(max) ? max : undefined, rest: quantity.slice(match[0].length) };
};

export const scaleQuantity = (quantity: string, factor: number): string => {
  if (!quantity || factor === 1) return quantity;
  const amount = parseAmount(quantity);
  if (!amount) return quantity;
  const scaled = formatAmount(amount.value * factor);
  const max = amount.max ? `-${formatAmount(amount.max * factor)}` : '';
  return `${scaled}${max}${amount.rest}`;
};

// Unit name -> [system, base unit, amount of base per unit].
// Spoons are left as they are: cooks use them in both systems.
const UNITS: [RegExp, UnitSystem, 'ml' | 'g', number][] = [
  [/^(cups?|c)\b/i, 'us', 'ml', 240],
  [/^(fl\.?\s?oz|fluid ounces?)\b/i, 'us', 'ml', 30],
  [/^(pounds?|lbs?)\b/i, 'us', 'g', 454],
  [/^(ounces?|oz)\b/i, 'us', 'g', 28.35],
  [/^(quarts?|qt)\b/i, 'us', 'ml', 946],
  [/^(pints?|pt)\b/i, 'us', 'ml', 473],
  [/^(kilograms?|kg)\b/i, 'metric', 'g', 1000],
  [/^(grams?|g)\b/i, 'metric', 'g', 1],
  [/^(milliliters?|millilitres?|ml)\b/i, 'metric', 'ml', 1],
  [/^(liters?|litres?|l)\b/i, 'metric', 'ml', 1000],
];

const findUnit = (rest: string) => {
  const text = rest.replace(/^\s+/, '');
  for (const [pattern, system, base, factor] of UNITS) {
    const match = text.match(pattern);
    if (match) return { system, base, factor, after: text.slice(match[0].length) };
  }
  return null;
};

// Round metric amounts the way a cook would weigh them: 5 g / 10 ml steps above 100
const roundMetric = (amount: number, step: number) => Math.max(1, Math.round(amount / step) * step);

const toMetric = (amount: number, base: 'ml' | 'g') => {
  if (amount >= 1000) return `${formatAmount(amount / 1000)} ${base === 'g' ? 'kg' : 'l'}`;
  const step = amount >= 100 ? (base === 'g' ? 5 : 10) : 1;
  return `${roundMetric(amount, step)} ${base}`;
};

// US amounts round to what measuring cups and spoons can do
const quarter = (value: number) => Math.max(0.25, Math.round(value * 4) / 4);
const half = (value: number) => Math.max(0.5, Math.round(value * 2) / 2);

const toUS = (amount: number, base: 'ml' | 'g') => {
  if (base === 'g') return amount >= 454 ? `${formatAmount(quarter(amount / 454))} lb` : `${formatAmount(half(amount / 28.35))} oz`;
  if (amount >= 60) {
    const cups = quarter(amount / 240);
    return `${formatAmount(cups)} cup${cups > 1 ? 's' : ''}`;
  }
  if (amount >= 15) return `${formatAmount(half(amount / 15))} tbsp`;
  return `${formatAmount(quarter(amount / 5))} tsp`;
};

// "2 cups" -> "480 ml"; "200 g" -> "7 oz". Unknown units are left alone.
export const convertQuantity = (quantity: string, system: UnitSystem): string => {
  const amount = parseAmount(quantity);
  if (!amount) return quantity;
  const unit = findUnit(amount.rest);
  if (!unit || unit.system === system) return quantity;
  const convert = system === 'metric' ? toMetric : toUS;
  const low = convert(amount.value * unit.factor, unit.base);
  const high = amount.max ? convert(amount.max * unit.factor, unit.base) : '';
  return high ? `${low.split(' ')[0]}-${high}${unit.after}` : `${low}${unit.after}`;
};

// Which system a recipe mostly uses, so the toggle starts in the right place
export const detectSystem = (quantities: string[]): UnitSystem => {
  let us = 0;
  let metric = 0;
  quantities.forEach(quantity => {
    const amount = parseAmount(quantity);
    const unit = amount && findUnit(amount.rest);
    if (unit?.system === 'us') us += 1;
    if (unit?.system === 'metric') metric += 1;
  });
  return metric > us ? 'metric' : 'us';
};
