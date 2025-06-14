'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Play, TrendingUp } from 'lucide-react';
import { CompactProgressTrackerLogo } from './ProgressTrackerLogo';
import { useAuth } from './AuthProvider';
import UserMenu from './UserMenu';

export default function StudentViewPreview() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRealStudentData();
  }, []);

  const loadRealStudentData = async () => {
    try {
      setLoading(true);
      
      // Get real assessments
      const assessmentsResponse = await fetch('/api/assessments');
      const assessmentsData = await assessmentsResponse.json();
      setAssessments(assessmentsData.assessments || []);
      
      // Get all student responses to show real completion data
      const responsesResponse = await fetch('/api/tutor/responses');
      const responsesData = await responsesResponse.json();
      setResponses(responsesData.responses || []);
      
    } catch (error) {
      console.error('Error loading student preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student preview...</p>
        </div>
      </div>
    );
  }
  
  // Calculate real statistics
  const completedAssessmentIds = new Set(responses.map(r => r.dayId || r.assessmentId));
  const completedCount = completedAssessmentIds.size;
  const totalAssessments = assessments.length;
  const hasCompletedAssessments = completedCount > 0;
  const totalQuestionsAttempted = responses.reduce((total, response) => {
    return total + (Object.keys(response.answers || {}).length || 0);
  }, 0);
  
  // Calculate average accuracy from real responses
  const totalCorrect = responses.reduce((total, response) => {
    if (response.answers) {
      return total + Object.values(response.answers).filter((answer: any) => answer.isCorrect).length;
    }
    return total;
  }, 0);
  const overallAccuracy = totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Preview Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            <div>
              <strong className="text-amber-800">Student View Preview</strong>
              <p className="text-sm text-amber-700 mt-1">
                This matches the actual student experience - clean interface without AI suggestions
              </p>
            </div>
          </div>
        </div>

        {/* Header - matching actual student dashboard */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <CompactProgressTrackerLogo size={48} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Progress Tracker
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}! Ready to continue your Cambridge Math journey?
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{completedCount > 0 ? Math.round((completedCount / totalAssessments) * 100) : 0}%</div>
                <div className="text-sm text-gray-700">Course Progress</div>
              </div>
              <UserMenu />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedCount} of {totalAssessments} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completedCount > 0 ? (completedCount / totalAssessments) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* My Learning Dashboard Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600 mb-6">Track your progress and identify areas for improvement</p>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Progress</h2>
          
          {/* Progress Stats - Real data from actual student responses */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-blue-900">{overallAccuracy}%</span>
              </div>
              <div className="text-sm text-blue-700">Overall Accuracy</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-xl font-bold text-green-900">{completedCount}/{totalAssessments}</span>
              </div>
              <div className="text-sm text-green-700">Assessments Completed</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-xl font-bold text-orange-900">{hasCompletedAssessments ? Math.max(0, Math.floor((100 - overallAccuracy) / 20)) : 0}</span>
              </div>
              <div className="text-sm text-orange-700">Areas to Improve</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-xl font-bold text-purple-900">{totalQuestionsAttempted}</span>
              </div>
              <div className="text-sm text-purple-700">Questions Attempted</div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Assessments</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assessments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Available</h3>
                  <p className="text-gray-600 mb-4">Your tutor hasn't created any assessments yet.</p>
                  <p className="text-sm text-gray-500">Check back later or contact your tutor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assessments.map((assessment) => {
                    const isCompleted = completedAssessmentIds.has(assessment.id);
                    
                    return (
                      <div
                        key={assessment.id}
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-lg font-semibold text-gray-900">
                                Day {assessment.day}: {assessment.title}
                              </span>
                              {isCompleted && (
                                <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <span>{assessment.questions?.length || 0} questions</span>
                              <span>{assessment.totalPoints || 0} points</span>
                              <span className="capitalize">{assessment.chapter?.replace('_', ' ')}</span>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                              isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}>
                              {isCompleted ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Clean and minimal, no AI suggestions */}
          <div className="space-y-6">
            {/* Note: No performance summary, focus areas, or recommendations shown to students */}
            {/* Students only see results link when they have completed assessments */}
          </div>
        </div>
      </div>
    </div>
  );
}