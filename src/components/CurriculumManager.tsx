'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit3, Trash2, ChevronDown, ChevronRight, Book, Target, Clock, Star } from 'lucide-react';
import { SimplifiedCurriculum, Strand, Chapter, Subtopic, SimplifiedCurriculumManager, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

interface CurriculumManagerProps {
  curriculum?: SimplifiedCurriculum;
  onSave?: (curriculum: SimplifiedCurriculum) => void;
  readOnly?: boolean;
}

export default function CurriculumManager({ curriculum: propCurriculum, onSave, readOnly = false }: CurriculumManagerProps) {
  const [curriculum, setCurriculum] = useState<SimplifiedCurriculum>(propCurriculum || SIMPLIFIED_CAMBRIDGE_CURRICULUM);
  const [expandedStrands, setExpandedStrands] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: string; id: string } | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Update local curriculum when prop changes
  useEffect(() => {
    if (propCurriculum) {
      setCurriculum(propCurriculum);
    }
  }, [propCurriculum]);

  const toggleExpand = (type: 'strand' | 'chapter', id: string) => {
    const setters = {
      strand: setExpandedStrands,
      chapter: setExpandedChapters
    };
    
    const setter = setters[type];
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditing = (type: string, item: any) => {
    setEditingItem({ type, id: item.id });
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const saveItem = () => {
    if (!editingItem) return;

    const newCurriculum = { ...curriculum };
    
    if (editingItem.type === 'strand') {
      const strandIndex = newCurriculum.strands.findIndex(s => s.id === editingItem.id);
      if (strandIndex !== -1) {
        newCurriculum.strands[strandIndex] = { ...editForm };
      }
    } else if (editingItem.type === 'chapter') {
      newCurriculum.strands = newCurriculum.strands.map(strand => ({
        ...strand,
        chapters: strand.chapters.map(chapter => 
          chapter.id === editingItem.id ? { ...editForm } : chapter
        )
      }));
    } else if (editingItem.type === 'subtopic') {
      newCurriculum.strands = newCurriculum.strands.map(strand => ({
        ...strand,
        chapters: strand.chapters.map(chapter => ({
          ...chapter,
          subtopics: chapter.subtopics.map(subtopic =>
            subtopic.id === editingItem.id ? { ...editForm } : subtopic
          )
        }))
      }));
    }

    setCurriculum(newCurriculum);
    setEditingItem(null);
    setEditForm({});
    
    if (onSave) {
      onSave(newCurriculum);
    }
  };

  const addNewItem = (type: string, parentId?: string) => {
    const newId = `new_${type}_${Date.now()}`;
    
    if (type === 'strand') {
      const newStrand: Strand = {
        id: newId,
        name: 'New Strand',
        description: 'New strand description',
        color: '#3B82F6',
        chapters: []
      };
      setCurriculum(prev => ({
        ...prev,
        strands: [...prev.strands, newStrand]
      }));
    } else if (type === 'chapter' && parentId) {
      const newChapter: Chapter = {
        id: newId,
        name: 'New Chapter',
        description: 'New chapter description',
        subtopics: []
      };
      setCurriculum(prev => ({
        ...prev,
        strands: prev.strands.map(strand =>
          strand.id === parentId
            ? { ...strand, chapters: [...strand.chapters, newChapter] }
            : strand
        )
      }));
    } else if (type === 'subtopic' && parentId) {
      const newSubtopic: Subtopic = {
        id: newId,
        name: 'New Subtopic',
        description: 'New subtopic description'
      };
      setCurriculum(prev => ({
        ...prev,
        strands: prev.strands.map(strand => ({
          ...strand,
          chapters: strand.chapters.map(chapter =>
            chapter.id === parentId
              ? { ...chapter, subtopics: [...chapter.subtopics, newSubtopic] }
              : chapter
          )
        }))
      }));
    }
  };

  const deleteItem = (type: string, id: string) => {
    if (type === 'strand') {
      setCurriculum(prev => ({
        ...prev,
        strands: prev.strands.filter(s => s.id !== id)
      }));
    } else if (type === 'chapter') {
      setCurriculum(prev => ({
        ...prev,
        strands: prev.strands.map(strand => ({
          ...strand,
          chapters: strand.chapters.filter(ch => ch.id !== id)
        }))
      }));
    } else if (type === 'subtopic') {
      setCurriculum(prev => ({
        ...prev,
        strands: prev.strands.map(strand => ({
          ...strand,
          chapters: strand.chapters.map(chapter => ({
            ...chapter,
            subtopics: chapter.subtopics.filter(st => st.id !== id)
          }))
        }))
      }));
    }
  };


  const EditForm = ({ item, type }: { item: any; type: string }) => (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={editForm.name || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={editForm.description || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {type === 'strand' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={editForm.color || '#3B82F6'}
              onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={cancelEditing}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={saveItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={16} />
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Book className="text-blue-600" />
              Curriculum Manager
            </h1>
            <p className="text-gray-600">{curriculum.name}</p>
          </div>
          
          {!readOnly && (
            <button
              onClick={() => onSave?.(curriculum)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Save size={16} />
              Save Curriculum
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <Target size={20} />
              Strands
            </div>
            <div className="text-2xl font-bold text-blue-900">{curriculum.strands.length}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <Book size={20} />
              Chapters
            </div>
            <div className="text-2xl font-bold text-green-900">
              {curriculum.strands.reduce((sum, strand) => sum + strand.chapters.length, 0)}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-700 font-semibold">
              <Star size={20} />
              Subtopics
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {curriculum.strands.reduce((sum, strand) => 
                sum + strand.chapters.reduce((chSum, chapter) => chSum + chapter.subtopics.length, 0), 0
              )}
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="mb-4">
            <button
              onClick={() => addNewItem('strand')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Strand
            </button>
          </div>
        )}

        <div className="space-y-4">
          {curriculum.strands.map((strand) => (
            <div key={strand.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand('strand', strand.id)}
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                    >
                      {expandedStrands.has(strand.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: strand.color }}
                      ></div>
                      <h3 className="font-semibold text-lg">{strand.name}</h3>
                    </button>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => addNewItem('chapter', strand.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Add Chapter"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => startEditing('strand', strand)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit Strand"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem('strand', strand.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Strand"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mt-1">{strand.description}</p>
              </div>

              {editingItem?.type === 'strand' && editingItem.id === strand.id && (
                <div className="p-4 border-t">
                  <EditForm item={strand} type="strand" />
                </div>
              )}

              {expandedStrands.has(strand.id) && (
                <div className="p-4 space-y-3">
                  {strand.chapters.map((chapter) => (
                    <div key={chapter.id} className="border border-gray-100 rounded-lg">
                      <div className="bg-gray-25 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand('chapter', chapter.id)}
                              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                            >
                              {expandedChapters.has(chapter.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              <h4 className="font-medium">{chapter.name}</h4>
                            </button>
                            
                          </div>
                          
                          {!readOnly && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => addNewItem('subtopic', chapter.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Add Subtopic"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={() => startEditing('chapter', chapter)}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                title="Edit Chapter"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteItem('chapter', chapter.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete Chapter"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                      </div>

                      {editingItem?.type === 'chapter' && editingItem.id === chapter.id && (
                        <div className="p-3 border-t">
                          <EditForm item={chapter} type="chapter" />
                        </div>
                      )}

                      {expandedChapters.has(chapter.id) && (
                        <div className="p-3 space-y-2">
                          {chapter.subtopics.map((subtopic) => (
                            <div key={subtopic.id} className="bg-gray-25 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-sm text-gray-800">{subtopic.name}</h5>
                                </div>
                                
                                {!readOnly && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => startEditing('subtopic', subtopic)}
                                      className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                      title="Edit Subtopic"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button
                                      onClick={() => deleteItem('subtopic', subtopic.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                      title="Delete Subtopic"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 mt-1">{subtopic.description}</p>

                              {editingItem?.type === 'subtopic' && editingItem.id === subtopic.id && (
                                <div className="mt-2 p-2 border-t">
                                  <EditForm item={subtopic} type="subtopic" />
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
          ))}
        </div>
      </div>
    </div>
  );
}