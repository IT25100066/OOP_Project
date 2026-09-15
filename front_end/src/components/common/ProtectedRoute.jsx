import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/*
 * ProtectedRoute — redirects to /login if the user is not logged in.
 * Use this for any page that requires authentication (any role).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
