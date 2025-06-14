'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Upload, RotateCcw } from 'lucide-react';
import CurriculumManager from '@/components/CurriculumManager';
import { SimplifiedCurriculum, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

export default function CurriculumManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<SimplifiedCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadCurriculum();
    }
  }, [user]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/curriculum?userEmail=${encodeURIComponent(user!.email!)}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurriculum(data);
      } else {
        setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
      }
    } catch (error) {
      console.error('Error loading curriculum:', error);
      setCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
      setMessage({ type: 'error', text: 'Failed to load curriculum. Using default.' });
    } finally {
      setLoading(false);
    }
  };

  const saveCurriculum = async (updatedCurriculum: SimplifiedCurriculum) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/curriculum?userEmail=${encodeURIComponent(user!.email!)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCurriculum),
      });

      if (response.ok) {
        setCurriculum(updatedCurriculum);
        setMessage({ type: 'success', text: 'Curriculum saved successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save curriculum' });
      }
    } catch (error) {
      console.error('Error saving curriculum:', error);
      setMessage({ type: 'error', text: 'Failed to save curriculum' });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (confirm('Are you sure you want to reset to the default Cambridge curriculum? This will overwrite all custom changes.')) {
      await saveCurriculum(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    }
  };

  const exportCurriculum = () => {
    if (!curriculum) return;
    
    const dataStr = JSON.stringify(curriculum, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `curriculum_${curriculum.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importCurriculum = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage({ type: 'success', text: 'Importing curriculum...' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as SimplifiedCurriculum;
        
        // Validate SimplifiedCurriculum structure
        if (!imported.id || !imported.name || !imported.strands || !Array.isArray(imported.strands)) {
          setMessage({ type: 'error', text: 'Invalid curriculum file format. Expected id, name, and strands array.' });
          setSaving(false);
          return;
        }

        // Validate strands structure
        const hasValidStrands = imported.strands.every(strand => 
          strand.id && strand.name && Array.isArray(strand.chapters)
        );

        if (!hasValidStrands) {
          setMessage({ type: 'error', text: 'Invalid curriculum structure. Each strand must have id, name, and chapters array.' });
          setSaving(false);
          return;
        }

        // Update timestamp
        imported.lastUpdated = new Date();

        // Save to database immediately
        await saveCurriculum(imported);
        
        setMessage({ type: 'success', text: 'Curriculum imported and saved successfully!' });
      } catch (error) {
        console.error('Import error:', error);
        setMessage({ type: 'error', text: 'Failed to parse curriculum file. Please check the JSON format.' });
        setSaving(false);
      }
    };
    reader.readAsText(file);
    
    // Clear the file input
    event.target.value = '';
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/tutor')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Tutor Dashboard
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportCurriculum}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Export curriculum"
              >
                <Download size={16} />
                Export
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer">
                <Upload size={16} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importCurriculum}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                title="Reset to default"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-4 mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Curriculum Manager */}
      <div className="py-6">
        {curriculum && (
          <CurriculumManager
            key={curriculum.id}
            curriculum={curriculum}
            onSave={saveCurriculum}
            readOnly={saving}
          />
        )}
      </div>

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Saving curriculum...</span>
          </div>
        </div>
      )}
    </div>
  );
}