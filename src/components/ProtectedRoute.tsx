'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthLoadingSpinner } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  requireTutor?: boolean;
  fallbackUrl?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireTutor = false,
  fallbackUrl = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to login
        router.push(fallbackUrl);
        return;
      }

      if (requireTutor && user.role !== 'tutor') {
        // User is not a tutor but tutor access is required
        router.push('/');
        return;
      }
    }
  }, [user, loading, requireTutor, router, fallbackUrl]);

  // Show loading spinner while checking auth
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  // Don't render if user is not authenticated
  if (!user) {
    return <AuthLoadingSpinner />;
  }

  // Don't render if tutor is required but user is not tutor
  if (requireTutor && user.role !== 'tutor') {
    return <AuthLoadingSpinner />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireTutor?: boolean } = {}
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute requireTutor={options.requireTutor}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
}

// Component for unauthorized access
export const UnauthorizedAccess: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
      <div className="text-red-600 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">
        You don&apos;t have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);