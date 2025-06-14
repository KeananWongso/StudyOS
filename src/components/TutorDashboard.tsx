'use client';

import { useState, useEffect } from 'react';
import { AssessmentData } from '@/lib/types';
import { MarkdownParser } from '@/lib/markdown-parser';
import { SimplifiedCurriculum, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';
import { Eye, Save, Upload, AlertCircle, CheckCircle, ArrowLeft, BookOpen, Users, GraduationCap, TrendingUp, Tag, Plus, Brain } from 'lucide-react';
import { CompactProgressTrackerLogo } from './ProgressTrackerLogo';
import Markdown from 'markdown-to-jsx';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import UserMenu from './UserMenu';
import StudentViewPreview from './StudentViewPreview';

export default function TutorDashboard() {
  const [markdownInput, setMarkdownInput] = useState('');
  const [parsedAssessment, setParsedAssessment] = useState<AssessmentData | null>(null);
  const { user } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<'tutor' | 'student'>('tutor');
  const [curriculum, setCurriculum] = useState<SimplifiedCurriculum>(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
  const [curriculumLoading, setCurriculumLoading] = useState(true);

  // Load curriculum from database
  useEffect(() => {
    const loadCurriculum = async () => {
      if (!user?.email) return;
      
      try {
        setCurriculumLoading(true);
        const response = await fetch(`/api/curriculum?userEmail=${encodeURIComponent(user.email)}`);
        
        if (response.ok) {
          const data = await response.json();
          setCurriculum(data);
        } else {
          // Use default if no custom curriculum
          setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
        }
      } catch (error) {
        console.error('Error loading curriculum:', error);
        setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
      } finally {
        setCurriculumLoading(false);
      }
    };
    
    loadCurriculum();
  }, [user?.email]);

  // Generate example markdown based on curriculum
  const generateExampleFromCurriculum = () => {
    if (!curriculum.strands.length) return '';
    
    const firstStrand = curriculum.strands[0];
    const firstChapter = firstStrand.chapters[0];
    const firstSubtopic = firstChapter?.subtopics[0];
    
    const topicPath = firstSubtopic ? 
      `${firstStrand.id}/${firstChapter.id}/${firstSubtopic.id}` : 
      `${firstStrand.id}/${firstChapter?.id || 'chapter'}`;
      
    return `# ${firstStrand.name}

## Question 1 [mcq] [5 points] [${topicPath}]
What is the result of 12 + 3 × 4 - 2?
A) 22 ✓
B) 58
C) 18
D) 46

## Question 2 [written] [10 points] [${topicPath}]
${firstSubtopic?.description || 'Solve the following problem'}
Answer: Show your working

## Question 3 [calculation] [15 points] [${topicPath}]
Calculate: (-5) × (-3) + 7
Answer: 22`;
  };

  const exampleMarkdown = generateExampleFromCurriculum();

  const handleInputChange = (value: string) => {
    setMarkdownInput(value);
    setValidationErrors([]);
    setSaveStatus('idle');
    
    // Validate and parse in real-time
    const validation = MarkdownParser.validateMarkdown(value);
    if (validation.isValid && value.trim()) {
      try {
        const assessment = MarkdownParser.parseAssessment(value);
        setParsedAssessment(assessment);
      } catch (error) {
        setValidationErrors(['Failed to parse assessment']);
        setParsedAssessment(null);
      }
    } else {
      setValidationErrors(validation.errors);
      setParsedAssessment(null);
    }
  };

  const handleSaveAssessment = async () => {
    if (!parsedAssessment) return;

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      // Remove the auto-generated ID since Firestore will create its own
      const { id, ...assessmentToSave } = parsedAssessment;
      
      // Add creator information for tutor tracking
      const assessmentWithCreator = {
        ...assessmentToSave,
        createdBy: user?.email,
        creatorName: user?.displayName || user?.email?.split('@')[0],
        createdAt: new Date()
      };
      
      console.log('Saving assessment with creator info:', assessmentWithCreator);
      
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentWithCreator),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        console.error('Save failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadExample = () => {
    const dynamicExample = generateExampleFromCurriculum();
    setMarkdownInput(dynamicExample);
    handleInputChange(dynamicExample);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/tutor/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tutor/dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Eye size={14} />
                Dashboard
              </Link>
              <Link
                href="/tutor/analytics"
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <TrendingUp size={14} />
                Analytics
              </Link>
              <Link
                href="/curriculum"
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <BookOpen size={14} />
                Curriculum
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CompactProgressTrackerLogo size={48} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Progress Tracker - {viewMode === 'tutor' ? 'Tutor' : 'Student View'} Dashboard
                </h1>
                <p className="text-gray-600">
                  {viewMode === 'tutor' 
                    ? `Welcome, ${user?.displayName?.split(' ')[0] || 'Tutor'}! Create and manage assessments for the 15-day crash course`
                    : 'Preview of the exact student experience with sample data'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle Button */}
              <button 
                onClick={() => setViewMode(viewMode === 'tutor' ? 'student' : 'tutor')}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-full font-semibold transition-all duration-300 ${
                  viewMode === 'student' 
                    ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' 
                    : 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {viewMode === 'tutor' ? (
                  <>
                    <Users className="h-4 w-4" />
                    View as Student
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    Back to Tutor View
                  </>
                )}
              </button>
              
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Conditional Content Based on View Mode */}
        {viewMode === 'tutor' ? (
          <TutorContent 
            markdownInput={markdownInput}
            parsedAssessment={parsedAssessment}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            validationErrors={validationErrors}
            saveStatus={saveStatus}
            isLoading={isLoading}
            handleInputChange={handleInputChange}
            handleSaveAssessment={handleSaveAssessment}
            handleLoadExample={handleLoadExample}
            curriculum={curriculum}
            curriculumLoading={curriculumLoading}
          />
        ) : (
          <StudentViewPreview />
        )}
      </div>
    </div>
  );
}

// Extract tutor content to a separate component for cleaner code
function TutorContent({ 
  markdownInput, 
  parsedAssessment, 
  showPreview, 
  setShowPreview, 
  validationErrors, 
  saveStatus, 
  isLoading, 
  handleInputChange, 
  handleSaveAssessment, 
  handleLoadExample,
  curriculum,
  curriculumLoading
}: any) {
  
  const insertQuestionTemplate = (topicPath: string, subtopicName: string, questionType: 'mcq' | 'written' | 'calculation' = 'mcq') => {
    // Generate question number based on existing questions
    const currentText = markdownInput;
    const questionMatches = currentText.match(/## Question \d+/g) || [];
    const nextQuestionNum = questionMatches.length + 1;
    
    // Create template based on question type
    let questionTemplate = '';
    
    switch (questionType) {
      case 'mcq':
        questionTemplate = `

## Question ${nextQuestionNum} [mcq] [5 points] [${topicPath}]
${subtopicName} - Write your question here
A) Option A
B) Option B  
C) Option C ✓
D) Option D

`;
        break;
      
      case 'written':
        questionTemplate = `

## Question ${nextQuestionNum} [written] [10 points] [${topicPath}]
${subtopicName} - Write your question here
Answer: Show your working

`;
        break;
        
      case 'calculation':
        questionTemplate = `

## Question ${nextQuestionNum} [calculation] [15 points] [${topicPath}]
${subtopicName} - Calculate: Write your calculation here
Answer: Your answer here

`;
        break;
    }
    
    // Insert at cursor position
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + questionTemplate + text.substring(end);
      handleInputChange(newText);
      
      // Set cursor position after inserted template
      setTimeout(() => {
        const newPosition = start + questionTemplate.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Assessment Input
              </h2>
              <button
                onClick={handleLoadExample}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Load Example
              </button>
            </div>

            <textarea
              value={markdownInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your assessment in markdown format..."
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {validationErrors.length > 0 && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{validationErrors.length} errors</span>
                  </div>
                )}
                {parsedAssessment && validationErrors.length === 0 && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Valid assessment</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!parsedAssessment}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={handleSaveAssessment}
                  disabled={!parsedAssessment || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveStatus === 'saving' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {saveStatus === 'saving' ? 'Saving...' :
                     saveStatus === 'saved' ? 'Saved!' :
                     saveStatus === 'error' ? 'Error' : 'Save'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview/Validation Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {showPreview ? 'Assessment Preview' : 'Validation'}
            </h2>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-red-800 font-medium mb-2">Validation Errors:</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {showPreview && parsedAssessment ? (
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 prose-ol:text-gray-800 prose-ul:text-gray-800">
                <style jsx>{`
                  :global(.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6) {
                    color: #111827 !important;
                    font-weight: 600 !important;
                  }
                  :global(.prose p, .prose li, .prose span) {
                    color: #374151 !important;
                  }
                  :global(.prose strong) {
                    color: #111827 !important;
                    font-weight: 700 !important;
                  }
                  :global(.prose ol, .prose ul) {
                    color: #374151 !important;
                  }
                `}</style>
                <Markdown>
                  {MarkdownParser.generatePreview(parsedAssessment)}
                </Markdown>
              </div>
            ) : parsedAssessment ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-800 font-medium mb-2">Assessment Summary:</h3>
                  <div className="text-green-700 text-sm space-y-1">
                    <p><strong>Title:</strong> {parsedAssessment.title}</p>
                    <p><strong>Day:</strong> {parsedAssessment.day}</p>
                    <p><strong>Questions:</strong> {parsedAssessment.questions.length}</p>
                    <p><strong>Total Points:</strong> {parsedAssessment.totalPoints}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-blue-800 font-medium text-sm">MCQ Questions</div>
                    <div className="text-blue-700 text-2xl font-bold">
                      {parsedAssessment.questions.filter(q => q.type === 'mcq').length}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-purple-800 font-medium text-sm">Written Questions</div>
                    <div className="text-purple-700 text-2xl font-bold">
                      {parsedAssessment.questions.filter(q => q.type === 'written').length}
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-orange-800 font-medium text-sm">Calculation Questions</div>
                    <div className="text-orange-700 text-2xl font-bold">
                      {parsedAssessment.questions.filter(q => q.type === 'calculation').length}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 text-center py-8">
                <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter assessment content to see validation results</p>
              </div>
            )}
          </div>

          {/* Curriculum Topic Browser */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Curriculum Topics
              </h2>
              {curriculumLoading && (
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {curriculumLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading curriculum...</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {curriculum.strands.map((strand) => (
                  <CurriculumStrandBrowser
                    key={strand.id}
                    strand={strand}
                    onQuestionTemplateInsert={insertQuestionTemplate}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                💡 <strong>Click any button to insert complete question template:</strong>
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• <strong>"MCQ"</strong> - Multiple choice question template (5 pts)</li>
                <li>• <strong>"Written"</strong> - Written response question template (10 pts)</li>
                <li>• <strong>"Calc"</strong> - Calculation question template (15 pts)</li>
              </ul>
            </div>
          </div>
    </div>
  );
}

// Curriculum Browser Component
function CurriculumStrandBrowser({ 
  strand, 
  onQuestionTemplateInsert 
}: { 
  strand: any; 
  onQuestionTemplateInsert: (path: string, name: string, type?: 'mcq' | 'written' | 'calculation') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 hover:bg-gray-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: strand.color }}
          ></div>
          <span className="font-semibold text-sm text-gray-900">{strand.name}</span>
        </div>
        <span className="text-gray-400">{expanded ? '−' : '+'}</span>
      </button>
      
      {expanded && (
        <div className="border-t border-gray-200">
          {strand.chapters.map((chapter: any) => (
            <div key={chapter.id} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full text-left p-3 pl-6 hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-900">{chapter.name}</span>
                <span className="text-gray-400 text-xs">{expandedChapters.has(chapter.id) ? '−' : '+'}</span>
              </button>
              
              {expandedChapters.has(chapter.id) && (
                <div className="bg-gray-50">
                  {chapter.subtopics.map((subtopic: any) => (
                    <div key={subtopic.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className="flex-1 p-2 pl-12">
                          <div className="text-sm font-semibold text-gray-900">{subtopic.name}</div>
                          <div className="text-xs text-gray-700">{subtopic.description}</div>
                        </div>
                        <div className="flex gap-1 pr-2 flex-wrap">
                          <button
                            onClick={() => onQuestionTemplateInsert(`${strand.id}/${chapter.id}/${subtopic.id}`, subtopic.name, 'mcq')}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                            title="Insert MCQ question template"
                          >
                            MCQ
                          </button>
                          <button
                            onClick={() => onQuestionTemplateInsert(`${strand.id}/${chapter.id}/${subtopic.id}`, subtopic.name, 'written')}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                            title="Insert written question template"
                          >
                            Written
                          </button>
                          <button
                            onClick={() => onQuestionTemplateInsert(`${strand.id}/${chapter.id}/${subtopic.id}`, subtopic.name, 'calculation')}
                            className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
                            title="Insert calculation question template"
                          >
                            Calc
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}