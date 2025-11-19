/**
 * Review Questions Page
 * Review and edit questions uploaded to the database
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Select from 'react-select';

interface Test {
  id: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  format: string;
}

interface Question {
  id: string;
  test_id: string;
  question_number: number;
  question_type: string;
  section: string;
  question_data: any;
  answers: any;
  is_active: boolean;
}

export default function ReviewQuestionsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadQuestions(selectedTest.id);
    }
  }, [selectedTest]);

  async function loadTests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('2V_tests')
      .select('id, test_type, section, exercise_type, test_number, format')
      .order('test_type, section, test_number');

    if (error) {
      console.error('Error loading tests:', error);
    } else {
      setTests(data || []);
    }
    setLoading(false);
  }

  async function loadQuestions(testId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('2V_questions')
      .select('*')
      .eq('test_id', testId)
      .order('question_number');

    if (error) {
      console.error('Error loading questions:', error);
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  }

  const testOptions = tests.map(test => ({
    value: test.id,
    label: `${test.test_type} - ${test.section} - ${test.exercise_type} #${test.test_number}`,
    test: test
  }));

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Review Questions</h1>
          <a
            href="/admin"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
          >
            Back to Dashboard
          </a>
        </div>
        <div className="mt-4">
          <Select
            options={testOptions}
            value={testOptions.find(opt => opt.value === selectedTest?.id)}
            onChange={(option) => {
              setSelectedTest(option?.test || null);
              setSelectedQuestionId(null);
            }}
            placeholder="Search and select a test..."
            isClearable
          />
        </div>
      </div>

      {/* Main Content */}
      {selectedTest && (
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT: PDF Viewer */}
          <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">PDF Preview</h3>
            </div>
            {questions.length > 0 && questions[0]?.question_data?.pdf_url ? (
              <iframe
                src={questions[0].question_data.pdf_url}
                className="flex-1 w-full"
                title="PDF Preview"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">No PDF URL available</p>
              </div>
            )}
          </div>

          {/* RIGHT: Questions List */}
          <div className="flex-1 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Questions ({questions.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="inline-block w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">No questions found for this test</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {questions.map((question) => (
                      <button
                        key={question.id}
                        onClick={() => setSelectedQuestionId(question.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedQuestionId === question.id
                            ? 'border-brand-green bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-bold text-brand-dark">
                            Q{question.question_number}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {question.section}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {question.question_data?.question_text || 'No text'}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Page {question.question_data?.page_number || '?'}
                          </span>
                          {question.question_data?.has_image && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Has Image
                            </span>
                          )}
                          {question.question_data?.has_graph_latex && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              Has Graph
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
        )}

        {/* Question Details Modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Question {selectedQuestion.question_number} Details
                </h3>
                <button
                  onClick={() => setSelectedQuestionId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={selectedQuestion.question_data?.question_text || ''}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    rows={4}
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {selectedQuestion.question_data?.options && Object.entries(selectedQuestion.question_data.options).map(([key, value]) => (
                      <div key={key} className={`p-2 rounded ${
                        selectedQuestion.answers?.correct_answer === key
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-50 border border-gray-300'
                      }`}>
                        <span className="font-bold">{key.toUpperCase()})</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metadata
                  </label>
                  <div className="space-y-1 text-sm">
                    <p><strong>Section:</strong> {selectedQuestion.section}</p>
                    <p><strong>Type:</strong> {selectedQuestion.question_type}</p>
                    <p><strong>Page:</strong> {selectedQuestion.question_data?.page_number || 'N/A'}</p>
                    <p><strong>Has Image:</strong> {selectedQuestion.question_data?.has_image ? 'Yes' : 'No'}</p>
                    <p><strong>Has Graph:</strong> {selectedQuestion.question_data?.has_graph_latex ? 'Yes' : 'No'}</p>
                    <p><strong>Active:</strong> {selectedQuestion.is_active ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Raw JSON */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raw Data (JSON)
                  </label>
                  <pre className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedQuestion, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-700 transition"
                >
                  Edit Question
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Question
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  onClick={() => setSelectedQuestionId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
