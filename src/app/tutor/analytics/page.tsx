import TutorAnalytics from '@/components/TutorAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TutorAnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="mb-6">
            <Link
              href="/tutor"
              className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Tutor Dashboard
            </Link>
          </div>
          
          <TutorAnalytics />
        </div>
      </div>
    </ProtectedRoute>
  );
}