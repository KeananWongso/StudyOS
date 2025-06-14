'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorDashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new unified home page
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to unified dashboard...</p>
      </div>
    </div>
  );
}