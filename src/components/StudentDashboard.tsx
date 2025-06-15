'use client';

import { useState, useEffect } from 'react';
import { AssessmentData, Analytics, WeaknessItem, StudentResponse } from '@/lib/types';
import { Play, CheckCircle, BookOpen, TrendingUp, Target, MessageSquare, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUserEmail, useAuth } from './AuthProvider';
import { useCurriculum } from '@/lib/useCurriculum';
import UserMenu from './UserMenu';
import { CompactProgressTrackerLogo } from './ProgressTrackerLogo';

export default function StudentDashboard() {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedAssessments, setCompletedAssessments] = useState<Set<string>>(new Set());
  const [tutorEmail, setTutorEmail] = useState<string | null>(null);

  const userEmail = useCurrentUserEmail();
  const { user } = useAuth();
  
  // Load tutor's curriculum (students see their tutor's imported curriculum)
  const { curriculum, loading: curriculumLoading } = useCurriculum(tutorEmail);

  useEffect(() => {
    fetchDashboardData();
  }, [userEmail]);

  // Add visibility change listener to refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userEmail) {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userEmail]);

  const fetchDashboardData = async () => {
    if (!userEmail) return;
    
    try {
      setIsLoading(true);
      
      // Fetch assessments
      const assessmentsResponse = await fetch('/api/assessments');
      const assessmentsData = await assessmentsResponse.json();
      console.log('Fetched assessments:', assessmentsData);
      const fetchedAssessments = assessmentsData.assessments || [];
      setAssessments(fetchedAssessments);
      
      // Extract tutor email from first assessment to load their curriculum
      if (fetchedAssessments.length > 0 && fetchedAssessments[0].createdBy) {
        setTutorEmail(fetchedAssessments[0].createdBy);
        console.log('Found tutor email:', fetchedAssessments[0].createdBy);
      }

      // Fetch user responses to determine completed assessments
      const responsesResponse = await fetch(`/api/responses?userEmail=${encodeURIComponent(userEmail)}`);
      const responsesData = await responsesResponse.json();
      const allResponses = responsesData.responses || [];
      
      // Filter responses to only include those for existing assessments
      const validAssessmentIds = new Set(fetchedAssessments.map(a => a.id));
      const validResponses = allResponses.filter((r: any) => {
        const assessmentId = r.assessmentId || r.dayId;
        return validAssessmentIds.has(assessmentId);
      });
      
      setResponses(validResponses);
      const completed = new Set(validResponses.map((r: any) => r.assessmentId || r.dayId).filter(Boolean) || []);
      setCompletedAssessments(completed);
      
      console.log(`Filtered responses: ${allResponses.length} -> ${validResponses.length} valid responses`);
      console.log(`Completed assessments: ${completed.size}/${fetchedAssessments.length}`);

      // Fetch analytics
      const analyticsResponse = await fetch(`/api/analytics?userEmail=${encodeURIComponent(userEmail)}`);
      const analyticsData = await analyticsResponse.json();
      
      // Convert WeaknessAnalysis to expected Analytics format
      const convertedAnalytics = {
        overallProgress: Math.round(analyticsData.averageAccuracy * 100),
        strongChapters: analyticsData.strongTopics?.map((topic: any) => topic.topicPath) || [],
        weakChapters: analyticsData.weakTopics?.map((topic: any) => topic.topicPath) || []
      };
      
      setAnalytics(convertedAnalytics);
      
      // Convert WeaknessAnalysis to expected weakness format
      const convertedWeaknesses = analyticsData.weakTopics?.map((topic: any) => ({
        chapter: topic.displayName || topic.topicPath,
        score: Math.round(topic.accuracy * 100),
        recommendedStudyTime: 15 // Default recommendation
      })) || [];
      
      setWeaknesses(convertedWeaknesses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssessmentStatus = (assessmentId: string) => {
    return completedAssessments.has(assessmentId) ? 'completed' : 'available';
  };

  const getProgressPercentage = () => {
    if (assessments.length === 0) return 0;
    return Math.round((completedAssessments.size / assessments.length) * 100);
  };

  const getTotalQuestionsAttempted = () => {
    return responses.reduce((total, response) => {
      return total + (Object.keys(response.answers || {}).length || 0);
    }, 0);
  };

  const getOverallAccuracy = () => {
    if (!analytics) return 0;
    return analytics.overallProgress;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
                <div className="text-3xl font-bold text-blue-600">{getProgressPercentage()}%</div>
                <div className="text-sm text-gray-700">Course Progress</div>
              </div>
              <UserMenu />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedAssessments.size} of {assessments.length} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* My Learning Dashboard Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600 mb-6">Track your progress and identify areas for improvement</p>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Progress</h2>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-blue-900">{getOverallAccuracy()}%</span>
              </div>
              <div className="text-sm text-blue-700">Overall Accuracy</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-xl font-bold text-green-900">{completedAssessments.size}/{assessments.length}</span>
              </div>
              <div className="text-sm text-green-700">Assessments Completed</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-xl font-bold text-orange-900">{weaknesses.length}</span>
              </div>
              <div className="text-sm text-orange-700">Areas to Improve</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-xl font-bold text-purple-900">{getTotalQuestionsAttempted()}</span>
              </div>
              <div className="text-sm text-purple-700">Questions Attempted</div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Assessments</h2>
        </div>

        {/* My Learning Progress Section - Only show if there are completed assessments */}
        {completedAssessments.size > 0 && analytics && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Learning Progress</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Current Performance Level</span>
                  <span className="text-lg font-bold text-blue-600">{analytics.overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Results with Feedback */}
        {responses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Assessment Results</h2>
            <div className="space-y-4">
              {responses.slice(0, 3).map((response) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Day {response.dayId}</h3>
                      <p className="text-sm text-gray-600">
                        Completed: {new Date(response.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {response.status === 'completed' && response.totalScore !== undefined ? (
                        <div className={`text-lg font-bold ${
                          response.totalScore >= 80 ? 'text-green-600' :
                          response.totalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {response.totalScore}%
                        </div>
                      ) : response.status === 'in_review' ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Clock size={16} />
                          <span className="text-sm font-medium">Under Review</span>
                        </div>
                      ) : response.status === 'pending' ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock size={16} />
                          <span className="text-sm font-medium">Pending Review</span>
                        </div>
                      ) : (
                        <div className={`text-lg font-bold ${
                          response.score >= 80 ? 'text-green-600' :
                          response.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {response.score}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                    response.status === 'completed' ? 'bg-green-100 text-green-800' :
                    response.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                    response.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {response.status === 'completed' ? '✅ Reviewed & Graded' :
                     response.status === 'in_review' ? '📝 Under Review' :
                     response.status === 'pending' ? '⏱️ Awaiting Review' :
                     '📊 Auto-Graded'
                    }
                  </div>
                  
                  {/* Show tutor feedback if available (new review workflow) */}
                  {response.status === 'completed' && response.tutorFeedback && response.tutorFeedback.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} />
                        Tutor Feedback
                      </h4>
                      <div className="space-y-3">
                        {response.tutorFeedback.map((feedback: any, index: number) => (
                          <div key={feedback.questionId} className="border-l-2 border-blue-300 pl-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-blue-800 text-sm">Question {index + 1}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {feedback.grade}/{feedback.maxPoints} points
                                </span>
                                {feedback.isCorrect && <Star size={12} className="text-yellow-500" />}
                              </div>
                            </div>
                            <p className="text-blue-700 text-sm">{feedback.tutorFeedback}</p>
                          </div>
                        ))}
                      </div>
                      
                      {response.reviewCompletedAt && (
                        <div className="text-xs text-blue-600 mt-3 pt-2 border-t border-blue-200">
                          Reviewed on {new Date(response.reviewCompletedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Legacy feedback display for old format */}
                  {!response.tutorFeedback && response.answers && Object.values(response.answers).some((answer: any) => answer.tutorFeedback) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <MessageSquare size={16} />
                        Tutor Feedback
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(response.answers).map(([questionId, answer]: [string, any], index) => (
                          answer.tutorFeedback && (
                            <div key={questionId} className="text-sm">
                              <span className="font-medium text-blue-800">Question {index + 1}:</span>
                              <span className="text-blue-700 ml-2">{answer.tutorFeedback}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(response.manuallyGraded || response.status === 'completed') && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-purple-600">
                      <CheckCircle size={14} />
                      Reviewed by tutor
                      {response.reviewedBy && (
                        <span className="text-purple-500">• {response.reviewedBy.split('@')[0]}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                  const status = getAssessmentStatus(assessment.id);
                  const isCompleted = status === 'completed';
                  
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
                            <span>{assessment.questions.length} questions</span>
                            <span>{assessment.totalPoints} points</span>
                            <span className="capitalize">{assessment.chapter.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Link
                            href={`/assessment/${assessment.id}`}
                            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                              isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
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
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Summary - Only show if there are completed assessments */}
            {completedAssessments.size > 0 && analytics && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Performance
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.overallProgress}%</div>
                    <div className="text-sm text-gray-700">Average Score</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{analytics.strongChapters.length}</div>
                      <div className="text-xs text-gray-700">Strong Areas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">{analytics.weakChapters.length}</div>
                      <div className="text-xs text-gray-700">Areas to Improve</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Note: Focus Areas, Recommendations, and Quick Actions are hidden from students */}
            {/* These features are only visible to tutors to maintain appropriate student experience */}
            
            {/* Only show a simple results link if there are completed assessments */}
            {completedAssessments.size > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">View Results</h3>
                
                <div className="space-y-3">
                  <Link
                    href="/results"
                    className="block w-full text-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    View Detailed Results
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}