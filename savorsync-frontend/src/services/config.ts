// Same-origin by default: Netlify proxies /api to Render in production
// (public/_redirects) and Vite proxies it to the local API in dev (vite.config.ts).
// Set VITE_API_BASE_URL only to point at a different API on purpose.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
