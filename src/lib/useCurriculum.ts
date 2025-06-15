'use client';

import { useState, useEffect } from 'react';
import { SimplifiedCurriculum, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from './simplified-curriculum';

export interface CurriculumHookReturn {
  curriculum: SimplifiedCurriculum | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to load curriculum from Firestore for a specific user
 * Falls back to SIMPLIFIED_CAMBRIDGE_CURRICULUM only if:
 * 1. User hasn't imported custom curriculum yet
 * 2. API call fails
 * 3. Network issues
 */
export const useCurriculum = (userEmail: string | null | undefined): CurriculumHookReturn => {
  const [curriculum, setCurriculum] = useState<SimplifiedCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurriculum = async () => {
    if (!userEmail) {
      setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading curriculum for user:', userEmail);
      
      const response = await fetch(`/api/curriculum?userEmail=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded curriculum from Firestore:', data.name || data.id);
        setCurriculum(data);
      } else {
        console.warn('No custom curriculum found, using default');
        setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
      }
    } catch (error) {
      console.error('Failed to load curriculum from Firestore:', error);
      setError('Failed to load curriculum');
      // Fallback to simplified curriculum only if API fails
      setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, [userEmail]);

  const refetch = async () => {
    await loadCurriculum();
  };

  return { 
    curriculum, 
    loading, 
    error, 
    refetch 
  };
};

/**
 * Utility function to get curriculum for a specific user (non-hook version)
 * Useful for server-side or one-time calls
 */
export const getCurriculumForUser = async (userEmail: string): Promise<SimplifiedCurriculum> => {
  try {
    console.log('Fetching curriculum for user:', userEmail);
    
    // For server-side calls, directly access Firestore instead of using fetch
    if (typeof window === 'undefined') {
      // Server-side: directly import and use Firestore
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      
      const curriculumRef = doc(db, 'curriculum', userEmail);
      const curriculumSnap = await getDoc(curriculumRef);
      
      if (curriculumSnap.exists()) {
        const data = curriculumSnap.data() as SimplifiedCurriculum;
        console.log('Fetched curriculum from Firestore (server-side):', data.name || data.id);
        return data;
      } else {
        console.warn('No custom curriculum found for user, using default');
        return SIMPLIFIED_CAMBRIDGE_CURRICULUM;
      }
    } else {
      // Client-side: use fetch API
      const response = await fetch(`/api/curriculum?userEmail=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched curriculum from Firestore (client-side):', data.name || data.id);
        return data;
      } else {
        console.warn('No custom curriculum found for user, using default');
        return SIMPLIFIED_CAMBRIDGE_CURRICULUM;
      }
    }
  } catch (error) {
    console.error('Failed to fetch curriculum from Firestore:', error);
    // Fallback to simplified curriculum only if API fails
    return SIMPLIFIED_CAMBRIDGE_CURRICULUM;
  }
};

/**
 * Hook specifically for tutors to load their curriculum
 * This is the curriculum they've imported/customized
 */
export const useTutorCurriculum = (tutorEmail: string | null | undefined) => {
  return useCurriculum(tutorEmail);
};

/**
 * Hook for students to load their tutor's curriculum
 * Students see the curriculum their tutor has set up
 */
export const useStudentCurriculum = (tutorEmail: string | null | undefined) => {
  return useCurriculum(tutorEmail);
};