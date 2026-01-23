import { config } from '@/config/env';
import type { AuthUser } from '@/types';

interface ApiOptions {
  headers?: Record<string, string>;
}

let currentUser: AuthUser | null = null;

/**
 * Identity service user type from SSO
 */
export interface SSOUser {
  wallet_address: string;
  pda_address?: string;
  owner_pubkey?: string;
  created_at: number;
}

/**
 * Session validation response
 */
export interface SessionValidationResult {
  valid: boolean;
  user?: SSOUser;
}

// Current wallet address from SSO session
let currentWalletAddress: string | null = null;

/**
 * Identity service API client - calls gateway for auth
 * Uses config.identityUrl which points to the gateway
 */
async function identityRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${config.identityUrl}/api${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include session cookie
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Validate session with identity gateway
 * GET /api/auth/validate
 */
export async function validateSession(): Promise<SessionValidationResult> {
  try {
    const response = await identityRequest<{ success: boolean; data: { valid: boolean; user?: SSOUser } }>('/auth/validate');
    if (response.success && response.data.valid && response.data.user) {
      currentWalletAddress = response.data.user.wallet_address;
      return { valid: true, user: response.data.user };
    }
    currentWalletAddress = null;
    return { valid: false };
  } catch (error) {
    currentWalletAddress = null;
    return { valid: false };
  }
}

/**
 * Get current wallet address from session
 */
export function getCurrentWalletAddress(): string | null {
  return currentWalletAddress;
}

/**
 * Check if user is authenticated (non-blocking)
 */
export function isAuthenticated(): boolean {
  return currentWalletAddress !== null;
}

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
