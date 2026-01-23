export const config = {
  // Gateway for API calls (/api/auth/validate, /api/auth/me)
  identityUrl: import.meta.env.VITE_IDENTITY_URL || 'http://localhost:8000',
  // Frontend for login page redirect (/login)
  identityWebUrl: import.meta.env.VITE_IDENTITY_WEB_URL || import.meta.env.VITE_IDENTITY_URL || 'http://localhost:3000',
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
} as const;
