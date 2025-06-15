'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Target, TrendingUp, BookOpen, ArrowLeft } from 'lucide-react';
import { useCurrentUserEmail } from './AuthProvider';
import TopicBasedProgress from './TopicBasedProgress';

interface QuestionResult {
  questionId: string;
  question: string;
  studentAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  topicPath?: string;
  topicDisplay?: string;
}

interface AssessmentResult {
  id: string;
  assessmentTitle: string;
  completedAt: Date;
  totalScore: number;
  maxScore: number;
  timeSpent: number;
  questions: QuestionResult[];
}

export default function EnhancedResults() {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const userEmail = useCurrentUserEmail();
  const router = useRouter();

  useEffect(() => {
    if (userEmail) {
      loadResults();
    }
  }, [userEmail]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Fetch student responses
      const response = await fetch(`/api/responses?userEmail=${encodeURIComponent(userEmail!)}`);
      const data = await response.json();
      
      if (data.responses && data.responses.length > 0) {
        // Get unique assessment IDs to fetch assessment data
        const assessmentIds = [...new Set(data.responses.map((resp: any) => resp.assessmentId || resp.dayId))];
        
        // Fetch assessment data for all assessments
        const assessmentResponse = await fetch('/api/assessments');
        const assessmentData = await assessmentResponse.json();
        const assessmentMap = new Map();
        
        if (assessmentData.assessments) {
          assessmentData.assessments.forEach((assessment: any) => {
            assessmentMap.set(assessment.id, assessment);
          });
        }
        
        // Transform responses into results format with actual assessment data
        const assessmentResults: AssessmentResult[] = data.responses.map((resp: any) => {
          const assessmentId = resp.assessmentId || resp.dayId;
          const assessment = assessmentMap.get(assessmentId);
          
          return {
            id: resp.id,
            assessmentTitle: assessment?.title || `Day ${resp.dayId}: Assessment`,
            completedAt: new Date(resp.completedAt?.seconds ? resp.completedAt.seconds * 1000 : resp.completedAt),
            totalScore: resp.score || 0,
            maxScore: assessment?.totalPoints || Object.values(resp.answers).reduce((sum: number, answer: any) => 
              sum + (answer.maxPoints || 5), 0
            ),
            timeSpent: resp.timeSpent || 0,
            questions: Object.entries(resp.answers).map(([questionId, answer]: [string, any]) => {
              // Find the actual question from the assessment
              const actualQuestion = assessment?.questions?.find((q: any) => q.id === questionId);
              
              return {
                questionId,
                question: actualQuestion?.question || 'Question content not available',
                studentAnswer: answer.answer,
                correctAnswer: actualQuestion?.correctAnswer || actualQuestion?.answer || 'Answer not available',
                isCorrect: answer.isCorrect,
                pointsEarned: answer.pointsEarned || 0,
                maxPoints: actualQuestion?.points || answer.maxPoints || 5,
                topicPath: answer.topicPath || actualQuestion?.topicPath,
                topicDisplay: (answer.topicPath || actualQuestion?.topicPath) ? formatTopicPath(answer.topicPath || actualQuestion?.topicPath) : undefined
              };
            })
          };
        });
        
        setResults(assessmentResults);
        if (assessmentResults.length > 0) {
          setSelectedResult(assessmentResults[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTopicPath = (topicPath: string): string => {
    const parts = topicPath.split('/');
    return parts.map(part => 
      part.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(' → ');
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Results Yet</h1>
          <p className="text-gray-600 mb-6">Complete some assessments to see your progress and detailed results here.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Results</h1>
          <p className="text-gray-600">Review your performance and track your progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Assessments</h2>
              <div className="space-y-3">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedResult?.id === result.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{result.assessmentTitle}</h3>
                      <div className={`text-sm font-medium ${
                        (result.totalScore / result.maxScore) >= 0.8 ? 'text-green-600' :
                        (result.totalScore / result.maxScore) >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round((result.totalScore / result.maxScore) * 100)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.completedAt.toLocaleDateString()} • {formatTime(result.timeSpent)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="lg:col-span-2 space-y-6">
            {selectedResult && (
              <>
                {/* Assessment Overview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedResult.assessmentTitle}</h2>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        (selectedResult.totalScore / selectedResult.maxScore) >= 0.8 ? 'text-green-600' :
                        (selectedResult.totalScore / selectedResult.maxScore) >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedResult.totalScore}/{selectedResult.maxScore}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((selectedResult.totalScore / selectedResult.maxScore) * 100)}% Score
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{formatTime(selectedResult.timeSpent)}</div>
                        <div className="text-sm text-gray-600">Time Spent</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedResult.questions.filter(q => q.isCorrect).length}
                        </div>
                        <div className="text-sm text-gray-600">Correct</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedResult.questions.filter(q => !q.isCorrect).length}
                        </div>
                        <div className="text-sm text-gray-600">Incorrect</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((selectedResult.totalScore / selectedResult.maxScore) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          (selectedResult.totalScore / selectedResult.maxScore) >= 0.8 ? 'bg-green-500' :
                          (selectedResult.totalScore / selectedResult.maxScore) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(selectedResult.totalScore / selectedResult.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Review */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
                  <div className="space-y-4">
                    {selectedResult.questions.map((question, index) => (
                      <div key={question.questionId} className={`p-4 rounded-lg border-l-4 ${
                        question.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">Question {index + 1}</span>
                            {question.topicDisplay && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {question.topicDisplay}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {question.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="text-sm font-medium">
                              {question.pointsEarned}/{question.maxPoints} pts
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <p className="mb-1"><strong>Question:</strong> {question.question}</p>
                          <p className="mb-1"><strong>Your Answer:</strong> {String(question.studentAnswer)}</p>
                          {!question.isCorrect && question.correctAnswer && question.correctAnswer !== 'Answer not available' && (
                            <p className="text-green-700"><strong>Correct Answer:</strong> {String(question.correctAnswer)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Overall Progress Analytics */}
        <div className="mt-8">
          <TopicBasedProgress studentEmail={userEmail!} />
        </div>
      </div>
    </div>
  );
}