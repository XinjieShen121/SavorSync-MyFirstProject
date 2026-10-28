// Turns visitor-typed text into a case-insensitive "contains" pattern.
// Escaping keeps characters like "+" or "(" literal, so a search for "c++" can't crash the query.
const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const containsText = (text) => new RegExp(escapeRegExp(text), 'i');

module.exports = { escapeRegExp, containsText };
