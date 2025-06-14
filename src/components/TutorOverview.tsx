'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Eye,
  Calendar,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface TutorOverviewData {
  assessments: any[];
  responses: any[];
  students: any[];
  summary: {
    totalAssessments: number;
    totalResponses: number;
    totalStudents: number;
    averageCompletionRate: number;
  };
}

export default function TutorOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<TutorOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutor/overview');
      const overviewData = await response.json();
      console.log('Overview data:', overviewData);
      setData(overviewData);
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Failed to Load Overview</h2>
          <p className="text-gray-600">Please try again later.</p>
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
                Tutor Overview Dashboard
              </h1>
              <p className="text-gray-600">
                Complete overview of all assignments, student responses, and progress
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/tutor/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/tutor/responses"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Responses
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{data.summary?.totalAssessments || data.assessments?.length || 0}</div>
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
                <div className="text-2xl font-bold text-gray-900">{data.summary?.totalResponses || data.responses?.length || 0}</div>
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
                <div className="text-2xl font-bold text-gray-900">{data.summary?.totalStudents || data.students?.length || 0}</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{data.summary?.averageCompletionRate || 0}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assessments Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Assessments Overview
            </h2>
            
            <div className="space-y-3">
              {!data.assessments || data.assessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No assessments created yet</p>
                  <Link
                    href="/tutor"
                    className="inline-block mt-2 text-blue-600 hover:underline"
                  >
                    Create your first assessment
                  </Link>
                </div>
              ) : (
                data.assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        Day {assessment.day}: {assessment.title}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {assessment.completionCount} responses
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>{assessment.questions?.length || 0} questions</span>
                      <span>{assessment.totalPoints || 0} points</span>
                      {assessment.averageScore > 0 && (
                        <span className="text-green-600">Avg: {assessment.averageScore}%</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Students Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Students Overview
            </h2>
            
            <div className="space-y-3">
              {!data.students || data.students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No student responses yet</p>
                  <p className="text-sm text-gray-500">Students will appear here after submitting assessments</p>
                </div>
              ) : (
                data.students.map((student) => (
                  <div
                    key={student.email}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {student.displayName}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {student.averageScore}% avg
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>{student.completedAssessments} assessments</span>
                      <span>{student.totalResponses} responses</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Responses */}
        {data.responses && data.responses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Recent Responses
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Assessment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.responses.slice(0, 10).map((response) => (
                    <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{response.displayName}</div>
                        <div className="text-sm text-gray-600">{response.studentEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900">Day {response.dayId || 'Unknown'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          (response.score || 0) >= 80 
                            ? 'bg-green-100 text-green-800'
                            : (response.score || 0) >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {response.score || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {response.completedAt ? 
                          new Date(response.completedAt.seconds * 1000).toLocaleDateString() :
                          'Unknown'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href="/tutor/responses"
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}