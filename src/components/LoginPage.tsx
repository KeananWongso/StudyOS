'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, GraduationCap, Users } from 'lucide-react';
import ProgressTrackerLogo from './ProgressTrackerLogo';

export default function LoginPage() {
  const { signInAsStudent, signInAsTutor, loading, error, clearError, user } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState<'student' | 'tutor' | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      // Redirect based on role
      if (user.role === 'student') {
        router.push('/');
      } else if (user.role === 'tutor') {
        router.push('/tutor');
      }
    }
  }, [user, loading, router]);

  // Handle student sign in
  const handleStudentSignIn = async () => {
    try {
      setIsSigningIn('student');
      clearError();
      await signInAsStudent();
      // Navigation will happen automatically via useEffect
    } catch (error) {
      // Error is handled by AuthProvider
      console.error('Student login failed:', error);
    } finally {
      setIsSigningIn(null);
    }
  };

  // Handle tutor sign in
  const handleTutorSignIn = async () => {
    try {
      setIsSigningIn('tutor');
      clearError();
      await signInAsTutor();
      // Navigation will happen automatically via useEffect
    } catch (error) {
      // Error is handled by AuthProvider
      console.error('Tutor login failed:', error);
    } finally {
      setIsSigningIn(null);
    }
  };

  // Show loading spinner while checking auth state
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

  // Don't render login if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* App Logo */}
          <div className="mb-8 flex justify-center">
            <ProgressTrackerLogo size={80} textSize="xl" />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login Options */}
          <div className="space-y-4">
            {/* Student Login Button */}
            <button
              onClick={handleStudentSignIn}
              disabled={isSigningIn !== null || loading}
              className="w-full bg-white border-2 border-blue-300 rounded-xl px-6 py-5 text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-h-[88px]"
            >
              {isSigningIn === 'student' ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  <span>Signing in as Student...</span>
                </div>
              ) : (
                <>
                  {/* Student Icon */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Login as Student</h3>
                    <p className="text-sm text-gray-600">Take assessments and track your progress</p>
                  </div>
                  
                  {/* Google Icon */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </button>

            {/* Tutor Login Button */}
            <button
              onClick={handleTutorSignIn}
              disabled={isSigningIn !== null || loading}
              className="w-full bg-white border-2 border-green-300 rounded-xl px-6 py-5 text-gray-700 font-medium hover:bg-green-50 hover:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-h-[88px]"
            >
              {isSigningIn === 'tutor' ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  <span>Signing in as Tutor...</span>
                </div>
              ) : (
                <>
                  {/* Tutor Icon */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Login as Tutor</h3>
                    <p className="text-sm text-gray-600">Create assessments and manage curriculum</p>
                  </div>
                  
                  {/* Google Icon */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Gmail Requirement Notice */}
          <p className="mt-4 text-xs text-gray-500">
            Gmail account required • Secure sign-in with Google
          </p>

          {/* Features List */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Progress Tracker Features:
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                Cambridge Lower Secondary Mathematics
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                Interactive assessments with digital canvas
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                Real-time progress tracking & analytics
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-2"></div>
                iPad-optimized learning experience
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}

// Alternative minimal login component for embedded use
export const MiniLogin: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Sign In Required
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Please sign in with your Gmail account to continue
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleSignIn}
        disabled={isSigningIn || loading}
        className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {isSigningIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign in with Google</span>
        )}
      </button>
    </div>
  );
};