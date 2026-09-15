import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/*
 * AdminProtectedRoute — redirects to /login if not logged in,
 * or to / if logged in but NOT an admin.
 */
export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)         return <Navigate to="/"     replace />;
  return children;
}
