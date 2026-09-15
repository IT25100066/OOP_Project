import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthContext — stores the logged-in user in both state and localStorage.
 * The backend returns plain JSON (id, name, username, email, role).
 * We save that object as "htss_user" in localStorage.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read the initial user from localStorage (persists across page refreshes)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('htss_user');
    if (saved && saved !== 'undefined') {
          try {
            return JSON.parse(saved);
          } catch (error) {
            console.error("Failed to parse user from local storage", error);
            return null;
          }
        }
        return null;
  });

  const navigate = useNavigate();

  // Call this after a successful login. `userData` is the JSON the backend returns.
  const login = useCallback((userData,token) => {
    localStorage.setItem('htss_user', JSON.stringify(userData));
    localStorage.setItem('htss_token', token);
    setUser(userData);

    // Navigate based on role
    switch (userData.role) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'TUTOR':
        navigate('/dashboard');
        break;
      case 'STUDENT':
        navigate('/dashboard');
        break;
      default:
        navigate('/');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('htss_user');
    localStorage.removeItem('htss_token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Convenience booleans
  const isAuthenticated = user !== null;
  const isAdmin   = user?.role === 'ADMIN';
  const isTutor   = user?.role === 'TUTOR';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isTutor, isStudent, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
