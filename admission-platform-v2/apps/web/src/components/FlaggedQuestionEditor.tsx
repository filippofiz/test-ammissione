/**
 * Flagged Question Editor Component
 * Displays a single flagged question with full editing capabilities inline
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSave,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faTrash,
  faImage,
  faUpload,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer } from './MathJaxRenderer';
import { supabase } from '../lib/supabase';

interface FlaggedQuestionEditorProps {
  question: any;
  onUpdate: () => void;
  onClearFlag: (questionId: string) => void;
  onGoToTest: (testId: string, questionNumber: number) => void;
}

export function FlaggedQuestionEditor({ question, onUpdate, onClearFlag, onGoToTest }: FlaggedQuestionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    question_text: question.question_data?.question_text || '',
    question_text_eng: question.question_data?.question_text_eng || '',
    correct_answer: question.answers?.correct_answer || '',
    options: question.question_data?.options || {},
    options_eng: question.question_data?.options_eng || {},
    image_url: question.question_data?.image_url || '',
    image_options: question.question_data?.image_options || {},
  });

  // Image management
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageTarget, setCurrentImageTarget] = useState<'question' | string>('question'); // 'question' or option key like 'a', 'b', 'c', 'd'

  const reviewData = question.Questions_toReview;
  const testInfo = question['2V_tests'];

  async function saveChanges() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('2V_questions')
        .update({
          question_data: {
            ...question.question_data,
            question_text: editedData.question_text,
            question_text_eng: editedData.question_text_eng,
            options: editedData.options,
            options_eng: editedData.options_eng,
            image_url: editedData.image_url,
            image_options: editedData.image_options,
          },
          answers: {
            ...question.answers,
            correct_answer: editedData.correct_answer,
          },
        })
        .eq('id', question.id);

      if (error) throw error;

      alert('Question updated successfully!');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${question.id}_${currentImageTarget}_${Date.now()}.${fileExt}`;
      const filePath = `question-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('question-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('question-images')
        .getPublicUrl(filePath);

      // Update local state
      if (currentImageTarget === 'question') {
        setEditedData({ ...editedData, image_url: publicUrl });
      } else {
        setEditedData({
          ...editedData,
          image_options: {
            ...editedData.image_options,
            [currentImageTarget]: publicUrl
          }
        });
      }

      setShowImageModal(false);
      alert('Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }

  function openImageModal(target: 'question' | string) {
    setCurrentImageTarget(target);
    setShowImageModal(true);
  }

  function removeImage(target: 'question' | string) {
    if (!confirm('Remove this image?')) return;

    if (target === 'question') {
      setEditedData({ ...editedData, image_url: '' });
    } else {
      const newImageOptions = { ...editedData.image_options };
      delete newImageOptions[target];
      setEditedData({ ...editedData, image_options: newImageOptions });
    }
  }

  async function clearFlag() {
    if (!confirm('Clear the flag from this question?')) return;

    try {
      const { error } = await supabase
        .from('2V_questions')
        .update({ Questions_toReview: null })
        .eq('id', question.id);

      if (error) throw error;

      onClearFlag(question.id);
    } catch (err) {
      console.error('Error clearing flag:', err);
      alert('Failed to clear flag');
    }
  }

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Header with Test Info */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-orange-200">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Q{question.question_number}
            </span>
            <span className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-semibold">
              {testInfo.test_type}
            </span>
            <span className="text-gray-600 text-sm">
              {testInfo.section} - {testInfo.exercise_type} #{testInfo.test_number}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Question ID: {question.id.slice(0, 8)}...
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onGoToTest(testInfo.id, question.question_number)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-semibold text-sm"
                title="View in full test review with PDF"
              >
                <FontAwesomeIcon icon={faArrowRight} />
                Full Test
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 font-semibold text-sm"
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit
              </button>
              <button
                onClick={clearFlag}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-semibold text-sm"
                title="Mark as fixed and clear flag"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                Fixed
              </button>
            </>
          )}
        </div>
      </div>

      {/* Review Notes */}
      {reviewData?.notes && (
        <div className="mb-6 bg-orange-100 border-l-8 border-orange-500 rounded-lg p-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <p className="text-lg font-bold text-orange-800 uppercase tracking-wide">
              ⚠️ Issue to Fix
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
            <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
              {reviewData.notes}
            </p>
          </div>
        </div>
      )}

      {/* Question Text */}
      <div className="mb-4 bg-white rounded-lg p-4 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">Question Text (IT):</p>
          {isEditing && (
            <button
              onClick={() => openImageModal('question')}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faImage} />
              {editedData.image_url ? 'Change Image' : 'Add Image'}
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            value={editedData.question_text}
            onChange={(e) => setEditedData({ ...editedData, question_text: e.target.value })}
            className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm"
            rows={4}
          />
        ) : (
          <div className="text-gray-800">
            <MathJaxRenderer>{editedData.question_text}</MathJaxRenderer>
          </div>
        )}

        {/* Question Image */}
        {editedData.image_url && (
          <div className="mt-3 relative inline-block">
            <img
              src={editedData.image_url}
              alt="Question"
              className="max-w-full max-h-80 rounded-lg border-2 border-gray-300 object-contain"
            />
            {isEditing && (
              <button
                onClick={() => removeImage('question')}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shadow-lg"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Question Text English */}
      {(editedData.question_text_eng || isEditing) && (
        <div className="mb-4 bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">Question Text (EN):</p>
          {isEditing ? (
            <textarea
              value={editedData.question_text_eng}
              onChange={(e) => setEditedData({ ...editedData, question_text_eng: e.target.value })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm"
              rows={4}
            />
          ) : (
            <div className="text-gray-800">
              <MathJaxRenderer>{editedData.question_text_eng}</MathJaxRenderer>
            </div>
          )}
        </div>
      )}

      {/* Options (if multiple choice) */}
      {editedData.options && Object.keys(editedData.options).length > 0 && (
        <div className="mb-4 bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-3">Answer Options (IT):</p>
          <div className="space-y-4">
            {Object.entries(editedData.options).map(([key, value]) => {
              const isCorrect = String(editedData.correct_answer).toLowerCase() === key.toLowerCase();
              return (
              <div
                key={key}
                className={`border-l-4 pl-3 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className={`font-bold min-w-[24px] ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                    {key.toUpperCase()})
                    {isCorrect && <span className="ml-1 text-xs">✓</span>}
                  </span>
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea
                        value={String(value)}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          options: { ...editedData.options, [key]: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                        rows={2}
                      />
                    ) : (
                      <MathJaxRenderer>{String(value)}</MathJaxRenderer>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => openImageModal(key)}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200 flex items-center gap-1"
                      title={editedData.image_options?.[key] ? 'Change option image' : 'Add option image'}
                    >
                      <FontAwesomeIcon icon={faImage} />
                    </button>
                  )}
                </div>

                {/* Option Image */}
                {editedData.image_options?.[key] && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={editedData.image_options[key]}
                      alt={`Option ${key.toUpperCase()}`}
                      className="max-w-xs max-h-48 rounded border-2 border-gray-300 object-contain"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeImage(key)}
                        className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shadow-lg"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Options English */}
      {editedData.options_eng && Object.keys(editedData.options_eng).length > 0 && (
        <div className="mb-4 bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-3">Answer Options (EN):</p>
          <div className="space-y-4">
            {Object.entries(editedData.options_eng).map(([key, value]) => {
              const isCorrect = String(editedData.correct_answer).toLowerCase() === key.toLowerCase();
              return (
              <div
                key={key}
                className={`border-l-4 pl-3 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className={`font-bold min-w-[24px] ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                    {key.toUpperCase()})
                    {isCorrect && <span className="ml-1 text-xs">✓</span>}
                  </span>
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea
                        value={String(value)}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          options_eng: { ...editedData.options_eng, [key]: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                        rows={2}
                      />
                    ) : (
                      <MathJaxRenderer>{String(value)}</MathJaxRenderer>
                    )}
                  </div>
                </div>

                {/* Option Image (shared with IT options) */}
                {editedData.image_options?.[key] && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={editedData.image_options[key]}
                      alt={`Option ${key.toUpperCase()}`}
                      className="max-w-xs max-h-48 rounded border-2 border-gray-300 object-contain"
                    />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Correct Answer */}
      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
        <p className="text-sm font-semibold text-green-700 mb-2">Correct Answer:</p>
        {isEditing ? (
          <input
            type="text"
            value={String(editedData.correct_answer)}
            onChange={(e) => setEditedData({ ...editedData, correct_answer: e.target.value })}
            className="w-full p-3 border-2 border-green-400 rounded font-bold text-lg bg-white text-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            placeholder="Enter correct answer (e.g., a, b, c, d)"
          />
        ) : (
          <div className="font-bold text-green-700 text-xl bg-green-100 px-4 py-2 rounded inline-block">
            {String(editedData.correct_answer)}
          </div>
        )}
      </div>

      {/* Flagged Info */}
      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {reviewData?.flagged_at && (
            <span>
              Flagged: {new Date(reviewData.flagged_at).toLocaleDateString()}
            </span>
          )}
          {reviewData?.flagged_by_name && (
            <span>
              By: {reviewData.flagged_by_name}
            </span>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-brand-dark">
                {currentImageTarget === 'question'
                  ? (editedData.image_url ? 'Change Question Image' : 'Add Question Image')
                  : (editedData.image_options?.[currentImageTarget]
                      ? `Change Image for Option ${currentImageTarget.toUpperCase()}`
                      : `Add Image for Option ${currentImageTarget.toUpperCase()}`)}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                disabled={uploadingImage}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>

              {uploadingImage && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-blue-600">
                    <FontAwesomeIcon icon={faUpload} className="animate-pulse mr-2" />
                    Uploading...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
