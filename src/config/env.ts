export const config = {
  // Gateway for API calls (/api/auth/validate, /api/auth/me)
  identityUrl: import.meta.env.VITE_IDENTITY_URL || 'http://127.0.0.1:43101',
  // Frontend for login page redirect (/login)
  identityWebUrl: import.meta.env.VITE_IDENTITY_WEB_URL || import.meta.env.VITE_IDENTITY_URL || 'http://127.0.0.1:43100',
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001',
} as const;
