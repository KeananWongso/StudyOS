'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  Star,
  AlertTriangle,
  ThumbsUp,
  Edit2,
  Save
} from 'lucide-react';

interface AssessmentReviewProps {
  submissionId: string;
  onBack: () => void;
}

interface SubmissionDetails {
  id: string;
  studentEmail: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  submittedAt: Date;
  status: 'pending' | 'in_review' | 'completed';
  questionCount: number;
  timeSpent: number;
  answers: Record<string, any>;
  canvasDrawings: Record<string, string>;
  tutorFeedback?: Array<{
    questionId: string;
    aiSuggestion?: string;
    tutorFeedback: string;
    grade: number;
    maxPoints: number;
    isCorrect: boolean;
  }>;
  totalScore?: number;
}

interface Question {
  id: string;
  question: string;
  type: 'mcq' | 'written' | 'calculation';
  options?: string[];
  correctAnswer: string;
  points: number;
  topicPath?: string;
}

interface AIAnalysis {
  analysisComplete: boolean;
  confidence: number;
  analysis: string;
  workingQuality: string;
  errors: string;
  suggestedFeedback: string;
  recommendedPoints: number;
  strengths: string[];
  improvements: string[];
  metadata?: {
    analyzedAt: string;
    model: string;
    processingTime: string;
  };
}

