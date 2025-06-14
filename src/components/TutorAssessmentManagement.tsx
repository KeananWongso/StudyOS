'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus,
  BarChart3,
  Clock,
  Target,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface AssessmentWithStats {
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
  score: number;
  completedAt: any;
  dayId: string;
}

export default function TutorAssessmentManagement() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentWithStats[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadTutorData();
    }
  }, [user?.email]);

  const loadTutorData = async () => {
    try {
      setLoading(true);
      
      // Load assessments created by this tutor
      const assessmentsResponse = await fetch(`/api/tutor/assessments?tutorEmail=${encodeURIComponent(user?.email || '')}`);
      const assessmentsData = await assessmentsResponse.json();
      console.log('Tutor assessments:', assessmentsData);
      setAssessments(assessmentsData.assessments || []);
      
      // Load all student responses
      const responsesResponse = await fetch('/api/tutor/responses');
      const responsesData = await responsesResponse.json();
      console.log('All responses:', responsesData);
      setResponses(responsesData.responses || []);
      
    } catch (error) {
      console.error('Error loading tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResponsesForAssessment = (assessmentId: string) => {
    return responses.filter(response => {
      // Match by assessment ID, day ID, or day number
      const dayMatch = response.dayId === assessmentId || response.assessmentId === assessmentId;
      const dayNumberMatch = response.dayId === assessmentId.toString() || response.dayId === `${assessmentId}`;
      return dayMatch || dayNumberMatch;
    });
  };

  const getAverageScore = (assessmentId: string) => {
    const assessmentResponses = getResponsesForAssessment(assessmentId);
    if (assessmentResponses.length === 0) return 0;
    
    const totalScore = assessmentResponses.reduce((sum, response) => sum + (response.score || 0), 0);
    return Math.round(totalScore / assessmentResponses.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assessment Management
              </h1>
              <p className="text-gray-600">
                Manage your assessments and review student responses
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/tutor/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
              <Link
                href="/tutor/overview"
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <BarChart3 size={16} />
                Overview
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{assessments.length}</div>
                <div className="text-sm text-gray-600">Total Assessments</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{responses.length}</div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(responses.map(r => r.studentEmail)).size}
                </div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {assessments.length > 0 ? Math.round(responses.length / assessments.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Responses/Assessment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Your Assessments
          </h2>
          
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
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const assessmentResponses = getResponsesForAssessment(assessment.id);
                const averageScore = getAverageScore(assessment.id);
                
                return (
                  <div
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Day {assessment.day}: {assessment.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span>{assessment.questions?.length || 0} questions</span>
                          <span>{assessment.totalPoints || 0} points</span>
                          <span>Created {assessment.createdAt ? new Date(assessment.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/tutor/responses?assessmentId=${assessment.id}`}
                          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Eye size={16} />
                          View Responses ({assessmentResponses.length})
                        </Link>
                      </div>
                    </div>
                    
                    {/* Assessment Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{assessmentResponses.length}</div>
                        <div className="text-sm text-gray-600">Responses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{averageScore}%</div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(assessmentResponses.map(r => r.studentEmail)).size}
                        </div>
                        <div className="text-sm text-gray-600">Unique Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {assessmentResponses.length > 0 ? 'Active' : 'Waiting'}
                        </div>
                        <div className="text-sm text-gray-600">Status</div>
                      </div>
                    </div>
                    
                    {/* Recent Responses Preview */}
                    {assessmentResponses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Responses</h4>
                        <div className="space-y-2">
                          {assessmentResponses.slice(0, 3).map((response) => (
                            <div key={response.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{response.displayName || response.studentEmail}</span>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  (response.score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                                  (response.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {response.score || 0}%
                                </span>
                                <span className="text-gray-500">
                                  {response.completedAt ? new Date(response.completedAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                </span>
                              </div>
                            </div>
                          ))}
                          {assessmentResponses.length > 3 && (
                            <div className="text-sm text-gray-500 text-center pt-2">
                              and {assessmentResponses.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}