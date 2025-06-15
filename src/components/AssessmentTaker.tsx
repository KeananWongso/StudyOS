'use client';

import { useState, useEffect } from 'react';
import { AssessmentData, Question, StudentAnswer, StudentResponse } from '@/lib/types';
import { ChevronLeft, ChevronRight, Clock, Send, CheckCircle } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import Link from 'next/link';
import { useCurrentUserEmail } from './AuthProvider';

interface AssessmentTakerProps {
  assessmentId: string;
}

export default function AssessmentTaker({ assessmentId }: AssessmentTakerProps) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [canvasDrawings, setCanvasDrawings] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const userEmail = useCurrentUserEmail();

  useEffect(() => {
    fetchAssessment();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    // Auto-save every 30 seconds
    const autoSaveTimer = setInterval(() => {
      autoSave();
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(autoSaveTimer);
    };
  }, []);

  const fetchAssessment = async () => {
    try {
      const response = await fetch('/api/assessments');
      const data = await response.json();
      const targetAssessment = data.assessments?.find((a: AssessmentData) => a.id === assessmentId);
      
      if (targetAssessment) {
        setAssessment(targetAssessment);
        
        // Initialize answers object
        const initialAnswers: Record<string, StudentAnswer> = {};
        targetAssessment.questions.forEach(question => {
          initialAnswers[question.id] = {
            questionId: question.id,
            answer: '',
            isCorrect: false,
            pointsEarned: 0
          };
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSave = async () => {
    if (Object.keys(answers).length === 0) return;
    
    setAutoSaveStatus('saving');
    try {
      // This would save a draft response
      setAutoSaveStatus('saved');
    } catch (error) {
      setAutoSaveStatus('error');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer,
        isCorrect: checkAnswer(questionId, answer),
        pointsEarned: checkAnswer(questionId, answer) ? getCurrentQuestion().points : 0
      }
    }));
  };

  const checkAnswer = (questionId: string, answer: string | number): boolean => {
    const question = assessment?.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const correctAnswer = question.correctAnswer.toString().toLowerCase().trim();
    const userAnswer = answer.toString().toLowerCase().trim();
    
    return correctAnswer === userAnswer;
  };

  const handleCanvasChange = (questionId: string, imageData: string) => {
    setCanvasDrawings(prev => ({
      ...prev,
      [questionId]: imageData
    }));
  };

  const getCurrentQuestion = (): Question => {
    return assessment!.questions[currentQuestionIndex];
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < assessment!.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const isQuestionAnswered = (questionId: string): boolean => {
    const answer = answers[questionId];
    return answer && answer.answer.toString().trim() !== '';
  };

  const getCompletionPercentage = (): number => {
    const answeredCount = Object.values(answers).filter(answer => 
      answer.answer.toString().trim() !== ''
    ).length;
    return Math.round((answeredCount / assessment!.questions.length) * 100);
  };

  const canSubmit = (): boolean => {
    return Object.values(answers).every(answer => 
      answer.answer.toString().trim() !== ''
    );
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('canSubmit():', canSubmit());
    console.log('assessment:', assessment);
    console.log('userEmail:', userEmail);
    
    if (!canSubmit() || !assessment || !userEmail) {
      console.log('Submit validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response: StudentResponse = {
        dayId: assessment.id,
        studentId: userEmail,
        answers,
        canvasDrawings: canvasDrawings || {},
        score: 0, // Will be calculated by API
        timeSpent,
        status: 'pending' // New review workflow starts as pending
      };

      console.log('Submitting response:', response);
      console.log('Assessment data:', assessment);

      const submitResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response,
          assessment // Include assessment data for topic analysis
        }),
      });

      console.log('Submit response status:', submitResponse.status);
      console.log('Submit response ok:', submitResponse.ok);
      
      if (submitResponse.ok) {
        const responseData = await submitResponse.json();
        console.log('Submit response data:', responseData);
        setIsSubmitted(true);
      } else {
        const errorData = await submitResponse.text();
        console.error('Submit failed with status:', submitResponse.status);
        console.error('Submit error data:', errorData);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
          <p className="text-gray-600">The assessment you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-lg">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted Successfully!</h1>
          <p className="text-gray-600 mb-4">
            📝 Your work has been sent to your tutor for review.
          </p>
          <p className="text-blue-600 mb-4">
            ⏱️ You'll receive detailed feedback once your tutor has reviewed your submission.
          </p>
          <p className="text-purple-600 mb-6">
            🔔 Check back later for your personalized feedback and grade.
          </p>
          <div className="text-sm text-gray-700 mb-6 bg-gray-50 p-3 rounded-lg">
            <strong>Time spent:</strong> {formatTime(timeSpent)}
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Day {assessment.day}: {assessment.title}
              </h1>
              <p className="text-sm text-gray-700">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeSpent)}
              </div>
              
              <div className="text-sm text-gray-700">
                {getCompletionPercentage()}% Complete
              </div>
              
              <div className={`text-xs px-2 py-1 rounded ${
                autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                autoSaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {autoSaveStatus === 'saved' ? 'Saved' :
                 autoSaveStatus === 'saving' ? 'Saving...' : 'Error'}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {assessment.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => navigateToQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : isQuestionAnswered(question.id)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 capitalize">
                      {currentQuestion.type}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {currentQuestion.points} points
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                {currentQuestion.type === 'mcq' && currentQuestion.options ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index);
                      return (
                        <label
                          key={index}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={answers[currentQuestion.id]?.answer === option}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="mr-3 h-4 w-4 text-blue-600"
                          />
                          <span className="font-medium text-gray-700 mr-2">{optionLetter})</span>
                          <span className="text-gray-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={answers[currentQuestion.id]?.answer || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Enter your answer here..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-600"
                    />
                  </div>
                )}
              </div>

              {/* Canvas for Working */}
              {(currentQuestion.type === 'calculation' || currentQuestion.type === 'written') && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Working Space</h3>
                  <DrawingCanvas
                    key={currentQuestion.id}
                    onCanvasChange={(imageData) => handleCanvasChange(currentQuestion.id, imageData)}
                    className="w-full"
                    initialData={canvasDrawings[currentQuestion.id]}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === assessment.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit() || isSubmitting}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}