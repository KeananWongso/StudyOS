import { Question, AssessmentData } from './types';
import { generateId } from './utils';

export interface ParsedQuestion extends Question {
  // Enhanced with topic information
  topicPath?: string;
}

export class MarkdownParser {
  static parseAssessment(markdown: string): AssessmentData {
    const lines = markdown.split('\n').filter(line => line.trim());
    
    const assessment: Partial<AssessmentData> = {
      id: generateId(),
      questions: []
    };
    
    let currentQuestion: Partial<ParsedQuestion> | null = null;
    let answerOptions: string[] = [];
    let correctAnswer: string | number = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Parse title (# Day X: Chapter Name)
      if (trimmedLine.startsWith('# Day ')) {
        const titleMatch = trimmedLine.match(/# Day (\d+): (.+)/);
        if (titleMatch) {
          assessment.day = parseInt(titleMatch[1]);
          assessment.title = titleMatch[2];
          assessment.chapter = titleMatch[2].toLowerCase().replace(/\s+/g, '_');
          continue;
        }
      }

      // Parse question header with topic tags
      // New format: ## Question X [TYPE] [POINTS] [strand/chapter/subtopic]
      if (trimmedLine.startsWith('## Question ')) {
        // Save previous question if exists
        if (currentQuestion) {
          this.finalizeQuestion(currentQuestion, answerOptions, correctAnswer);
          assessment.questions!.push(currentQuestion as Question);
        }

        // Parse new question with topic path
        const questionMatch = trimmedLine.match(/## Question \d+ \[([^\]]+)\] \[(\d+)\s+points?\]\s*(?:\[([^\]]+)\])?/i);
        if (questionMatch) {
          const [, type, points, topicPath] = questionMatch;
          
          // Parse topic path (e.g., "statistics/data_analysis/averages")
          const [strand, chapter, subtopic] = topicPath ? topicPath.split('/') : [undefined, undefined, undefined];
          
          currentQuestion = {
            id: generateId(),
            type: type.toLowerCase() as Question['type'],
            points: parseInt(points),
            hasCanvas: type.toLowerCase() === 'calculation' || type.toLowerCase() === 'written',
            
            // Topic information
            strand: strand || '',
            chapter: chapter || '',
            subtopic: subtopic || '',
            topicPath: topicPath || '',
            
            // Legacy support
            difficulty: 3
          };
          answerOptions = [];
          correctAnswer = '';
        }
        continue;
      }

      // Parse question text (first non-header line after question header)
      if (currentQuestion && !currentQuestion.question && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('Answer:') && !trimmedLine.match(/^[A-D]\)/)) {
        currentQuestion.question = trimmedLine;
        continue;
      }

      // Parse MCQ options (A) B) C) D))
      if (currentQuestion?.type === 'mcq' && trimmedLine.match(/^[A-D]\)/)) {
        const isCorrect = trimmedLine.includes('✓');
        const optionText = trimmedLine.replace(/^[A-D]\)\s*/, '').replace('✓', '').trim();
        answerOptions.push(optionText);
        
        if (isCorrect) {
          correctAnswer = optionText;
        }
        continue;
      }

      // Parse answer (Answer: ...)
      if (trimmedLine.startsWith('Answer:')) {
        correctAnswer = trimmedLine.replace('Answer:', '').trim();
        continue;
      }
    }

    // Finalize last question
    if (currentQuestion) {
      this.finalizeQuestion(currentQuestion, answerOptions, correctAnswer);
      assessment.questions!.push(currentQuestion as Question);
    }

    // Set default values
    assessment.topics = assessment.questions?.map(q => q.subtopic) || [];
    assessment.totalPoints = assessment.questions?.reduce((sum, q) => sum + q.points, 0) || 0;
    assessment.createdAt = new Date();

    return assessment as AssessmentData;
  }

  private static finalizeQuestion(
    question: Partial<Question>, 
    options: string[], 
    correctAnswer: string | number
  ): void {
    if (question.type === 'mcq') {
      question.options = options;
    }
    question.correctAnswer = correctAnswer;
  }

  static generatePreview(assessment: AssessmentData): string {
    let preview = `# ${assessment.title}\n`;
    preview += `**Day ${assessment.day}** | **Total Points: ${assessment.totalPoints}**\n\n`;

    assessment.questions.forEach((question, index) => {
      preview += `## Question ${index + 1} [${question.type.toUpperCase()}] [${question.points} points]\n`;
      preview += `${question.question}\n\n`;

      if (question.type === 'mcq' && question.options) {
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const isCorrect = option === question.correctAnswer;
          preview += `${letter}) ${option}${isCorrect ? ' ✓' : ''}\n`;
        });
      } else {
        preview += `**Answer:** ${question.correctAnswer}\n`;
      }
      
      preview += `*Chapter: ${question.chapter} | Points: ${question.points}*\n\n`;
    });

    return preview;
  }

  static validateMarkdown(markdown: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const lines = markdown.split('\n').filter(line => line.trim());

    // Check for title
    const hasTitle = lines.some(line => line.trim().startsWith('# Day '));
    if (!hasTitle) {
      errors.push('Missing title (# Day X: Chapter Name)');
    }

    // Check for questions
    const questions = lines.filter(line => line.trim().startsWith('## Question '));
    if (questions.length === 0) {
      errors.push('No questions found');
    }

    // Validate question format
    questions.forEach((question, index) => {
      const questionMatch = question.match(/## Question \d+ \[([^\]]+)\] \[(\d+)\s+points?\]\s*(?:\[([^\]]+)\])?/i);
      if (!questionMatch) {
        errors.push(`Question ${index + 1}: Invalid format. Expected: ## Question X [TYPE] [POINTS] [strand/chapter/subtopic]`);
      } else {
        const [, , , topicPath] = questionMatch;
        if (topicPath && topicPath.split('/').length !== 3) {
          errors.push(`Question ${index + 1}: Topic path must have format 'strand/chapter/subtopic'`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}