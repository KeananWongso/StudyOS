'use client';

import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle, BookOpen, Clock } from 'lucide-react';
import { WeaknessAnalysis, TopicPerformance } from '@/lib/weakness-algorithm';

interface TopicBasedProgressProps {
  studentEmail: string;
  className?: string;
}

export default function TopicBasedProgress({ studentEmail, className = '' }: TopicBasedProgressProps) {
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [studentEmail]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?userEmail=${encodeURIComponent(studentEmail)}`);
      
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load progress data</p>
          <button 
            onClick={loadAnalysis}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BookOpen className="h-8 w-8 mx-auto mb-2" />
          <p>No progress data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Learning Progress
        </h2>
        <div className="text-sm text-gray-500">
          {analysis.totalQuestionsAttempted} questions attempted
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(analysis.averageAccuracy * 100)}%
          </div>
          <div className="text-sm text-gray-600">Overall Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {analysis.strongTopics.length}
          </div>
          <div className="text-sm text-gray-600">Strong Areas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {analysis.weakTopics.length}
          </div>
          <div className="text-sm text-gray-600">Areas to Improve</div>
        </div>
      </div>

      {/* Areas to Focus On */}
      {analysis.weakTopics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Areas to Focus On
          </h3>
          <div className="space-y-3">
            {analysis.weakTopics.slice(0, 3).map((topic) => (
              <TopicProgressBar key={topic.topicPath} topic={topic} type="weak" />
            ))}
          </div>
        </div>
      )}

      {/* Strong Areas */}
      {analysis.strongTopics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Strong Areas
          </h3>
          <div className="space-y-3">
            {analysis.strongTopics.slice(0, 3).map((topic) => (
              <TopicProgressBar key={topic.topicPath} topic={topic} type="strong" />
            ))}
          </div>
        </div>
      )}

      {/* Study Recommendations */}
      {analysis.focusAreas.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Recommended Study Time
          </h3>
          <div className="space-y-3">
            {analysis.focusAreas.map((area) => (
              <div key={area.topicPath} className={`p-3 rounded-lg border-l-4 ${{
                'high': 'border-red-400 bg-red-50',
                'medium': 'border-orange-400 bg-orange-50',
                'low': 'border-yellow-400 bg-yellow-50'
              }[area.priority]}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{area.displayName}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {area.recommendedStudyTime} • {Math.round(area.accuracy * 100)}% accuracy
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${{
                    'high': 'bg-red-100 text-red-800',
                    'medium': 'bg-orange-100 text-orange-800',
                    'low': 'bg-yellow-100 text-yellow-800'
                  }[area.priority]}`}>
                    {area.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analysis.weakTopics.length === 0 && analysis.strongTopics.length === 0 && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Learning!</h3>
          <p className="text-gray-600">Complete some assessments to see your progress and get personalized recommendations.</p>
        </div>
      )}
    </div>
  );
}

// Progress bar component for topics
function TopicProgressBar({ topic, type }: { topic: TopicPerformance; type: 'weak' | 'strong' }) {
  const percentage = Math.round(topic.accuracy * 100);
  
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-900">{topic.displayName}</span>
          <span className="text-sm text-gray-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${type === 'strong' ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{topic.correct}/{topic.total} correct</span>
          <span>{topic.questionsAttempted} questions</span>
        </div>
      </div>
    </div>
  );
}