export default function AssessmentReview({ submissionId, onBack }: AssessmentReviewProps) {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, { feedback: string; grade: number; isCorrect: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'pending' | 'in_review' | 'completed'>('pending');

  useEffect(() => {
    if (submissionId) {
      loadSubmissionDetails();
    }
  }, [submissionId]);

  useEffect(() => {
    if (submission && status !== submission.status && status === 'in_review') {
      // Start review workflow
      updateSubmissionStatus('in_review');
    }
  }, [status, submission]);

  const loadSubmissionDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading submission details for:', submissionId);
      
      // Load the specific submission from global responses
      const response = await fetch(`/api/review-queue?submissionId=${submissionId}`);
      if (!response.ok) {
        throw new Error('Failed to load submission');
      }
      
      const data = await response.json();
      const submissionData = data.submission;
      
      if (!submissionData) {
        throw new Error('Submission not found');
      }

      // Load associated assessment to get questions
      const assessmentResponse = await fetch('/api/assessments');
      const assessmentData = await assessmentResponse.json();
      const assessment = assessmentData.assessments?.find((a: any) => a.id === submissionData.assessmentId);
      
      if (assessment) {
        setQuestions(assessment.questions || []);
      }

      setSubmission(submissionData);
      setStatus(submissionData.status || 'pending');
      
      // Initialize feedback from existing tutorFeedback if available
      if (submissionData.tutorFeedback) {
        const initialFeedback: Record<string, any> = {};
        submissionData.tutorFeedback.forEach((fb: any) => {
          initialFeedback[fb.questionId] = {
            feedback: fb.tutorFeedback,
            grade: fb.grade,
            isCorrect: fb.isCorrect
          };
        });
        setFeedback(initialFeedback);
      }

    } catch (error) {
      console.error('Error loading submission details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (newStatus: 'pending' | 'in_review' | 'completed', tutorFeedbackData?: any) => {
    try {
      const updateData: any = {
        submissionId,
        status: newStatus,
        reviewedBy: user?.email
      };

      if (newStatus === 'completed' && tutorFeedbackData) {
        updateData.tutorFeedback = tutorFeedbackData;
        updateData.totalScore = calculateTotalScore(tutorFeedbackData);
      }

      const response = await fetch('/api/review-queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update submission status');
      }

      console.log(`Submission ${submissionId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const analyzeCanvas = async (questionId: string) => {
    if (!submission?.canvasDrawings?.[questionId]) return;
    
    setLoadingAnalysis(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const response = await fetch('/api/analyze-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasImageData: submission.canvasDrawings[questionId],
          questionText: question.question,
          expectedAnswer: question.correctAnswer,
          questionType: question.type
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setAiAnalyses(prev => ({ ...prev, [questionId]: analysis }));
        
        // Pre-populate feedback with AI suggestion
        setFeedback(prev => ({
          ...prev,
          [questionId]: {
            feedback: analysis.suggestedFeedback || '',
            grade: analysis.recommendedPoints || question.points,
            isCorrect: (analysis.recommendedPoints || 0) >= (question.points * 0.7)
          }
        }));
      }
    } catch (error) {
      console.error('Error analyzing canvas:', error);
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const updateFeedback = (questionId: string, field: 'feedback' | 'grade' | 'isCorrect', value: any) => {
    setFeedback(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const calculateTotalScore = (tutorFeedbackData: any[]): number => {
    return tutorFeedbackData.reduce((total, fb) => total + fb.grade, 0);
  };

  const handleStartReview = () => {
    setStatus('in_review');
  };

  const handleCompleteReview = async () => {
    setSaving(true);
    try {
      // Prepare tutor feedback data
      const tutorFeedbackData = Object.entries(feedback).map(([questionId, fb]) => {
        const question = questions.find(q => q.id === questionId);
        return {
          questionId,
          aiSuggestion: aiAnalyses[questionId]?.suggestedFeedback || null,
          tutorFeedback: fb.feedback,
          grade: fb.grade,
          maxPoints: question?.points || 5,
          isCorrect: fb.isCorrect
        };
      });

      await updateSubmissionStatus('completed', tutorFeedbackData);
      setStatus('completed');
      
      // Go back to review queue
      setTimeout(() => onBack(), 1000);
    } catch (error) {
      console.error('Error completing review:', error);
    } finally {
      setSaving(false);
    }
  };

  const canCompleteReview = () => {
    return questions.every(q => 
      feedback[q.id] && 
      feedback[q.id].feedback.trim() !== '' &&
      typeof feedback[q.id].grade === 'number'
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Not Found</h3>
        <p className="text-gray-600 mb-4">The submission you're looking for could not be loaded.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = submission.answers[currentQuestion?.id];
  const currentFeedback = feedback[currentQuestion?.id] || { feedback: '', grade: currentQuestion?.points || 0, isCorrect: false };
  const hasCanvas = submission.canvasDrawings?.[currentQuestion?.id];
  const aiAnalysis = aiAnalyses[currentQuestion?.id];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Queue
          </button>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'pending' ? 'bg-orange-100 text-orange-800' :
            status === 'in_review' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {status === 'pending' ? '⏱️ Pending' : 
             status === 'in_review' ? '📝 In Review' : '✅ Completed'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{submission.assessmentTitle}</h2>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <User size={16} />
              <span>{submission.studentName}</span>
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{Math.floor(submission.timeSpent / 60)} minutes</span>
            </div>
          </div>

          <div className="flex justify-end">
            {status === 'pending' && (
              <button
                onClick={handleStartReview}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 size={16} />
                Start Review
              </button>
            )}
            
            {status === 'in_review' && (
              <button
                onClick={handleCompleteReview}
                disabled={!canCompleteReview() || saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {saving ? 'Saving...' : 'Complete Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {status !== 'pending' && (
        <div className="flex">
          {/* Question Navigation */}
          <div className="w-64 border-r border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Questions ({questions.length})</h3>
            <div className="space-y-2">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-100 border border-blue-300 text-blue-900'
                      : feedback[question.id]?.feedback
                      ? 'bg-green-50 border border-green-200 text-green-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Q{index + 1}</span>
                    <div className="flex items-center gap-1">
                      {feedback[question.id]?.feedback && (
                        <CheckCircle size={14} className="text-green-600" />
                      )}
                      {hasCanvas && aiAnalyses[question.id] && (
                        <Sparkles size={14} className="text-purple-600" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {question.points} points
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Review Area */}
          <div className="flex-1 p-6">
            {currentQuestion && (
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {currentQuestionIndex + 1}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 capitalize">{currentQuestion.type}</span>
                      <span className="font-medium text-blue-600">{currentQuestion.points} points</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{currentQuestion.question}</p>
                  
                  {currentQuestion.type === 'mcq' && currentQuestion.options && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Options:</div>
                      <div className="space-y-1">
                        {currentQuestion.options.map((option, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {String.fromCharCode(65 + idx)}) {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Expected Answer */}
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800 mb-1">Expected Answer:</div>
                    <div className="text-green-700 font-medium">{currentQuestion.correctAnswer}</div>
                  </div>
                </div>

                {/* Student Answer */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Answer:</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-gray-700">{currentAnswer?.answer || 'No answer provided'}</p>
                  </div>
                </div>

                {/* Canvas Drawing */}
                {hasCanvas && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Student Working:</h4>
                      {!aiAnalysis && (
                        <button
                          onClick={() => analyzeCanvas(currentQuestion.id)}
                          disabled={loadingAnalysis[currentQuestion.id]}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                        >
                          {loadingAnalysis[currentQuestion.id] ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Sparkles size={14} />
                          )}
                          {loadingAnalysis[currentQuestion.id] ? 'Analyzing...' : 'Get AI Analysis'}
                        </button>
                      )}
                    </div>
                    
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      <img 
                        src={submission.canvasDrawings[currentQuestion.id]} 
                        alt={`Student working for question ${currentQuestionIndex + 1}`}
                        className="max-w-full h-auto rounded shadow-sm"
                        style={{ 
                          maxHeight: '500px',
                          minHeight: '200px',
                          filter: 'contrast(1.1) brightness(1.0)',
                          imageRendering: 'crisp-edges'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {aiAnalysis && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="text-purple-600" size={18} />
                      <h4 className="font-medium text-purple-900">AI Analysis</h4>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {Math.round(aiAnalysis.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong className="text-purple-900">Analysis:</strong>
                        <p className="text-purple-800 mt-1">{aiAnalysis.analysis}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <strong className="text-purple-900">Strengths:</strong>
                          <ul className="text-purple-800 mt-1 list-disc list-inside">
                            {aiAnalysis.strengths.map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <strong className="text-purple-900">Improvements:</strong>
                          <ul className="text-purple-800 mt-1 list-disc list-inside">
                            {aiAnalysis.improvements.map((improvement, idx) => (
                              <li key={idx}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <strong className="text-purple-900">AI Suggested Feedback:</strong>
                        <p className="text-purple-800 mt-1 italic">"{aiAnalysis.suggestedFeedback}"</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tutor Feedback Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Your Feedback & Grading</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback for Student:
                      </label>
                      <textarea
                        value={currentFeedback.feedback}
                        onChange={(e) => updateFeedback(currentQuestion.id, 'feedback', e.target.value)}
                        placeholder={aiAnalysis?.suggestedFeedback || "Provide detailed feedback for the student..."}
                        className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points Awarded:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={currentQuestion.points}
                          value={currentFeedback.grade}
                          onChange={(e) => updateFeedback(currentQuestion.id, 'grade', parseInt(e.target.value) || 0)}
                          className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-600 ml-1">/ {currentQuestion.points}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`correct-${currentQuestion.id}`}
                          checked={currentFeedback.isCorrect}
                          onChange={(e) => updateFeedback(currentQuestion.id, 'isCorrect', e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`correct-${currentQuestion.id}`} className="text-sm font-medium text-gray-700">
                          Mark as Correct
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}