import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config } from '@/config/env';
import type { AuthUser, AuthContextValue } from '@/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${config.identityUrl}/api/auth/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = (returnUrl = '/') => {
    const encodedReturn = encodeURIComponent(window.location.origin + returnUrl);
    // Use identityWebUrl for login page (frontend), not gateway
    window.location.href = `${config.identityWebUrl}/login?returnUrl=${encodedReturn}`;
  };

  const logout = async () => {
    await fetch(`${config.identityUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    window.location.href = '/';
  };

  const refresh = () => fetchUser();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        error,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}
