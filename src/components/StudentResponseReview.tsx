'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useSearchParams } from 'next/navigation';
import { User, Calendar, CheckCircle, XCircle, Eye, FileText, Image, Brain, MessageSquare } from 'lucide-react';

interface StudentResponse {
  id: string;
  userEmail: string;
  dayId: string;
  assessmentTitle?: string;
  completedAt: string;
  score: number;
  answers: { [questionId: string]: any };
  timeSpent?: number;
}

interface CanvasData {
  questionId: string;
  imageData: string;
  timestamp: string;
}

export default function StudentResponseReview() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const assessmentIdFilter = searchParams?.get('assessmentId');
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<StudentResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<StudentResponse | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ [questionId: string]: string }>({});

  useEffect(() => {
    loadAllResponses();
  }, []);

  useEffect(() => {
    if (assessmentIdFilter && responses.length > 0) {
      const filtered = responses.filter(response => 
        response.dayId === assessmentIdFilter || 
        response.assessmentId === assessmentIdFilter ||
        response.dayId === assessmentIdFilter.toString()
      );
      setFilteredResponses(filtered);
      if (filtered.length > 0) {
        setSelectedResponse(filtered[0]);
        loadCanvasData(filtered[0].id);
      }
    } else {
      setFilteredResponses(responses);
    }
  }, [assessmentIdFilter, responses]);

  const loadAllResponses = async () => {
    try {
      setLoading(true);
      console.log('Loading all student responses for tutor...');
      
      // Use the new tutor-specific endpoint that gets all responses
      const responsesResponse = await fetch('/api/tutor/responses');
      const responsesData = await responsesResponse.json();
      
      console.log('Tutor responses data:', responsesData);
      
      if (responsesData.responses && responsesData.responses.length > 0) {
        console.log('Found', responsesData.responses.length, 'responses');
        setResponses(responsesData.responses);
        
        // Don't auto-select here - let the filter effect handle it
      } else {
        console.log('No responses found');
        setResponses([]);
        setFilteredResponses([]);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCanvasData = async (responseId: string) => {
    try {
      // Mock canvas data - in real implementation, this would come from Firestore
      const mockCanvasData: CanvasData[] = [
        {
          questionId: 'q1',
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          timestamp: new Date().toISOString()
        }
      ];
      setCanvasData(mockCanvasData);
    } catch (error) {
      console.error('Error loading canvas data:', error);
    }
  };

  const analyzeCanvasWork = async (questionId: string, imageData: string) => {
    setAnalysisLoading(true);
    try {
      // Mock AI analysis - in real implementation, this would call GPT-4o API
      const mockAnalysis = `
**Work Quality Assessment:**
• Student showed clear working steps
• Mathematical reasoning is logical
• Some calculation errors in step 3
• Good use of visual representation

**Suggestions for Tutor:**
• Review basic arithmetic operations
• Encourage more detailed explanations
• Provide practice problems for similar concepts
• Highlight the correct problem-solving approach used
      `;
      
      setAiAnalysis(prev => ({
        ...prev,
        [questionId]: mockAnalysis
      }));
    } catch (error) {
      console.error('Error analyzing canvas work:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionFromResponse = (questionId: string, response: StudentResponse) => {
    return response.answers[questionId];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student responses...</p>
        </div>
      </div>
    );
  }

  if (filteredResponses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {assessmentIdFilter ? 'No Responses for This Assessment' : 'No Student Responses Yet'}
        </h2>
        <p className="text-gray-600">
          {assessmentIdFilter 
            ? 'No students have submitted responses for this specific assessment yet.'
            : 'Students haven\'t submitted any assessments yet. Check back once they start completing assignments.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Student Response Review Dashboard
          {assessmentIdFilter && (
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Assessment: {assessmentIdFilter}
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          Review student work, analyze canvas drawings, and get AI-powered insights for better tutoring
          {assessmentIdFilter && ` (${filteredResponses.length} responses)`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Submissions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredResponses.map((response) => (
              <button
                key={response.id}
                onClick={() => {
                  setSelectedResponse(response);
                  loadCanvasData(response.id);
                }}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedResponse?.id === response.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Day {response.dayId}</span>
                  <div className={`text-sm font-medium ${
                    response.score >= 80 ? 'text-green-600' :
                    response.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {response.score}%
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {response.userEmail.split('@')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(response.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Response Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedResponse && (
            <>
              {/* Response Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Assessment: Day {selectedResponse.dayId}
                  </h2>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      selectedResponse.score >= 80 ? 'text-green-600' :
                      selectedResponse.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedResponse.score}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedResponse.userEmail.split('@')[0]}
                      </div>
                      <div className="text-sm text-gray-600">Student</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(selectedResponse.completedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                  {selectedResponse.timeSpent && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatTime(selectedResponse.timeSpent)}
                        </div>
                        <div className="text-sm text-gray-600">Time Spent</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Question-by-Question Review */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Question Review</h3>
                <div className="space-y-6">
                  {Object.entries(selectedResponse.answers).map(([questionId, answer]: [string, any], index) => (
                    <div key={questionId} className={`p-4 rounded-lg border-l-4 ${
                      answer.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Question {index + 1}</span>
                          {answer.topicPath && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {answer.topicPath.split('/').pop()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {answer.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            {answer.pointsEarned || 0}/{answer.maxPoints || 5} pts
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Student Answer: </span>
                          <span className="text-sm text-gray-600">{String(answer.answer)}</span>
                        </div>
                        
                        {/* Canvas Work Display */}
                        {canvasData.find(c => c.questionId === questionId) && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Canvas Work:</span>
                              <button
                                onClick={() => analyzeCanvasWork(questionId, canvasData.find(c => c.questionId === questionId)!.imageData)}
                                disabled={analysisLoading}
                                className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 px-2 py-1 border border-purple-200 rounded-md hover:bg-purple-50 disabled:opacity-50"
                              >
                                <Brain size={12} />
                                {analysisLoading ? 'Analyzing...' : 'AI Analysis'}
                              </button>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <img 
                                src={canvasData.find(c => c.questionId === questionId)!.imageData}
                                alt="Student canvas work"
                                className="max-w-full h-auto border rounded"
                              />
                            </div>
                            
                            {/* AI Analysis Results */}
                            {aiAnalysis[questionId] && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-800">AI Analysis</span>
                                </div>
                                <div className="text-sm text-purple-700 whitespace-pre-line">
                                  {aiAnalysis[questionId]}
                                </div>
                              </div>
                            )}
                          </div>
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
    </div>
  );
}