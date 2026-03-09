/**
 * MSR (Multi-Source Reasoning) Question Editor Component
 * Structured editor for MSR question fields — sources panel + questions panel.
 *
 * Sources are always text (markdown tables supported via MathJaxRenderer).
 * Each source tab supports an optional image uploaded from the local machine.
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faCheckCircle, faTimesCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../../lib/supabase';
import { LaTeXEditor } from './LaTeXEditor';

interface MSRSource {
  content?: string;
  tab_name: string;
  content_type: 'text' | 'table'; // legacy field — editor always writes 'text'
  image_url?: string | null;
}

interface MSRSubQuestion {
  text: string;
  options: Record<string, string>;
  question_type: string;
  correct_answer: string;
}

interface MSRQuestionEditorProps {
  questionData: {
    sources?: MSRSource[];
    question_stem?: string;  // shared question shown above tabular sub-questions
    questions?: MSRSubQuestion[];
  };
  onChange: (field: string, value: any) => void;
}

// ── Inline image uploader (no language selector needed for MSR sources) ───────

interface SourceImageUploaderProps {
  currentUrl: string | null | undefined;
  srcIndex: number;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}

function SourceImageUploader({ currentUrl, srcIndex, onUploaded, onRemove }: SourceImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const reader = new FileReader();
      const base64: string = await new Promise(resolve => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const ext = file.name.split('.').pop();
      const filePath = `msr/source_${srcIndex}_${Date.now()}.${ext}`;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ filePath, imageBase64: base64 }),
        }
      );
      if (!res.ok) throw new Error(await res.text());

      const { publicUrl } = await res.json();
      onUploaded(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500">
        Tab image <span className="font-normal">(optional)</span>
      </label>

      {currentUrl ? (
        <div className="flex items-center gap-2">
          <img src={currentUrl} alt="source" className="h-16 w-auto rounded border border-gray-200 object-contain" />
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} />
            Remove
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-brand-green hover:bg-green-50/30 transition-colors cursor-pointer w-fit">
          {uploading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-500 text-sm" />
          ) : success ? (
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-sm" />
          ) : (
            <FontAwesomeIcon icon={faUpload} className="text-gray-400 text-sm" />
          )}
          <span className="text-xs font-medium text-gray-600">
            {uploading ? 'Uploading…' : success ? 'Uploaded!' : 'Upload image from computer'}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </label>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <FontAwesomeIcon icon={faTimesCircle} />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export function MSRQuestionEditor({ questionData, onChange }: MSRQuestionEditorProps) {
  const sources: MSRSource[] = questionData.sources || [];
  const questions: MSRSubQuestion[] = questionData.questions || [];

  // ── Source helpers ──────────────────────────────────────────────────────

  const updateSources = (updated: MSRSource[]) => {
    onChange('question_data.sources', updated);
  };

  const handleSourceField = (index: number, field: keyof MSRSource, value: any) => {
    updateSources(sources.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAddSource = () => {
    updateSources([...sources, { tab_name: '', content_type: 'text', content: '' }]);
  };

  const handleRemoveSource = (index: number) => {
    updateSources(sources.filter((_, i) => i !== index));
  };

  // ── Question helpers ────────────────────────────────────────────────────

  const updateQuestions = (updated: MSRSubQuestion[]) => {
    onChange('question_data.questions', updated);
    // Keep top-level answers.correct_answer in sync
    onChange('answers.correct_answer', updated.map(q => q.correct_answer));
  };

  const handleQuestionTextField = (index: number, value: string) => {
    updateQuestions(questions.map((q, i) => (i === index ? { ...q, text: value } : q)));
  };

  const handleQuestionCorrectAnswer = (index: number, value: string) => {
    updateQuestions(questions.map((q, i) => (i === index ? { ...q, correct_answer: value } : q)));
  };

  const handleOptionKeyChange = (qIndex: number, oldKey: string, newKey: string) => {
    const q = questions[qIndex];
    const updated: Record<string, string> = {};
    Object.entries(q.options).forEach(([k, v]) => {
      updated[k === oldKey ? newKey : k] = v;
    });
    const newCorrect = q.correct_answer === oldKey ? newKey : q.correct_answer;
    updateQuestions(questions.map((q2, i) =>
      i === qIndex ? { ...q2, options: updated, correct_answer: newCorrect } : q2
    ));
  };

  const handleOptionValueChange = (qIndex: number, key: string, value: string) => {
    updateQuestions(questions.map((q2, i) =>
      i === qIndex ? { ...q2, options: { ...q2.options, [key]: value } } : q2
    ));
  };

  const handleAddOption = (qIndex: number) => {
    const usedKeys = Object.keys(questions[qIndex].options);
    const nextKey =
      'abcdefghijklmnopqrstuvwxyz'.split('').find(c => !usedKeys.includes(c)) ||
      `opt${usedKeys.length}`;
    updateQuestions(questions.map((q2, i) =>
      i === qIndex ? { ...q2, options: { ...q2.options, [nextKey]: '' } } : q2
    ));
  };

  const handleRemoveOption = (qIndex: number, key: string) => {
    const q = questions[qIndex];
    const updated = { ...q.options };
    delete updated[key];
    const newCorrect = q.correct_answer === key ? '' : q.correct_answer;
    updateQuestions(questions.map((q2, i) =>
      i === qIndex ? { ...q2, options: updated, correct_answer: newCorrect } : q2
    ));
  };

  const handleAddQuestion = () => {
    updateQuestions([
      ...questions,
      { text: '', options: { a: 'Yes', b: 'No' }, question_type: 'multiple_choice', correct_answer: 'a' },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    updateQuestions(questions.filter((_, i) => i !== index));
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Sources ── */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Sources (Tabs)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Tab content supports LaTeX and markdown tables (<code>| Col1 | Col2 |</code> syntax).
        </p>
        <div className="space-y-4">
          {sources.map((source, srcIndex) => (
            <div key={srcIndex} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
              {/* Header row */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 uppercase shrink-0">Tab {srcIndex + 1}</span>
                <input
                  type="text"
                  value={source.tab_name}
                  onChange={(e) => handleSourceField(srcIndex, 'tab_name', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  placeholder="Tab name (e.g. Techniques, Artifacts…)"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSource(srcIndex)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
                  title="Remove source"
                >
                  ✕
                </button>
              </div>

              {/* Text content */}
              <LaTeXEditor
                value={source.content || ''}
                onChange={(value) => handleSourceField(srcIndex, 'content', value)}
                placeholder="Source text content (supports LaTeX and markdown tables)"
                minHeight="120px"
              />

              {/* Image uploader */}
              <SourceImageUploader
                currentUrl={source.image_url}
                srcIndex={srcIndex}
                onUploaded={(url) => handleSourceField(srcIndex, 'image_url', url)}
                onRemove={() => handleSourceField(srcIndex, 'image_url', null)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddSource}
          className="mt-3 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors w-full"
        >
          + Add source tab
        </button>
      </div>

      {/* ── Question Stem ── */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Shared Question Stem</h3>
        <p className="text-xs text-gray-500 mb-3">
          Shown above the answer table for tabular (Yes/No) questions. Leave empty for standard MC questions.
        </p>
        <LaTeXEditor
          value={questionData.question_stem || ''}
          onChange={(value) => onChange('question_data.question_stem', value || undefined)}
          placeholder="e.g. Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?"
          minHeight="72px"
        />
      </div>

      {/* ── Questions ── */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Sub-Questions</h3>
        <div className="space-y-4">
          {questions.map((question, qIndex) => {
            const optionEntries = Object.entries(question.options);
            return (
              <div key={qIndex} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Question {qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
                    title="Remove question"
                  >
                    ✕
                  </button>
                </div>

                {/* Question text */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Statement / Question text</label>
                  <LaTeXEditor
                    value={question.text}
                    onChange={(value) => handleQuestionTextField(qIndex, value)}
                    placeholder="Question or statement text (supports LaTeX)"
                    minHeight="72px"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Options</label>
                  <div className="space-y-2">
                    {optionEntries.map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => handleOptionKeyChange(qIndex, key, e.target.value.toLowerCase().trim())}
                          className="w-10 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:ring-1 focus:ring-brand-green focus:border-transparent font-mono font-bold shrink-0"
                          spellCheck={false}
                          maxLength={3}
                        />
                        <div className="flex-1">
                          <LaTeXEditor
                            value={value}
                            onChange={(v) => handleOptionValueChange(qIndex, key, v)}
                            placeholder={`Option ${key} text (supports LaTeX)`}
                            minHeight="44px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIndex, key)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5 text-xs"
                          title="Remove option"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIndex)}
                    className="mt-1.5 px-3 py-1 text-xs border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors"
                  >
                    + Add option
                  </button>
                </div>

                {/* Correct answer */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Correct answer</label>
                  <select
                    value={question.correct_answer}
                    onChange={(e) => handleQuestionCorrectAnswer(qIndex, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm bg-white"
                  >
                    <option value="">— select correct option —</option>
                    {optionEntries.map(([key, value]) => (
                      <option key={key} value={key}>
                        {key.toUpperCase()}. {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="mt-3 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors w-full"
        >
          + Add question
        </button>
      </div>
    </div>
  );
}
