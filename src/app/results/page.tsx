import EnhancedResults from '@/components/EnhancedResults';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <EnhancedResults />
    </ProtectedRoute>
  );
}