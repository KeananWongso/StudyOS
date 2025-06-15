export interface Question {
  id: string;
  type: 'mcq' | 'written' | 'calculation';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
  
  // NEW: Topic tagging for weakness detection
  strand: string;        // e.g., "statistics"
  chapter: string;       // e.g., "data_analysis"  
  subtopic: string;      // e.g., "averages"
  
  // Legacy fields (kept for backward compatibility)
  difficulty?: 1 | 2 | 3 | 4 | 5;
  hasCanvas: boolean;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  canvasData?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface AssessmentData {
  id: string;
  day: number;
  title: string;
  chapter: string;
  topics: string[];
  questions: Question[];
  totalPoints: number;
  createdAt?: any;
}

export interface StudentResponse {
  id?: string;
  dayId: string;
  studentId: string;
  answers: Record<string, StudentAnswer>;
  canvasDrawings?: Record<string, string>; // Optional for backward compatibility
  score: number;
  timeSpent: number;
  completedAt?: any;
  
  // NEW: Review workflow fields
  status?: 'pending' | 'in_review' | 'completed'; // Optional for backward compatibility
  reviewStartedAt?: Date;
  reviewCompletedAt?: Date;
  reviewedBy?: string; // Tutor email
  tutorFeedback?: {
    questionId: string;
    aiSuggestion?: string;
    tutorFeedback: string;
    grade: number;
    maxPoints: number;
    isCorrect: boolean;
  }[];
  totalScore?: number;
  feedbackSentAt?: Date;
  
  // Legacy fields for backward compatibility
  manuallyGraded?: boolean;
  assessmentId?: string;
}

export interface Analytics {
  studentId: string;
  chapterScores: Record<string, number>;
  weakChapters: string[];
  strongChapters: string[];
  overallProgress: number;
  lastUpdated?: any;
}

export interface WeaknessItem {
  chapter: string;
  score: number;
  priority: number;
  recommendedStudyTime: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface CanvasStroke {
  points: CanvasPoint[];
  color: string;
  size: number;
  timestamp: number;
}