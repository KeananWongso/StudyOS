import AssessmentTaker from '@/components/AssessmentTaker';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AssessmentPageProps {
  params: {
    day: string;
  };
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  return (
    <ProtectedRoute>
      <AssessmentTaker assessmentId={params.day} />
    </ProtectedRoute>
  );
}