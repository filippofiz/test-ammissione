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
  passage?: {
    passage_id: string;
    passage_text: string;
    passage_text_eng?: string;
    passage_title?: string;
    passage_title_eng?: string;
    question_numbers: number[];
  } | null;
  isArchived?: boolean;
}

export function FlaggedQuestionEditor({ question, onUpdate, onClearFlag, onGoToTest, passage, isArchived = false }: FlaggedQuestionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    question_text: question.question_data?.question_text || '',
    question_text_eng: question.question_data?.question_text_eng || '',
    correct_answer: question.answers?.correct_answer || '',
    options: question.question_data?.options || {},
    options_eng: question.question_data?.options_eng || {},
    image_url: question.question_data?.image_url || '',
    image_url_eng: question.question_data?.image_url_eng || '',
    image_options: question.question_data?.image_options || {},
    image_options_eng: question.question_data?.image_options_eng || {},
    passage_text: question.question_data?.passage_text || '',
    passage_text_eng: question.question_data?.passage_text_eng || '',
    passage_title: question.question_data?.passage_title || '',
    passage_title_eng: question.question_data?.passage_title_eng || '',
  });

  // Image management
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageTarget, setCurrentImageTarget] = useState<'question' | string>('question'); // 'question' or option key like 'a', 'b', 'c', 'd'
  const [selectedImageLanguage, setSelectedImageLanguage] = useState<'ita' | 'eng'>('ita');

  const reviewData = question.Questions_toReview;
  const testInfo = question['2V_tests'];

  async function saveChanges() {
    setSaving(true);
    try {
      // Update this question
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
            image_url_eng: editedData.image_url_eng,
            image_options: editedData.image_options,
            image_options_eng: editedData.image_options_eng,
            passage_text: editedData.passage_text || null,
            passage_text_eng: editedData.passage_text_eng || null,
            passage_title: editedData.passage_title || null,
            passage_title_eng: editedData.passage_title_eng || null,
          },
          answers: {
            ...question.answers,
            correct_answer: editedData.correct_answer,
          },
        })
        .eq('id', question.id);

      if (error) throw error;

      // If this question has a passage, update all other questions with the same passage_id
      if (passage && question.question_data?.passage_id) {
        // Fetch all questions with the same passage_id
        const { data: relatedQuestions, error: fetchError } = await supabase
          .from('2V_questions')
          .select('*')
          .eq('question_data->passage_id', question.question_data.passage_id)
          .neq('id', question.id);

        if (fetchError) {
          console.error('Error fetching related questions:', fetchError);
        } else if (relatedQuestions && relatedQuestions.length > 0) {
          // Update each related question's passage data
          for (const relatedQ of relatedQuestions) {
            await supabase
              .from('2V_questions')
              .update({
                question_data: {
                  ...relatedQ.question_data,
                  passage_text: editedData.passage_text || null,
                  passage_text_eng: editedData.passage_text_eng || null,
                  passage_title: editedData.passage_title || null,
                  passage_title_eng: editedData.passage_title_eng || null,
                }
              })
              .eq('id', relatedQ.id);
          }
          console.log(`Updated passage for ${relatedQuestions.length} related questions`);
        }
      }

      alert('Question updated successfully!');
      setIsEditing(false);
      // Don't reload the list - just exit edit mode
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
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const filePath = `${question.id}_${currentImageTarget}_${selectedImageLanguage}_${Date.now()}.${fileExt}`;

      // Upload via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { publicUrl } = await response.json();

      if (!publicUrl) {
        throw new Error('No image URL returned from upload');
      }

      // Update local state based on language
      if (currentImageTarget === 'question') {
        if (selectedImageLanguage === 'ita') {
          setEditedData({ ...editedData, image_url: publicUrl });
        } else {
          setEditedData({ ...editedData, image_url_eng: publicUrl });
        }
      } else {
        // Option image
        if (selectedImageLanguage === 'ita') {
          setEditedData({
            ...editedData,
            image_options: {
              ...editedData.image_options,
              [currentImageTarget]: publicUrl
            }
          });
        } else {
          setEditedData({
            ...editedData,
            image_options_eng: {
              ...editedData.image_options_eng,
              [currentImageTarget]: publicUrl
            }
          });
        }
      }

      console.log('✅ Image uploaded successfully:', publicUrl);
      alert(`Image uploaded successfully for ${selectedImageLanguage === 'ita' ? 'Italian' : 'English'}!`);
      // Don't close modal - allow uploading other language
    } catch (err) {
      console.error('Error uploading image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      alert(`Failed to upload image: ${errorMessage}`);
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

  async function markAsFixed() {
    if (!confirm('Mark this question as fixed and move to archive?')) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let fixedBy: string | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from('2V_profiles')
          .select('id')
          .eq('auth_uid', user.id)
          .single();
        fixedBy = profile?.id ?? null;
      }

      const archivedReview = {
        ...(reviewData || {}),
        status: 'fixed',
        fixed_at: new Date().toISOString(),
        fixed_by: fixedBy,
      };

      const { error: updateError } = await supabase
        .from('2V_questions')
        .update({
          question_data: {
            ...question.question_data,
            question_text: editedData.question_text,
            question_text_eng: editedData.question_text_eng,
            options: editedData.options,
            options_eng: editedData.options_eng,
            image_url: editedData.image_url,
            image_url_eng: editedData.image_url_eng,
            image_options: editedData.image_options,
            image_options_eng: editedData.image_options_eng,
            passage_text: editedData.passage_text || null,
            passage_text_eng: editedData.passage_text_eng || null,
            passage_title: editedData.passage_title || null,
            passage_title_eng: editedData.passage_title_eng || null,
          },
          answers: {
            ...question.answers,
            correct_answer: editedData.correct_answer,
          },
          Questions_toReview: archivedReview,
        })
        .eq('id', question.id);

      if (updateError) throw updateError;

      // If this question has a passage, update all other questions with the same passage_id
      if (passage && question.question_data?.passage_id) {
        const { data: relatedQuestions, error: fetchError } = await supabase
          .from('2V_questions')
          .select('*')
          .eq('question_data->passage_id', question.question_data.passage_id)
          .neq('id', question.id);

        if (fetchError) {
          console.error('Error fetching related questions:', fetchError);
        } else if (relatedQuestions && relatedQuestions.length > 0) {
          for (const relatedQ of relatedQuestions) {
            await supabase
              .from('2V_questions')
              .update({
                question_data: {
                  ...relatedQ.question_data,
                  passage_text: editedData.passage_text || null,
                  passage_text_eng: editedData.passage_text_eng || null,
                  passage_title: editedData.passage_title || null,
                  passage_title_eng: editedData.passage_title_eng || null,
                }
              })
              .eq('id', relatedQ.id);
          }
        }
      }

      alert('Question marked as fixed and moved to archive.');
      onClearFlag(question.id);
    } catch (err) {
      console.error('Error marking as fixed:', err);
      alert('Failed to mark as fixed');
    } finally {
      setSaving(false);
    }
  }

  async function reopenFromArchive() {
    if (!confirm('Move this question back to the open flagged list?')) return;
    setSaving(true);
    try {
      const reopened = { ...(reviewData || {}), status: 'open' };
      delete (reopened as any).fixed_at;
      delete (reopened as any).fixed_by;

      const { error } = await supabase
        .from('2V_questions')
        .update({ Questions_toReview: reopened })
        .eq('id', question.id);

      if (error) throw error;
      onClearFlag(question.id);
    } catch (err) {
      console.error('Error re-opening question:', err);
      alert('Failed to re-open question');
    } finally {
      setSaving(false);
    }
  }

  const containerClass = isArchived
    ? 'bg-gray-50 border-2 border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow'
    : 'bg-orange-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow';
  const headerBorderClass = isArchived ? 'border-gray-300' : 'border-orange-200';
  const badgeClass = isArchived ? 'bg-gray-500' : 'bg-orange-500';

  return (
    <div className={containerClass}>
      {isArchived && (
        <div className="mb-4 inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
          <FontAwesomeIcon icon={faCheckCircle} />
          Archived
          {reviewData?.fixed_at && (
            <span className="font-normal text-green-700">
              · fixed {new Date(reviewData.fixed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
      {/* Header with Test Info */}
      <div className={`flex items-start justify-between mb-4 pb-4 border-b-2 ${headerBorderClass}`}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`${badgeClass} text-white px-3 py-1 rounded-full text-sm font-bold`}>
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
              {isArchived ? (
                <button
                  onClick={reopenFromArchive}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
                  title="Move back to open flagged list"
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Re-open
                </button>
              ) : (
                <button
                  onClick={markAsFixed}
                  disabled={saving}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
                  title="Save changes and move to archive"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Mark as Fixed
                </button>
              )}
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

      {/* Passage (if this question has one) */}
      {passage && (
        <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📖</span>
                {isEditing ? (
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Passage Title (IT):</p>
                    <input
                      type="text"
                      value={editedData.passage_title}
                      onChange={(e) => setEditedData({ ...editedData, passage_title: e.target.value })}
                      className="w-full p-2 border-2 border-amber-300 rounded font-semibold text-amber-900"
                      placeholder="Italian title"
                    />
                    <p className="text-xs font-semibold text-amber-800 mb-1 mt-2">Passage Title (EN):</p>
                    <input
                      type="text"
                      value={editedData.passage_title_eng}
                      onChange={(e) => setEditedData({ ...editedData, passage_title_eng: e.target.value })}
                      className="w-full p-2 border-2 border-amber-300 rounded font-semibold text-amber-900"
                      placeholder="English title"
                    />
                  </div>
                ) : (
                  <h3 className="font-bold text-amber-900">
                    {passage.passage_title || 'Reading Passage'}
                  </h3>
                )}
              </div>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded whitespace-nowrap ml-2">
              For Q: {passage.question_numbers.join(', ')}
            </span>
          </div>

          {/* Italian Passage */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-amber-800 mb-2">🇮🇹 Italian:</p>
            {isEditing ? (
              <textarea
                value={editedData.passage_text}
                onChange={(e) => setEditedData({ ...editedData, passage_text: e.target.value })}
                className="w-full p-3 border-2 border-amber-300 rounded-lg font-mono text-sm bg-white"
                rows={8}
                placeholder="Italian passage text..."
              />
            ) : (
              <div className="bg-white rounded-lg p-4 text-gray-700 overflow-x-auto border-2 border-amber-200">
                <div className="whitespace-pre-wrap">
                  <MathJaxRenderer>
                    {passage.passage_text || ''}
                  </MathJaxRenderer>
                </div>
              </div>
            )}
          </div>

          {/* English Passage */}
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-2">🇬🇧 English:</p>
            {isEditing ? (
              <textarea
                value={editedData.passage_text_eng}
                onChange={(e) => setEditedData({ ...editedData, passage_text_eng: e.target.value })}
                className="w-full p-3 border-2 border-amber-300 rounded-lg font-mono text-sm bg-white"
                rows={8}
                placeholder="English passage text..."
              />
            ) : passage.passage_text_eng ? (
              <div className="bg-white rounded-lg p-4 text-gray-700 overflow-x-auto border-2 border-amber-200">
                <div className="whitespace-pre-wrap">
                  <MathJaxRenderer>
                    {passage.passage_text_eng}
                  </MathJaxRenderer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 text-gray-400 italic border-2 border-amber-200">
                No English translation available
              </div>
            )}
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

        {/* Question Images */}
        {(editedData.image_url || editedData.image_url_eng) && (
          <div className="mt-3 space-y-3">
            {/* Italian Image */}
            {editedData.image_url && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">🇮🇹 Italian Image:</p>
                <div className="relative inline-block">
                  <img
                    src={editedData.image_url}
                    alt="Question (IT)"
                    className="max-w-full max-h-80 rounded-lg border-2 border-blue-300 object-contain"
                  />
                  {isEditing && (
                    <button
                      onClick={() => setEditedData({ ...editedData, image_url: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* English Image */}
            {editedData.image_url_eng && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">🇬🇧 English Image:</p>
                <div className="relative inline-block">
                  <img
                    src={editedData.image_url_eng}
                    alt="Question (EN)"
                    className="max-w-full max-h-80 rounded-lg border-2 border-green-300 object-contain"
                  />
                  {isEditing && (
                    <button
                      onClick={() => setEditedData({ ...editedData, image_url_eng: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
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

                {/* Option Images */}
                {(editedData.image_options?.[key] || editedData.image_options_eng?.[key]) && (
                  <div className="mt-2 space-y-2">
                    {/* Italian Option Image */}
                    {editedData.image_options?.[key] && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">🇮🇹 Italian Image:</p>
                        <div className="relative inline-block">
                          <img
                            src={editedData.image_options[key]}
                            alt={`Option ${key.toUpperCase()} (IT)`}
                            className="max-w-xs max-h-48 rounded border-2 border-blue-300 object-contain"
                          />
                          {isEditing && (
                            <button
                              onClick={() => {
                                const newImageOptions = { ...editedData.image_options };
                                delete newImageOptions[key];
                                setEditedData({ ...editedData, image_options: newImageOptions });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shadow-lg"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* English Option Image */}
                    {editedData.image_options_eng?.[key] && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">🇬🇧 English Image:</p>
                        <div className="relative inline-block">
                          <img
                            src={editedData.image_options_eng[key]}
                            alt={`Option ${key.toUpperCase()} (EN)`}
                            className="max-w-xs max-h-48 rounded border-2 border-green-300 object-contain"
                          />
                          {isEditing && (
                            <button
                              onClick={() => {
                                const newImageOptionsEng = { ...editedData.image_options_eng };
                                delete newImageOptionsEng[key];
                                setEditedData({ ...editedData, image_options_eng: newImageOptionsEng });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shadow-lg"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      </div>
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
              {/* Language Selector */}
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  🌐 Select Language Version
                </p>
                <p className="text-xs text-blue-700 mb-3">
                  Choose which language this image is for.
                </p>
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setSelectedImageLanguage('ita')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedImageLanguage === 'ita'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    🇮🇹 Italian
                  </button>
                  <button
                    onClick={() => setSelectedImageLanguage('eng')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedImageLanguage === 'eng'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-blue-900">
                    Currently selected: {selectedImageLanguage === 'ita' ? '🇮🇹 ITALIAN' : '🇬🇧 ENGLISH'}
                  </span>
                </div>
              </div>

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
