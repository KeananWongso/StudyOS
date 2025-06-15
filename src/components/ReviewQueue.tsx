'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  Edit,
  Send
} from 'lucide-react';

interface PendingSubmission {
  id: string;
  studentEmail: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  submittedAt: Date;
  status: 'pending' | 'in_review' | 'completed';
  questionCount: number;
  timeSpent: number;
}

interface ReviewQueueProps {
  onStartReview: (submission: PendingSubmission) => void;
}

export default function ReviewQueue({ onStartReview }: ReviewQueueProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'completed'>('pending');

  useEffect(() => {
    if (user?.email) {
      loadSubmissions();
    }
  }, [user?.email]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Loading submissions for review queue...');
      
      const response = await fetch(`/api/review-queue?tutorEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubmissions(data.submissions || []);
        console.log(`Loaded ${data.submissions?.length || 0} submissions for review`);
      } else {
        console.error('Failed to load submissions:', data.error);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_review':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'in_review':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const inReviewCount = submissions.filter(s => s.status === 'in_review').length;
  const completedCount = submissions.filter(s => s.status === 'completed').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📋 Assessment Review Queue
        </h2>
        <div className="text-sm text-gray-600">
          {submissions.length} total submissions
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'pending', label: `Pending (${pendingCount})`, icon: '⏱️' },
          { key: 'in_review', label: `In Review (${inReviewCount})`, icon: '📝' },
          { key: 'completed', label: `Completed (${completedCount})`, icon: '✅' },
          { key: 'all', label: 'All', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            {filter === 'pending' ? '⏱️' : filter === 'in_review' ? '📝' : '✅'}
          </div>
          <p className="text-gray-600">
            {filter === 'pending' 
              ? 'No submissions pending review'
              : filter === 'in_review'
              ? 'No submissions currently in review'
              : filter === 'completed'
              ? 'No completed reviews yet'
              : 'No submissions found'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColor(submission.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(submission.status)}
                    <div className="font-medium text-gray-900">
                      {submission.studentName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {submission.assessmentTitle}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {submission.studentEmail.split('@')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatTimeAgo(submission.submittedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeSpent(submission.timeSpent)}
                    </span>
                    <span>
                      {submission.questionCount} questions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {submission.status === 'pending' && (
                    <button
                      onClick={() => onStartReview(submission)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye size={14} />
                      Start Review
                    </button>
                  )}
                  
                  {submission.status === 'in_review' && (
                    <button
                      onClick={() => onStartReview(submission)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit size={14} />
                      Continue Review
                    </button>
                  )}
                  
                  {submission.status === 'completed' && (
                    <button
                      onClick={() => onStartReview(submission)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <Eye size={14} />
                      View Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}