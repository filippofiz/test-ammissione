import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile } from '../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; // If provided, user must have at least one of these roles
  requireAuth?: boolean; // Default true
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!requireAuth) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const profile = await getCurrentProfile();

    if (!profile) {
      // Not authenticated
      navigate('/login', { replace: true });
      return;
    }

    // Check role requirements if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = profile.roles as string[] || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        // User doesn't have required role - redirect to appropriate page
        if (userRoles.includes('STUDENT')) {
          navigate('/', { replace: true });
        } else if (userRoles.includes('TUTOR')) {
          navigate('/', { replace: true });
        } else if (userRoles.includes('ADMIN')) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }
    }

    setAuthorized(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
