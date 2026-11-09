import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { apiClient, setUnauthorizedHandler } from '../api/apiClient.js';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from './authStorage.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = getStoredToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // If any later request gets a 401 (login expired), sign the user out.
  // ProtectedRoute then redirects to the login page.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    setStoredToken(response.data.token);
    setUser(response.data.user);

    return response.data.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout
    }),
    [isLoading, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
