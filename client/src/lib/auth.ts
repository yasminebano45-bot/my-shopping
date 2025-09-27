import { queryClient } from "./queryClient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authService = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  logout: (): void => {
    authService.removeToken();
    queryClient.clear();
    window.location.href = '/login';
  },

  getAuthHeaders: (): Record<string, string> => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

// Add auth headers to all requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [resource, config = {}] = args;
  const token = authService.getToken();
  
  if (token && typeof resource === 'string' && resource.startsWith('/api')) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  return originalFetch.call(this, resource, config);
};
