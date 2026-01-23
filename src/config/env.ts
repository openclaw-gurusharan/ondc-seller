export const config = {
  identityUrl: import.meta.env.VITE_IDENTITY_URL || 'http://localhost:3000',
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
} as const;
