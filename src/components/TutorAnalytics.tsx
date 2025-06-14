'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, BookOpen, AlertTriangle, CheckCircle2, Brain } from 'lucide-react';
import { WeaknessAnalysis, TopicPerformance } from '@/lib/weakness-algorithm';

interface TutorAnalyticsProps {
  className?: string;
}

interface StudentAnalytics {
  studentEmail: string;
  studentName: string;
  analysis: WeaknessAnalysis;
  lastAssessment: Date;
}

export default function TutorAnalytics({ className = '' }: TutorAnalyticsProps) {
  const [studentsData, setStudentsData] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'topics' | 'students' | 'debug'>('overview');

  useEffect(() => {
    loadTutorAnalytics();
  }, []);

  const loadTutorAnalytics = async () => {
    try {
      setLoading(true);
      console.log('TutorAnalytics: Loading analytics data...');
      
      // First, get all student responses from the tutor responses endpoint
      const responsesResponse = await fetch('/api/tutor/responses');
      const responsesData = await responsesResponse.json();
      
      console.log('TutorAnalytics: Responses data:', responsesData);
      
      if (responsesData.responses && responsesData.responses.length > 0) {
        // Get unique students from responses
        const uniqueStudents = new Map();
        responsesData.responses.forEach((response: any) => {
          const email = response.studentEmail || response.submittedBy;
          if (email && !uniqueStudents.has(email)) {
            uniqueStudents.set(email, {
              email,
              displayName: response.displayName || email.split('@')[0]
            });
          }
        });
        
        console.log('TutorAnalytics: Found unique students:', Array.from(uniqueStudents.values()));
        
        // Load analytics for each student
        const studentAnalyticsPromises = Array.from(uniqueStudents.values()).map(async (student: any) => {
          try {
            console.log(`TutorAnalytics: Loading analytics for ${student.email}`);
            
            // Get analytics for this student
            const analyticsResponse = await fetch(`/api/analytics?userEmail=${encodeURIComponent(student.email)}`);
            const analysis = await analyticsResponse.json();
            
            console.log(`TutorAnalytics: Analytics for ${student.email}:`, analysis);
            
            // Find last assessment date for this student
            const studentResponses = responsesData.responses.filter((r: any) => 
              (r.studentEmail || r.submittedBy) === student.email
            );
            
            const lastAssessment = studentResponses.length > 0 
              ? new Date(studentResponses[0].completedAt?.seconds * 1000 || studentResponses[0].completedAt)
              : new Date();
            
            return {
              studentEmail: student.email,
              studentName: student.displayName,
              analysis,
              lastAssessment
            };
          } catch (error) {
            console.error(`TutorAnalytics: Error loading analytics for ${student.email}:`, error);
            return null;
          }
        });
        
        const studentAnalytics = (await Promise.all(studentAnalyticsPromises)).filter(Boolean);
        console.log('TutorAnalytics: Final student analytics:', studentAnalytics);
        
        setStudentsData(studentAnalytics);
      } else {
        console.log('TutorAnalytics: No student responses found');
        setStudentsData([]);
      }
    } catch (error) {
      console.error('TutorAnalytics: Failed to load analytics:', error);
      setStudentsData([]);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    const totalStudents = studentsData.length;
    const avgAccuracy = studentsData.reduce((sum, student) => sum + student.analysis.averageAccuracy, 0) / totalStudents;
    const totalQuestions = studentsData.reduce((sum, student) => sum + student.analysis.totalQuestionsAttempted, 0);
    
    // Collect all weak topics across students
    const allWeakTopics = studentsData.flatMap(student => student.analysis.weakTopics);
    const topicCounts = new Map<string, number>();
    
    allWeakTopics.forEach(topic => {
      const count = topicCounts.get(topic.topicPath) || 0;
      topicCounts.set(topic.topicPath, count + 1);
    });
    
    const mostProblematicTopics = Array.from(topicCounts.entries())
      .map(([topicPath, count]) => ({
        topicPath,
        studentCount: count,
        displayName: allWeakTopics.find(t => t.topicPath === topicPath)?.displayName || topicPath
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);

    return {
      totalStudents,
      avgAccuracy,
      totalQuestions,
      mostProblematicTopics
    };
  };

  const getTopicAnalytics = () => {
    const topicPerformance = new Map<string, { correct: number; total: number; students: Set<string> }>();
    
    studentsData.forEach(student => {
      [...student.analysis.weakTopics, ...student.analysis.strongTopics].forEach(topic => {
        const existing = topicPerformance.get(topic.topicPath) || { correct: 0, total: 0, students: new Set() };
        existing.correct += topic.correct;
        existing.total += topic.total;
        existing.students.add(student.studentEmail);
        topicPerformance.set(topic.topicPath, existing);
      });
    });

    return Array.from(topicPerformance.entries())
      .map(([topicPath, data]) => ({
        topicPath,
        displayName: studentsData
          .flatMap(s => [...s.analysis.weakTopics, ...s.analysis.strongTopics])
          .find(t => t.topicPath === topicPath)?.displayName || topicPath,
        accuracy: data.correct / data.total,
        studentCount: data.students.size,
        totalQuestions: data.total
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  };

  const stats = getOverallStats();
  const topicAnalytics = getTopicAnalytics();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Class Analytics & Recommendations
          </h1>
          <div className="flex gap-2">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart },
              { key: 'topics', label: 'Topics', icon: Target },
              { key: 'students', label: 'Students', icon: Users },
              { key: 'debug', label: 'Debug', icon: Brain }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedView === key
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Students</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalStudents}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Class Average</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{Math.round(stats.avgAccuracy * 100)}%</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Questions Attempted</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{stats.totalQuestions}</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Problem Areas</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{stats.mostProblematicTopics.length}</div>
          </div>
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Problematic Topics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Most Problematic Topics
            </h3>
            <div className="space-y-3">
              {stats.mostProblematicTopics.map((topic, index) => (
                <div key={topic.topicPath} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{topic.displayName}</h4>
                    <p className="text-sm text-gray-600">{topic.studentCount} students struggling</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">#{index + 1}</div>
                    <div className="text-xs text-gray-500">Priority</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Teaching Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI-Generated Teaching Recommendations
            </h3>
            <div className="space-y-4">
              {/* Show actual algorithm recommendations */}
              {studentsData.length > 0 && studentsData[0].analysis.recommendations.length > 0 ? (
                <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                  <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Algorithm Analysis Results
                  </h4>
                  <ul className="mt-2 text-sm text-purple-700 space-y-1">
                    {studentsData[0].analysis.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded">
                  <h4 className="font-semibold text-gray-600">No analysis data available</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Students need to complete assessments for AI recommendations to be generated.
                  </p>
                </div>
              )}

              {/* Focus Areas from Algorithm */}
              {studentsData.length > 0 && studentsData[0].analysis.focusAreas.length > 0 && (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                  <h4 className="font-semibold text-orange-800">🎯 Priority Focus Areas</h4>
                  <div className="mt-2 space-y-2">
                    {studentsData[0].analysis.focusAreas.map((area, index) => (
                      <div key={area.topicPath} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{area.displayName}</div>
                            <div className="text-sm text-gray-600">
                              Accuracy: {Math.round(area.accuracy * 100)}% • 
                              Priority: <span className={`font-medium ${
                                area.priority === 'high' ? 'text-red-600' :
                                area.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                              }`}>{area.priority}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">{area.recommendedStudyTime}</div>
                            <div className="text-xs text-gray-500">Study Time</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <h4 className="font-semibold text-green-800">📈 Next Steps</h4>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>• Create targeted practice problems for weak topics</p>
                  <p>• Review fundamental concepts before advancing</p>
                  <p>• Consider one-on-one help for students below 60% accuracy</p>
                  <p>• Track progress with follow-up mini-assessments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'topics' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Performance Analysis</h3>
          <div className="space-y-4">
            {topicAnalytics.map((topic) => (
              <div key={topic.topicPath} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{topic.displayName}</h4>
                  <p className="text-sm text-gray-600">
                    {topic.studentCount} students • {topic.totalQuestions} questions
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        topic.accuracy >= 0.8 ? 'bg-green-500' :
                        topic.accuracy >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.accuracy * 100}%` }}
                    />
                  </div>
                  <div className="text-right min-w-[60px]">
                    <div className={`text-lg font-bold ${
                      topic.accuracy >= 0.8 ? 'text-green-600' :
                      topic.accuracy >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(topic.accuracy * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'students' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Student Progress</h3>
          <div className="space-y-4">
            {studentsData.map((student) => (
              <div key={student.studentEmail} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                    <p className="text-sm text-gray-600">
                      Last assessment: {student.lastAssessment.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(student.analysis.averageAccuracy * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Overall</div>
                  </div>
                </div>
                
                {/* Detailed Analysis for Each Student */}
                <div className="space-y-4">
                  {/* Weak Topics */}
                  {student.analysis.weakTopics.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Areas Needing Support ({student.analysis.weakTopics.length})
                      </h5>
                      <div className="space-y-2">
                        {student.analysis.weakTopics.map(topic => (
                          <div key={topic.topicPath} className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              {topic.displayName} ({topic.correct}/{topic.total} correct)
                            </div>
                            <div className="text-sm font-medium text-red-600">
                              {Math.round(topic.accuracy * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strong Topics */}
                  {student.analysis.strongTopics.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Strong Areas ({student.analysis.strongTopics.length})
                      </h5>
                      <div className="space-y-2">
                        {student.analysis.strongTopics.map(topic => (
                          <div key={topic.topicPath} className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              {topic.displayName} ({topic.correct}/{topic.total} correct)
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {Math.round(topic.accuracy * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Focus Areas for this Student */}
                  {student.analysis.focusAreas.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Recommended Focus Areas
                      </h5>
                      <div className="space-y-2">
                        {student.analysis.focusAreas.map(area => (
                          <div key={area.topicPath} className="text-sm">
                            <div className="font-medium text-gray-900">{area.displayName}</div>
                            <div className="text-gray-600">
                              Study Time: {area.recommendedStudyTime} • 
                              Priority: <span className={`font-medium ${
                                area.priority === 'high' ? 'text-red-600' :
                                area.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                              }`}>{area.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Recommendations */}
                  {student.analysis.recommendations.length > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        AI Recommendations for {student.studentName}
                      </h5>
                      <ul className="text-sm text-purple-700 space-y-1">
                        {student.analysis.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'debug' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Algorithm Debug Information
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Raw Analytics Data</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-96 bg-white p-3 rounded border">
                {JSON.stringify(studentsData, null, 2)}
              </pre>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Data Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Students Found:</strong> {studentsData.length}</p>
                <p>• <strong>Total Weak Topics:</strong> {studentsData.reduce((sum, s) => sum + s.analysis.weakTopics.length, 0)}</p>
                <p>• <strong>Total Strong Topics:</strong> {studentsData.reduce((sum, s) => sum + s.analysis.strongTopics.length, 0)}</p>
                <p>• <strong>Total Recommendations:</strong> {studentsData.reduce((sum, s) => sum + s.analysis.recommendations.length, 0)}</p>
                <p>• <strong>Total Focus Areas:</strong> {studentsData.reduce((sum, s) => sum + s.analysis.focusAreas.length, 0)}</p>
              </div>
            </div>

            {studentsData.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ No Analytics Data Available</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>Possible reasons:</p>
                  <p>• No student responses in the database</p>
                  <p>• Students haven&apos;t completed any assessments</p>
                  <p>• API connection issues</p>
                  <p>• Analytics algorithm not processing data correctly</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}