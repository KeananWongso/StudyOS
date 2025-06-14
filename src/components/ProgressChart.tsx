'use client';

import { useState, useEffect } from 'react';
import { Analytics, WeaknessItem, StudentResponse } from '@/lib/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUserEmail } from './AuthProvider';

export default function ProgressChart() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userEmail = useCurrentUserEmail();

  useEffect(() => {
    fetchAnalyticsData();
  }, [userEmail]);

  const fetchAnalyticsData = async () => {
    if (!userEmail) return;
    
    try {
      setIsLoading(true);
      
      // Fetch analytics
      const analyticsResponse = await fetch(`/api/analytics?userEmail=${encodeURIComponent(userEmail)}`);
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData.analytics);
      setWeaknesses(analyticsData.weaknesses || []);
      setRecommendations(analyticsData.recommendations || []);

      // Fetch responses for progress tracking
      const responsesResponse = await fetch(`/api/responses?userEmail=${encodeURIComponent(userEmail)}`);
      const responsesData = await responsesResponse.json();
      setResponses(responsesData.responses || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChapterData = () => {
    if (!analytics) return [];
    
    return Object.entries(analytics.chapterScores).map(([chapter, score]) => ({
      chapter: chapter.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      score,
      color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
    }));
  };

  const prepareRadarData = () => {
    if (!analytics) return [];
    
    return Object.entries(analytics.chapterScores).map(([chapter, score]) => ({
      subject: chapter.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      A: score,
      fullMark: 100
    }));
  };

  const prepareProgressData = () => {
    return responses
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
      .map((response, index) => ({
        assessment: `Day ${index + 1}`,
        score: Math.round((response.score / 100) * 100), // Normalize score
        timeSpent: Math.round(response.timeSpent / 60), // Convert to minutes
      }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const chapterData = prepareChapterData();
  const radarData = prepareRadarData();
  const progressData = prepareProgressData();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Analytics</h1>
          <p className="text-gray-600">Detailed analysis of your learning journey</p>
        </div>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.overallProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Strong Areas</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.strongChapters.length}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Areas to Improve</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics.weakChapters.length}</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assessments Completed</p>
                  <p className="text-3xl font-bold text-purple-600">{responses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chapter Scores Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chapter Performance</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chapterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="chapter" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Radar</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" fontSize={12} />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="A"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Progress Over Time */}
        {progressData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Over Time</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assessment" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'score' ? `${value}%` : `${value} min`,
                      name === 'score' ? 'Score' : 'Time Spent'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                  />
                  <Line
                    type="monotone"
                    dataKey="timeSpent"
                    stroke="#10B981"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
                Priority Areas
              </h2>
              <div className="space-y-4">
                {weaknesses.map((weakness) => (
                  <div key={weakness.chapter} className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-orange-800 capitalize">
                        {weakness.chapter.replace('_', ' ')}
                      </h3>
                      <span className="text-sm font-medium text-orange-600">
                        Priority {weakness.priority}/5
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700">Score: {weakness.score}%</span>
                      <span className="text-orange-700 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {weakness.recommendedStudyTime} min/day
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${weakness.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Personalized Recommendations
              </h2>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={fetchAnalyticsData}
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Analytics
          </button>
        </div>
      </div>
    </div>
  );
}