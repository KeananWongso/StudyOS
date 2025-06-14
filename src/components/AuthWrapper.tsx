'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import LoginPage from './LoginPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!user) {
    return <LoginPage />;
  }

  // Role selection is now handled at login, so this is no longer needed

  // Check role-based access
  const checkRoleAccess = (): boolean => {
    // Tutor-only routes
    const tutorOnlyRoutes = ['/tutor', '/curriculum', '/create-assessment'];
    const isTutorRoute = tutorOnlyRoutes.some(route => pathname.startsWith(route));
    
    if (isTutorRoute && user.role !== 'tutor') {
      router.push('/'); // Redirect students to main dashboard
      return false;
    }

    // Student-only routes (if any)
    const studentOnlyRoutes = ['/student'];
    const isStudentRoute = studentOnlyRoutes.some(route => pathname.startsWith(route));
    
    if (isStudentRoute && user.role !== 'student') {
      router.push('/tutor'); // Redirect tutors to tutor dashboard
      return false;
    }

    return true;
  };

  // Check access permissions
  if (!checkRoleAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, has role, and has access - show the content
  return <>{children}</>;
}