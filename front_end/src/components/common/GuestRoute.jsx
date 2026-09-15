import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * GuestRoute — the opposite of ProtectedRoute.
 * If the user is already logged in, redirect them to /dashboard.
 * Use this to wrap register and login pages.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}
