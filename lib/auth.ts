// Authentication utilities with JWT tokens

export interface User {
  id: string;
  email: string;
  name?: string;
}

const TOKEN_KEY = 'lovable_token';
const USER_KEY = 'lovable_user';

export function setAuth(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function removeAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getUser() !== null;
}

export async function verifyAuth(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setAuth(token, data.user);
      return data.user;
    } else {
      removeAuth();
      return null;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    removeAuth();
    return null;
  }
}

