// Topic-Based Weakness Detection Algorithm
import { SimplifiedCurriculum, SimplifiedCurriculumManager, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from './simplified-curriculum';

export interface TopicPerformance {
  topicPath: string;
  strand: string;
  chapter: string;
  subtopic: string;
  displayName: string;
  correct: number;
  total: number;
  accuracy: number;
  questionsAttempted: number;
}

export interface WeaknessAnalysis {
  weakTopics: TopicPerformance[];
  strongTopics: TopicPerformance[];
  averageAccuracy: number;
  totalQuestionsAttempted: number;
  recommendations: string[];
  focusAreas: FocusArea[];
}

export interface FocusArea {
  topicPath: string;
  displayName: string;
  priority: 'high' | 'medium' | 'low';
  recommendedStudyTime: string;
  accuracy: number;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  pointsEarned: number;
  
  // Topic information
  topicPath?: string;
  strand?: string;
  chapter?: string;
  subtopic?: string;
}

export interface StudentResponse {
  id: string;
  assessmentId: string;
  studentEmail: string;
  answers: StudentAnswer[];
  completedAt: Date;
  score: number;
  totalPoints: number;
}

export class TopicBasedWeaknessAnalyzer {
  private curriculum: SimplifiedCurriculum;

  constructor(curriculum: SimplifiedCurriculum = SIMPLIFIED_CAMBRIDGE_CURRICULUM) {
    this.curriculum = curriculum;
  }

  analyzeStudentPerformance(responses: StudentResponse[]): WeaknessAnalysis {
    // Group performance by topic
    const topicPerformance = new Map<string, { correct: number; total: number }>();
    
    responses.forEach(response => {
      response.answers.forEach(answer => {
        if (answer.topicPath) {
          const existing = topicPerformance.get(answer.topicPath) || { correct: 0, total: 0 };
          existing.total++;
          if (answer.isCorrect) existing.correct++;
          topicPerformance.set(answer.topicPath, existing);
        }
      });
    });

    // Convert to TopicPerformance objects
    const allTopics: TopicPerformance[] = Array.from(topicPerformance.entries()).map(([topicPath, perf]) => {
      const [strand, chapter, subtopic] = topicPath.split('/');
      return {
        topicPath,
        strand,
        chapter,
        subtopic,
        displayName: this.getTopicDisplayName(topicPath),
        correct: perf.correct,
        total: perf.total,
        accuracy: perf.correct / perf.total,
        questionsAttempted: perf.total
      };
    });

    // Classify weak and strong topics
    const weakTopics = allTopics
      .filter(topic => topic.accuracy < 0.6 && topic.total >= 2) // At least 2 questions attempted
      .sort((a, b) => a.accuracy - b.accuracy); // Weakest first

    const strongTopics = allTopics
      .filter(topic => topic.accuracy >= 0.8 && topic.total >= 2)
      .sort((a, b) => b.accuracy - a.accuracy); // Strongest first

    // Calculate overall stats
    const totalQuestions = allTopics.reduce((sum, topic) => sum + topic.total, 0);
    const totalCorrect = allTopics.reduce((sum, topic) => sum + topic.correct, 0);
    const averageAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

    return {
      weakTopics,
      strongTopics,
      averageAccuracy,
      totalQuestionsAttempted: totalQuestions,
      recommendations: this.generateRecommendations(weakTopics),
      focusAreas: this.generateFocusAreas(weakTopics)
    };
  }

  private generateRecommendations(weakTopics: TopicPerformance[]): string[] {
    const recommendations: string[] = [];

    if (weakTopics.length === 0) {
      recommendations.push("Great progress! All attempted topics show strong performance.");
      recommendations.push("Continue practicing to maintain your skills.");
      return recommendations;
    }

    // Focus on weakest topics first
    const weakestTopic = weakTopics[0];
    recommendations.push(`Priority focus: ${weakestTopic.displayName} (${Math.round(weakestTopic.accuracy * 100)}% accuracy)`);

    if (weakTopics.length > 1) {
      recommendations.push(`Secondary focus: ${weakTopics[1].displayName} (${Math.round(weakTopics[1].accuracy * 100)}% accuracy)`);
    }

    if (weakTopics.length > 3) {
      recommendations.push("Too many weak areas - focus on 1-2 topics at a time for better results.");
    }

    // Add specific study suggestions based on topic type
    weakTopics.slice(0, 2).forEach(topic => {
      if (topic.strand === 'number') {
        recommendations.push(`For ${topic.displayName}: Practice step-by-step calculations and review basic operations.`);
      } else if (topic.strand === 'algebra') {
        recommendations.push(`For ${topic.displayName}: Focus on understanding variable manipulation and equation solving.`);
      } else if (topic.strand === 'geometry') {
        recommendations.push(`For ${topic.displayName}: Review shape properties and practice with diagrams.`);
      } else if (topic.strand === 'statistics') {
        recommendations.push(`For ${topic.displayName}: Practice with real data sets and focus on calculation methods.`);
      }
    });

    return recommendations;
  }

  private generateFocusAreas(weakTopics: TopicPerformance[]): FocusArea[] {
    return weakTopics.slice(0, 3).map(topic => {
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let studyTime = '20 minutes';

      if (topic.accuracy < 0.3) {
        priority = 'high';
        studyTime = '30-45 minutes';
      } else if (topic.accuracy < 0.5) {
        priority = 'medium';
        studyTime = '20-30 minutes';
      } else {
        priority = 'low';
        studyTime = '15-20 minutes';
      }

      return {
        topicPath: topic.topicPath,
        displayName: topic.displayName,
        priority,
        recommendedStudyTime: studyTime,
        accuracy: topic.accuracy
      };
    });
  }

  private getTopicDisplayName(topicPath: string): string {
    // Use SimplifiedCurriculumManager to get proper display names
    return SimplifiedCurriculumManager.getTopicDisplayName(this.curriculum, topicPath);
  }
}

// Helper function to create sample analysis for preview
export const createSampleAnalysis = (): WeaknessAnalysis => {
  return {
    weakTopics: [
      {
        topicPath: 'statistics/data_analysis/averages',
        strand: 'statistics',
        chapter: 'data_analysis',
        subtopic: 'averages',
        displayName: 'Statistics and Probability → Data Analysis → Averages',
        correct: 2,
        total: 4,
        accuracy: 0.45,
        questionsAttempted: 4
      },
      {
        topicPath: 'algebra/algebra_basics/expressions',
        strand: 'algebra',
        chapter: 'algebra_basics',
        subtopic: 'expressions',
        displayName: 'Algebra → Algebraic Expressions → Expressions and Terms',
        correct: 1,
        total: 3,
        accuracy: 0.52,
        questionsAttempted: 3
      }
    ],
    strongTopics: [
      {
        topicPath: 'number/number_operations/integers',
        strand: 'number',
        chapter: 'number_operations',
        subtopic: 'integers',
        displayName: 'Number → Number Operations → Integers',
        correct: 7,
        total: 8,
        accuracy: 0.89,
        questionsAttempted: 8
      }
    ],
    averageAccuracy: 0.72,
    totalQuestionsAttempted: 15,
    recommendations: [
      'Priority focus: Statistics and Probability → Data Analysis → Averages (45% accuracy)',
      'Secondary focus: Algebra → Algebraic Expressions → Expressions and Terms (52% accuracy)',
      'For Statistics and Probability → Data Analysis → Averages: Practice with real data sets and focus on calculation methods.',
      'For Algebra → Algebraic Expressions → Expressions and Terms: Focus on understanding variable manipulation and equation solving.'
    ],
    focusAreas: [
      {
        topicPath: 'statistics/data_analysis/averages',
        displayName: 'Statistics and Probability → Data Analysis → Averages',
        priority: 'high',
        recommendedStudyTime: '30-45 minutes',
        accuracy: 0.45
      },
      {
        topicPath: 'algebra/algebra_basics/expressions',
        displayName: 'Algebra → Algebraic Expressions → Expressions and Terms',
        priority: 'medium',
        recommendedStudyTime: '20-30 minutes',
        accuracy: 0.52
      }
    ]
  };
};

// Legacy compatibility - keep old interface for existing code
export { WeaknessAnalysis as Analytics };