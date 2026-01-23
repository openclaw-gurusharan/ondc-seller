import { config } from '@/config/env';
import type { AuthUser } from '@/types';

interface ApiOptions {
  headers?: Record<string, string>;
}

let currentUser: AuthUser | null = null;

export function setCurrentUser(user: AuthUser | null) {
  currentUser = user;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${config.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (currentUser?.wallet_address) {
    headers['X-User-ID'] = currentUser.wallet_address;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?returnUrl=${returnUrl}`;
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, options?: ApiOptions) => apiRequest<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(url: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: ApiOptions) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};
