'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { SimplifiedCurriculum, SimplifiedCurriculumManager, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

interface TopicSelectorProps {
  onTopicSelect: (topicPath: string) => void;
  selectedTopic?: string;
  onClose?: () => void;
  className?: string;
}

export default function TopicSelector({ onTopicSelect, selectedTopic, onClose, className = '' }: TopicSelectorProps) {
  const [curriculum, setCurriculum] = useState<SimplifiedCurriculum>(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
  const [loading, setLoading] = useState(true);

  // Load curriculum from API
  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const response = await fetch('/api/curriculum/default');
        if (response.ok) {
          const data = await response.json();
          setCurriculum(data);
        }
      } catch (error) {
        console.error('Failed to load curriculum for TopicSelector:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCurriculum();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStrands, setExpandedStrands] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Get all topic options for searching
  const allTopicOptions = SimplifiedCurriculumManager.getAllTopicOptions(curriculum);
  
  // Filter topics based on search term
  const filteredTopics = searchTerm 
    ? allTopicOptions.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.strand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.chapter.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const toggleStrand = (strandId: string) => {
    const newExpanded = new Set(expandedStrands);
    if (newExpanded.has(strandId)) {
      newExpanded.delete(strandId);
    } else {
      newExpanded.add(strandId);
    }
    setExpandedStrands(newExpanded);
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleTopicSelect = (topicPath: string) => {
    onTopicSelect(topicPath);
    if (onClose) {
      onClose();
    }
  };

  const getSelectedTopicDisplay = () => {
    if (!selectedTopic) return 'No topic selected';
    return SimplifiedCurriculumManager.getTopicDisplayName(curriculum, selectedTopic);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            Select Topic
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Current Selection */}
        {selectedTopic && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <span className="text-blue-700 font-medium">Selected: </span>
            <span className="text-blue-900">{getSelectedTopicDisplay()}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Results or Topic Tree */}
      <div className="max-h-96 overflow-y-auto">
        {searchTerm ? (
          // Search Results
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Search Results ({filteredTopics.length})</h4>
            {filteredTopics.length > 0 ? (
              <div className="space-y-2">
                {filteredTopics.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTopicSelect(option.value)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors ${
                      selectedTopic === option.value 
                        ? 'bg-blue-100 border-blue-400 text-blue-900' 
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.value}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No topics found matching "{searchTerm}"</p>
            )}
          </div>
        ) : (
          // Topic Hierarchy Tree
          <div className="p-4">
            {curriculum.strands.map((strand) => (
              <div key={strand.id} className="mb-4">
                {/* Strand Header */}
                <button
                  onClick={() => toggleStrand(strand.id)}
                  className="w-full flex items-center gap-2 p-2 text-left font-medium text-gray-900 hover:bg-gray-50 rounded"
                >
                  {expandedStrands.has(strand.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: strand.color }}
                  ></div>
                  <span>{strand.name}</span>
                </button>

                {/* Chapters */}
                {expandedStrands.has(strand.id) && (
                  <div className="ml-6 mt-2 space-y-2">
                    {strand.chapters.map((chapter) => (
                      <div key={chapter.id}>
                        {/* Chapter Header */}
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex items-center gap-2 p-2 text-left text-gray-800 hover:bg-gray-50 rounded"
                        >
                          {expandedChapters.has(chapter.id) ? (
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-sm font-medium">{chapter.name}</span>
                        </button>

                        {/* Subtopics */}
                        {expandedChapters.has(chapter.id) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {chapter.subtopics.map((subtopic) => {
                              const topicPath = `${strand.id}/${chapter.id}/${subtopic.id}`;
                              const isSelected = selectedTopic === topicPath;
                              
                              return (
                                <button
                                  key={subtopic.id}
                                  onClick={() => handleTopicSelect(topicPath)}
                                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                    isSelected
                                      ? 'bg-blue-100 border border-blue-300 text-blue-900'
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="font-medium">{subtopic.name}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{subtopic.description}</div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500">
          Select a topic to tag questions for accurate weakness detection
        </p>
      </div>
    </div>
  );
}

// Quick Topic Selector for inline use
export function QuickTopicSelector({ onTopicSelect, selectedTopic, placeholder = "Select topic..." }: {
  onTopicSelect: (topicPath: string) => void;
  selectedTopic?: string;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [curriculum] = useState<SimplifiedCurriculum>(SIMPLIFIED_CAMBRIDGE_CURRICULUM);

  const getSelectedDisplay = () => {
    if (!selectedTopic) return placeholder;
    return SimplifiedCurriculumManager.getTopicDisplayName(curriculum, selectedTopic);
  };

  const handleSelect = (topicPath: string) => {
    onTopicSelect(topicPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between ${
          selectedTopic 
            ? 'border-blue-300 bg-blue-50 text-blue-900' 
            : 'border-gray-300 bg-white text-gray-700'
        }`}
      >
        <span className="truncate">{getSelectedDisplay()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <TopicSelector
            onTopicSelect={handleSelect}
            selectedTopic={selectedTopic}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}