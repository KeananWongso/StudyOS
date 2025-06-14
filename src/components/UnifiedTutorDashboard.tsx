'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
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
  MessageSquare,
  Save,
  ArrowLeft,
  AlertTriangle,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { CompactProgressTrackerLogo } from './ProgressTrackerLogo';
import UserMenu from './UserMenu';
import StudentViewPreview from './StudentViewPreview';

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

export default function UnifiedTutorDashboard() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<StudentResponse | null>(null);
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const [manualGrades, setManualGrades] = useState<{ [questionId: string]: any }>({});
  const [viewMode, setViewMode] = useState<'tutor' | 'student'>('tutor');

  useEffect(() => {
    if (user?.email) {
      loadDashboardData();
    }
  }, [user?.email]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load assessments created by this tutor
      const assessmentsResponse = await fetch(`/api/tutor/assessments?tutorEmail=${encodeURIComponent(user?.email || '')}`);
      const assessmentsData = await assessmentsResponse.json();
      setAssessments(assessmentsData.assessments || []);
      
      // Load all student responses
      const responsesResponse = await fetch('/api/tutor/responses');
      const responsesData = await responsesResponse.json();
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

  const getResponsesForAssessment = (assessmentId: string) => {
    return responses.filter(response => 
      response.assessmentId === assessmentId || 
      response.dayId === assessmentId ||
      response.dayId === assessmentId.toString()
    );
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
    // TODO: Implement saving manual grades to database
    console.log('Saving manual grades:', manualGrades);
    alert('Manual grading saved! (Feature coming soon)');
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

  if (viewMode === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CompactProgressTrackerLogo size={48} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Student View Preview
                  </h1>
                  <p className="text-gray-600">
                    Preview of the exact student experience
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewMode('tutor')}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-full font-semibold hover:bg-blue-100 transition-all duration-300"
                >
                  <GraduationCap className="h-4 w-4" />
                  Back to Tutor View
                </button>
                <UserMenu />
              </div>
            </div>
          </div>
          <StudentViewPreview />
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
                href="/tutor"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create Assessment
              </Link>
              <button 
                onClick={() => setViewMode('student')}
                className="flex items-center gap-2 px-4 py-2 border-2 border-green-500 bg-green-50 text-green-700 rounded-full font-semibold hover:bg-green-100 transition-all duration-300"
              >
                <Users className="h-4 w-4" />
                View as Student
              </button>
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
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Your Assessments ({assessments.length})
              </h2>
              <Link
                href="/tutor"
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
                  href="/tutor"
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
                        <button className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
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
    </div>
  );
}

// Response Viewer Modal Component
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
                  <div className="text-sm text-gray-600 mb-2">
                    Student Answer: <span className="font-medium">{String(answer.answer)}</span>
                  </div>
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Manual Grading Override</h4>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onGradeChange(questionId, 'isCorrect', !answer.isCorrect)}
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      manualGrades[questionId]?.isCorrect !== undefined 
                        ? (manualGrades[questionId].isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white')
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {answer.isCorrect ? 'Mark as Incorrect' : 'Mark as Correct'}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Points:</label>
                    <input
                      type="number"
                      min="0"
                      max={answer.maxPoints || 5}
                      defaultValue={answer.pointsEarned || 0}
                      onChange={(e) => onGradeChange(questionId, 'points', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">/ {answer.maxPoints || 5}</span>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Add feedback..."
                    onChange={(e) => onGradeChange(questionId, 'feedback', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
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