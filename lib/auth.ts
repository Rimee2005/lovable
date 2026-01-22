// Simple authentication utilities
// In production, replace with real authentication (NextAuth, Auth0, etc.)

export interface User {
  email: string;
  name?: string;
}

const AUTH_KEY = 'lovable_user';

export function setUser(user: User) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = sessionStorage.getItem(AUTH_KEY);
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

export function removeUser() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

