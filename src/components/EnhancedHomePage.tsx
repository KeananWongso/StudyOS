'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Users, 
  FileText, 
  TrendingUp, 
  Eye, 
  Edit3, 
  Trash2, 
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Save,
  ArrowLeft,
  AlertTriangle,
  Target,
  Play,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { CompactProgressTrackerLogo } from './ProgressTrackerLogo';
import UserMenu from './UserMenu';
import StudentDashboard from './StudentDashboard';
import { SimplifiedCurriculum, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

// Tutor interfaces
interface Assessment {
  id: string;
  title: string;
  day: number;
  questions: any[];
  totalPoints: number;
  responseCount: number;
  createdBy: string;
  creatorName: string;
  createdAt: any;
  status: string;
}

interface StudentResponse {
  id: string;
  studentEmail: string;
  displayName: string;
  assessmentTitle: string;
  assessmentId: string;
  dayId: string;
  score: number;
  completedAt: any;
  answers: { [questionId: string]: any };
  submittedBy?: string;
}

interface ActivityItem {
  id: string;
  studentEmail: string;
  studentName: string;
  action: 'completed' | 'started' | 'submitted';
  assessmentTitle: string;
  score?: number;
  timestamp: Date;
}

export default function EnhancedHomePage() {
  const { user, loading } = useAuth();
  
  // Show loading while determining user role
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show student dashboard for students
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  // Show tutor dashboard for tutors
  if (user?.role === 'tutor') {
    return <TutorHomeDashboard />;
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Tutor Home Dashboard Component
function TutorHomeDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [curriculum, setCurriculum] = useState<SimplifiedCurriculum>(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<StudentResponse | null>(null);
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const [manualGrades, setManualGrades] = useState<{ [questionId: string]: any }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadDashboardData();
      loadCurriculum();
    }
  }, [user?.email]);

  // Check for refresh parameter from URL and reload data
  useEffect(() => {
    const refreshData = searchParams?.get('refreshData');
    if (refreshData === 'true' && user?.email) {
      console.log('Refresh parameter detected, reloading dashboard data...');
      loadDashboardData();
      // Remove the parameter from URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, user?.email]);

  // Add visibility change listener to refresh data when returning to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.email) {
        console.log('Page visible again, refreshing dashboard data...');
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.email]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data for tutor:', user?.email);
      
      // Load assessments created by this tutor
      const assessmentUrl = `/api/tutor/assessments?tutorEmail=${encodeURIComponent(user?.email || '')}`;
      console.log('Fetching from URL:', assessmentUrl);
      const assessmentsResponse = await fetch(assessmentUrl);
      console.log('Assessment response status:', assessmentsResponse.status);
      const assessmentsData = await assessmentsResponse.json();
      console.log('Tutor assessments response:', assessmentsData);
      console.log('Number of assessments found:', assessmentsData.assessments?.length || 0);
      setAssessments(assessmentsData.assessments || []);
      
      // Load all student responses
      const responsesResponse = await fetch('/api/tutor/responses');
      const responsesData = await responsesResponse.json();
      console.log('Student responses response:', responsesData);
      setResponses(responsesData.responses || []);
      
      // Generate activity feed from responses
      const activityItems = (responsesData.responses || []).map((response: any) => ({
        id: response.id,
        studentEmail: response.studentEmail || response.submittedBy,
        studentName: response.displayName || response.studentEmail?.split('@')[0] || 'Unknown',
        action: 'completed' as const,
        assessmentTitle: response.assessmentTitle || `Day ${response.dayId}`,
        score: response.score,
        timestamp: new Date(response.completedAt?.seconds * 1000 || response.completedAt)
      })).sort((a: ActivityItem, b: ActivityItem) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setActivities(activityItems);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculum = async () => {
    try {
      const response = await fetch(`/api/curriculum?userEmail=${encodeURIComponent(user?.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setCurriculum(data);
      }
    } catch (error) {
      console.error('Error loading curriculum:', error);
    }
  };

  const getResponsesForAssessment = (assessmentId: string) => {
    const matchingResponses = responses.filter(response => {
      // Try multiple matching strategies
      const matches = [
        response.assessmentId === assessmentId,
        response.dayId === assessmentId,
        response.dayId === assessmentId.toString(),
        response.assessmentId === assessmentId.toString(),
        // Also try matching by day number if the assessment has a day field
        response.dayId === `day-${assessmentId}`,
        response.dayId === `${assessmentId}`
      ];
      return matches.some(match => match);
    });
    
    console.log(`Responses for assessment ${assessmentId}:`, matchingResponses);
    return matchingResponses;
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const responseCount = getResponsesForAssessment(assessment.id).length;
    if (responseCount === 0) return { icon: FileText, color: 'gray', text: 'No responses' };
    if (responseCount < 3) return { icon: Clock, color: 'yellow', text: `${responseCount} response${responseCount > 1 ? 's' : ''}` };
    return { icon: CheckCircle, color: 'green', text: `${responseCount} responses` };
  };

  const openResponseViewer = (assessmentId: string) => {
    const assessmentResponses = getResponsesForAssessment(assessmentId);
    if (assessmentResponses.length > 0) {
      setSelectedResponse(assessmentResponses[0]);
      setShowResponseViewer(true);
      setManualGrades({});
    }
  };

  const handleManualGradeChange = (questionId: string, field: string, value: any) => {
    setManualGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const saveManualGrades = async () => {
    if (!selectedResponse) return;
    
    try {
      console.log('Saving manual grades:', manualGrades);
      
      const response = await fetch('/api/responses/manual-grade', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseId: selectedResponse.id,
          studentEmail: selectedResponse.studentEmail,
          manualGrades,
          gradedBy: user?.email,
          gradedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Manual grading saved successfully!');
        // Refresh the dashboard data to show updated grades
        await loadDashboardData();
        setShowResponseViewer(false);
        setManualGrades({});
      } else {
        console.error('Failed to save manual grades');
        alert('Failed to save grades. Please try again.');
      }
    } catch (error) {
      console.error('Error saving manual grades:', error);
      alert('Error saving grades. Please try again.');
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAssessment = async () => {
    if (!assessmentToDelete) return;

    try {
      console.log('Deleting assessment:', assessmentToDelete.id);
      
      const response = await fetch('/api/assessments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: assessmentToDelete.id }),
      });

      if (response.ok) {
        console.log('Assessment deleted successfully');
        // Refresh the data to reflect the deletion
        await loadDashboardData();
        setShowDeleteConfirm(false);
        setAssessmentToDelete(null);
      } else {
        console.error('Failed to delete assessment');
        alert('Failed to delete assessment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Error deleting assessment. Please try again.');
    }
  };

  const getStudentsNeedingAttention = () => {
    const studentStats = new Map();
    
    responses.forEach(response => {
      const email = response.studentEmail;
      if (!studentStats.has(email)) {
        studentStats.set(email, {
          email,
          name: response.displayName || email.split('@')[0],
          scores: [],
          totalScore: 0,
          responseCount: 0
        });
      }
      
      const stats = studentStats.get(email);
      stats.scores.push(response.score);
      stats.totalScore += response.score;
      stats.responseCount++;
    });
    
    return Array.from(studentStats.values())
      .map(student => ({
        ...student,
        averageScore: student.totalScore / student.responseCount
      }))
      .filter(student => student.averageScore < 70)
      .sort((a, b) => a.averageScore - b.averageScore);
  };

  const getQuickStats = () => {
    const uniqueStudents = new Set(responses.map(r => r.studentEmail)).size;
    const totalResponses = responses.length;
    const avgScore = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.score, 0) / responses.length 
      : 0;
    
    return {
      totalAssessments: assessments.length,
      totalResponses,
      activeStudents: uniqueStudents,
      averageScore: Math.round(avgScore)
    };
  };

  const quickStats = getQuickStats();
  const studentsNeedingAttention = getStudentsNeedingAttention();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CompactProgressTrackerLogo size={48} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Progress Tracker - Tutor Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome, {user?.displayName?.split(' ')[0] || 'Tutor'}! Manage your assessments and track student progress
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/create-assessment"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create Assessment
              </Link>
              <Link
                href="/tutor/analytics"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Brain size={16} />
                Analytics
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{quickStats.totalAssessments}</div>
                <div className="text-sm text-gray-600">Assessments Created</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{quickStats.totalResponses}</div>
                <div className="text-sm text-gray-600">Student Responses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{quickStats.activeStudents}</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{quickStats.averageScore}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assessments Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Assessments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Your Assessments ({assessments.length})
                </h2>
                <Link
                  href="/create-assessment"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Plus size={14} />
                  Create New
                </Link>
              </div>
              
              {assessments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Created</h3>
                  <p className="text-gray-600 mb-6">Start by creating your first assessment</p>
                  <Link
                    href="/create-assessment"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Create First Assessment
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessments.map((assessment) => {
                    const status = getAssessmentStatus(assessment);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div
                        key={assessment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Day {assessment.day}: {assessment.title}
                            </h3>
                            <div className="text-sm text-gray-600">
                              {assessment.questions?.length || 0} questions • {assessment.totalPoints || 0} points
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${
                            status.color === 'green' ? 'bg-green-100 text-green-700' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            <StatusIcon size={14} />
                            {status.text}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openResponseViewer(assessment.id)}
                            disabled={getResponsesForAssessment(assessment.id).length === 0}
                            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Eye size={14} />
                            View Responses
                          </button>
                          <Link
                            href={`/create-assessment?edit=${assessment.id}`}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Edit3 size={14} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteAssessment(assessment)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Curriculum Quick Access */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Curriculum Quick Access
                </h2>
                <Link
                  href="/curriculum"
                  className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  <Edit3 size={14} />
                  Manage
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curriculum.strands.slice(0, 4).map((strand) => (
                  <div key={strand.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: strand.color }}
                      ></div>
                      <h3 className="font-medium text-gray-900">{strand.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {strand.chapters.length} chapters • {strand.chapters.reduce((sum, ch) => sum + ch.subtopics.length, 0)} topics
                    </p>
                    <Link
                      href={`/create-assessment?strand=${strand.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Create assessment for this strand →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity & Attention Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.studentName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {activity.action} {activity.assessmentTitle}
                        {activity.score !== undefined && ` (${activity.score}%)`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Students Needing Attention */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Students Needing Attention
              </h3>
              <div className="space-y-3">
                {studentsNeedingAttention.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-600">All students performing well!</p>
                  </div>
                ) : (
                  studentsNeedingAttention.slice(0, 3).map((student) => (
                    <div key={student.email} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-orange-700">
                        Average: {Math.round(student.averageScore)}% ({student.responseCount} assessments)
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Needs support with core concepts
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Viewer Modal */}
      {showResponseViewer && selectedResponse && (
        <ResponseViewerModal
          response={selectedResponse}
          assessment={assessments.find(a => a.id === selectedResponse.assessmentId)}
          onClose={() => setShowResponseViewer(false)}
          onGradeChange={handleManualGradeChange}
          onSave={saveManualGrades}
          manualGrades={manualGrades}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && assessmentToDelete && (
        <DeleteConfirmationModal
          assessment={assessmentToDelete}
          onConfirm={confirmDeleteAssessment}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setAssessmentToDelete(null);
          }}
        />
      )}
    </div>
  );
}

// Response Viewer Modal Component (same as before)
interface ResponseViewerModalProps {
  response: StudentResponse;
  assessment?: Assessment;
  onClose: () => void;
  onGradeChange: (questionId: string, field: string, value: any) => void;
  onSave: () => void;
  manualGrades: { [questionId: string]: any };
}

function ResponseViewerModal({ 
  response, 
  assessment, 
  onClose, 
  onGradeChange, 
  onSave, 
  manualGrades 
}: ResponseViewerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Student Response Review
              </h2>
              <p className="text-gray-600">
                {response.displayName} • {assessment?.title || 'Assessment'} • Score: {response.score}%
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(response.answers || {}).map(([questionId, answer]: [string, any], index) => (
            <div key={questionId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Question {index + 1}
                  </h3>
                  <div className="text-sm text-gray-900 mb-2">
                    Student Answer: <span className="font-semibold text-gray-900">{String(answer.answer)}</span>
                  </div>
                  
                  {/* Display canvas drawing if it exists */}
                  {response?.canvasDrawings?.[questionId] && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-900 mb-2 font-semibold">Canvas Drawing:</div>
                      <div className="border border-gray-200 rounded-lg p-2 bg-white">
                        <img 
                          src={response.canvasDrawings[questionId]} 
                          alt={`Student drawing for question ${index + 1}`}
                          className="max-w-full h-auto rounded"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm ${
                    answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {answer.isCorrect ? 'Correct' : 'Incorrect'} 
                    ({answer.pointsEarned || 0}/{answer.maxPoints || 5} points)
                  </div>
                </div>
              </div>

              {/* Manual Grading Controls */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Manual Grading Override</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onGradeChange(questionId, 'isCorrect', !answer.isCorrect)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        manualGrades[questionId]?.isCorrect !== undefined 
                          ? (manualGrades[questionId].isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white')
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {answer.isCorrect ? 'Mark as Incorrect' : 'Mark as Correct'}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-900">Points:</label>
                      <input
                        type="number"
                        min="0"
                        max={answer.maxPoints || 5}
                        defaultValue={answer.pointsEarned || 0}
                        onChange={(e) => onGradeChange(questionId, 'points', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <span className="text-sm font-medium text-gray-700">/ {answer.maxPoints || 5}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Feedback for student:</label>
                    <textarea
                      placeholder="Add feedback that the student will see..."
                      rows={2}
                      onChange={(e) => onGradeChange(questionId, 'feedback', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save size={16} />
              Save Manual Grades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  assessment: Assessment;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationModal({ assessment, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Assessment</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Are you sure you want to delete this assessment?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">
              Day {assessment.day}: {assessment.title}
            </div>
            <div className="text-sm text-gray-600">
              {assessment.questions?.length || 0} questions • {assessment.totalPoints || 0} points
            </div>
          </div>
          <p className="text-sm text-red-600 mt-3">
            ⚠️ This will also remove the assessment from all student dashboards and delete any associated responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Assessment
          </button>
        </div>
      </div>
    </div>
  );
}