// Same-origin by default: Netlify proxies /api to Render in production
// (public/_redirects) and Vite proxies it to the local API in dev (vite.config.ts).
// Set VITE_API_BASE_URL only to point at a different API on purpose.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// A 401 on a signed-in request means the saved login has expired: clear it and send the person
// to the login page with a note. A 401 from the login or register form itself is a wrong
// password or similar, so it is left for the form to show.
export const handleExpiredLogin = (error: { response?: { status?: number }; config?: { url?: string } }) => {
  const url = error.config?.url || '';
  if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') window.location.href = '/login?expired=1';
  }
};
