/**
 * Test Structure Page
 * Displays complete test hierarchy: Test Types > Tests > Sections/Topics > Questions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faChevronDown,
  faChevronRight,
  faBook,
  faList,
  faQuestionCircle,
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  question_number: number;
  question_type: string;
  section: string;
  materia: string | null;
  difficulty: string | null;
}

interface Test {
  id: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  format: string;
  default_duration_mins: number | null;
  questions: Question[];
}

interface TestsByType {
  [testType: string]: Test[];
}

interface SectionGroup {
  section: string;
  questions: Question[];
}

interface TestsBySectionAndExercise {
  [testType: string]: {
    [section: string]: {
      [exerciseType: string]: Test[];
    };
  };
}

export default function TestStructurePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testsBySectionAndExercise, setTestsBySectionAndExercise] = useState<TestsBySectionAndExercise>({});
  const [sectionOrders, setSectionOrders] = useState<{ [testType: string]: string[] }>({});
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedExerciseTypes, setExpandedExerciseTypes] = useState<Set<string>>(new Set());
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTestStructure();
  }, []);

  const fetchTestStructure = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tests
      // Note: We sort by section order in JavaScript, so don't order by section in SQL
      const { data: tests, error: testsError } = await supabase
        .from('2V_tests')
        .select('*')
        .eq('is_active', true)
        .order('test_type');

      if (testsError) throw testsError;

      // Fetch all questions in batches (Supabase has a limit of 1000 rows per query)
      let allQuestions: Question[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: questionBatch, error: questionsError } = await supabase
          .from('2V_questions')
          .select('id, test_id, question_number, question_type, section, materia, difficulty')
          .eq('is_active', true)
          .order('question_number')
          .range(from, from + batchSize - 1);

        if (questionsError) throw questionsError;

        if (questionBatch && questionBatch.length > 0) {
          allQuestions = allQuestions.concat(questionBatch);
          from += batchSize;
          hasMore = questionBatch.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const questions = allQuestions;

      // Fetch all section orders
      const { data: sectionOrderData, error: sectionOrderError } = await supabase
        .from('2V_section_order')
        .select('test_type, section_order');

      if (sectionOrderError) {
        console.warn('Error fetching section orders:', sectionOrderError);
      }

      // Create section order map
      const orderMap: { [testType: string]: string[] } = {};
      sectionOrderData?.forEach((row) => {
        orderMap[row.test_type] = row.section_order || [];
        console.log('📋 Section order for', row.test_type, ':', row.section_order);
      });
      setSectionOrders(orderMap);
      console.log('📋 All section orders loaded:', orderMap);

      // Group questions by test_id
      const questionsByTest: { [testId: string]: Question[] } = {};
      questions?.forEach((q) => {
        if (!questionsByTest[q.test_id]) {
          questionsByTest[q.test_id] = [];
        }
        questionsByTest[q.test_id].push(q);
      });

      // Group tests by test_type > section > exercise_type
      const grouped: TestsBySectionAndExercise = {};
      tests?.forEach((test) => {
        const testType = test.test_type;
        const isMultitopic = test.section.toLowerCase().includes('multi');

        // For Multitopic tests, use exercise_type as the section and use a placeholder for exercise_type
        const section = isMultitopic ? test.exercise_type : test.section;
        const exerciseType = isMultitopic ? '_multitopic_' : test.exercise_type;

        if (!grouped[testType]) {
          grouped[testType] = {};
        }
        if (!grouped[testType][section]) {
          grouped[testType][section] = {};
        }
        if (!grouped[testType][section][exerciseType]) {
          grouped[testType][section][exerciseType] = [];
        }

        grouped[testType][section][exerciseType].push({
          ...test,
          questions: questionsByTest[test.id] || [],
        });
      });

      // Sort tests within each exercise_type by test_number
      Object.keys(grouped).forEach((testType) => {
        Object.keys(grouped[testType]).forEach((section) => {
          Object.keys(grouped[testType][section]).forEach((exerciseType) => {
            grouped[testType][section][exerciseType].sort((a, b) => a.test_number - b.test_number);
          });
        });
      });

      setTestsBySectionAndExercise(grouped);
    } catch (err) {
      console.error('Error fetching test structure:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test structure');
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (testType: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(testType)) {
        next.delete(testType);
      } else {
        next.add(testType);
      }
      return next;
    });
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const toggleExerciseType = (exerciseKey: string) => {
    setExpandedExerciseTypes((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseKey)) {
        next.delete(exerciseKey);
      } else {
        next.add(exerciseKey);
      }
      return next;
    });
  };

  const toggleTest = (testId: string) => {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  };

  const groupQuestionsBySection = (questions: Question[], testType: string): SectionGroup[] => {
    const sectionMap: { [section: string]: Question[] } = {};
    questions.forEach((q) => {
      const sectionKey = q.section;
      if (!sectionMap[sectionKey]) {
        sectionMap[sectionKey] = [];
      }
      sectionMap[sectionKey].push(q);
    });

    const sectionGroups = Object.entries(sectionMap).map(([section, qs]) => ({
      section,
      questions: qs,
    }));

    // Sort section groups using the section order for this test type
    const order = sectionOrders[testType] || [];
    console.log(`🔍 Grouping sections for ${testType}. Order:`, order);
    console.log(`📦 Section groups before sorting:`, sectionGroups.map(s => s.section));

    sectionGroups.sort((a, b) => {
      // Normalize section names for comparison
      const aNorm = normalizeSectionName(a.section);
      const bNorm = normalizeSectionName(b.section);

      // Find index in order array using normalized comparison
      const aIndex = order.findIndex(s => normalizeSectionName(s) === aNorm);
      const bIndex = order.findIndex(s => normalizeSectionName(s) === bNorm);

      console.log(`  Comparing sections: "${a.section}" (index: ${aIndex}) vs "${b.section}" (index: ${bIndex})`);

      if (aIndex !== -1 && bIndex !== -1) {
        const result = aIndex - bIndex;
        console.log(`    Both in order, result: ${result}`);
        return result;
      }
      if (aIndex !== -1) {
        console.log(`    Only A in order, A wins`);
        return -1;
      }
      if (bIndex !== -1) {
        console.log(`    Only B in order, B wins`);
        return 1;
      }

      // Fall back to alphabetical
      const result = a.section.localeCompare(b.section);
      console.log(`    Neither in order, alphabetical result: ${result}`);
      return result;
    });

    console.log(`✅ Section groups after sorting:`, sectionGroups.map(s => s.section));

    return sectionGroups;
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'hard':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Test Structure" pageSubtitle="Loading test hierarchy...">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-6xl text-brand-green animate-spin mb-4" />
            <p className="text-gray-600">Loading test structure...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Test Structure" pageSubtitle="Error loading data">
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/tutor/test-management')}
              className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Test Management</span>
            </button>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-3" />
              <p className="text-red-700 font-medium mb-2">Error Loading Test Structure</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={fetchTestStructure}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const testTypes = Object.keys(testsBySectionAndExercise).sort();

  // Helper function to normalize section names for comparison
  const normalizeSectionName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[,;:.!?]/g, '') // Remove punctuation
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };

  // Helper function to get sorted sections for a test type
  const getSortedSections = (testType: string): string[] => {
    const sections = Object.keys(testsBySectionAndExercise[testType] || {});
    const order = sectionOrders[testType] || [];

    console.log(`🔧 Sorting sections for ${testType}`);
    console.log(`  Sections found:`, sections);
    console.log(`  Order array:`, order);

    return sections.sort((a, b) => {
      // Normalize section names for comparison
      const aNorm = normalizeSectionName(a);
      const bNorm = normalizeSectionName(b);

      // Find index in order array using normalized comparison
      let aIndex = order.findIndex(s => normalizeSectionName(s) === aNorm);
      let bIndex = order.findIndex(s => normalizeSectionName(s) === bNorm);

      console.log(`  Comparing: "${a}" (norm: "${aNorm}", idx: ${aIndex}) vs "${b}" (norm: "${bNorm}", idx: ${bIndex})`);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // Fall back to alphabetical
      return a.localeCompare(b);
    });
  };

  // Calculate total tests and questions
  const totalTests = Object.values(testsBySectionAndExercise).reduce((sum, sections) => {
    return sum + Object.values(sections).reduce((sSum, exercises) => {
      return sSum + Object.values(exercises).reduce((eSum, tests) => eSum + tests.length, 0);
    }, 0);
  }, 0);

  const totalQuestions = Object.values(testsBySectionAndExercise).reduce((sum, sections) => {
    return sum + Object.values(sections).reduce((sSum, exercises) => {
      return sSum + Object.values(exercises).reduce((eSum, tests) => {
        return eSum + tests.reduce((tSum, t) => tSum + t.questions.length, 0);
      }, 0);
    }, 0);
  }, 0);

  return (
    <Layout pageTitle="Test Structure" pageSubtitle="Complete test hierarchy with all categories and exercises">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/test-management')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Test Management</span>
          </button>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">{testTypes.length}</div>
              <div className="text-orange-100">Test Types</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">{totalTests}</div>
              <div className="text-blue-100">Total Tests</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">{totalQuestions}</div>
              <div className="text-green-100">Total Questions</div>
            </div>
          </div>

          {/* Test Structure Tree */}
          <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faBook} className="text-orange-500" />
              Test Hierarchy
            </h2>

            {testTypes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-3" />
                <p>No tests found in the system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testTypes.map((testType) => {
                  const isTypeExpanded = expandedTypes.has(testType);
                  const sections = getSortedSections(testType);

                  return (
                    <div key={testType} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Test Type Header */}
                      <button
                        onClick={() => toggleType(testType)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FontAwesomeIcon
                            icon={isTypeExpanded ? faChevronDown : faChevronRight}
                            className="text-orange-600 w-4"
                          />
                          <FontAwesomeIcon icon={faBook} className="text-orange-600" />
                          <span className="font-bold text-brand-dark text-lg">{testType}</span>
                        </div>
                      </button>

                      {/* Sections List */}
                      {isTypeExpanded && (
                        <div className="bg-white">
                          {sections.map((section) => {
                            const sectionKey = `${testType}-${section}`;
                            const isSectionExpanded = expandedSections.has(sectionKey);
                            const exerciseTypes = Object.keys(testsBySectionAndExercise[testType][section]).sort((a, b) => {
                              // Custom sort: Training before Assessment Monotematico
                              if (a === '_multitopic_' || b === '_multitopic_') {
                                return a.localeCompare(b);
                              }
                              if (a.toLowerCase().includes('training') && b.toLowerCase().includes('assessment')) {
                                return -1;
                              }
                              if (a.toLowerCase().includes('assessment') && b.toLowerCase().includes('training')) {
                                return 1;
                              }
                              return a.localeCompare(b);
                            });

                            return (
                              <div key={sectionKey} className="border-t border-gray-200">
                                {/* Section Header */}
                                <button
                                  onClick={() => toggleSection(sectionKey)}
                                  className="w-full flex items-center justify-between p-4 pl-12 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <FontAwesomeIcon
                                      icon={isSectionExpanded ? faChevronDown : faChevronRight}
                                      className="text-blue-600 w-4"
                                    />
                                    <FontAwesomeIcon icon={faList} className="text-blue-600" />
                                    <span className="font-bold text-brand-dark">{section}</span>
                                  </div>
                                </button>

                                {/* Exercise Types (Training/Assessment) */}
                                {isSectionExpanded && (
                                  <div className="bg-gray-50">
                                    {exerciseTypes.map((exerciseType) => {
                                      const exerciseKey = `${sectionKey}-${exerciseType}`;
                                      const isExerciseExpanded = expandedExerciseTypes.has(exerciseKey);
                                      const tests = testsBySectionAndExercise[testType][section][exerciseType];
                                      const isMultitopic = exerciseType === '_multitopic_';

                                      // For multitopic, skip the exercise type level and show tests directly
                                      if (isMultitopic) {
                                        // For Assessment Iniziale (single test), auto-expand and show questions directly
                                        const isAssessmentIniziale = section.toLowerCase().includes('assessment') && section.toLowerCase().includes('iniziale');

                                        if (isAssessmentIniziale && tests.length === 1) {
                                          const test = tests[0];
                                          const questionSections = groupQuestionsBySection(test.questions, testType);

                                          return (
                                            <div key={exerciseKey} className="bg-gray-100">
                                              {questionSections.length === 0 ? (
                                                <div className="p-3 pl-20 text-gray-500 text-sm italic border-t border-gray-100">
                                                  No questions in this test
                                                </div>
                                              ) : (
                                                <>
                                                  <div className="p-3 pl-20 border-t border-gray-100 bg-gray-50">
                                                    <div className="font-medium text-brand-dark">
                                                      Total: {test.questions.length} questions
                                                    </div>
                                                  </div>
                                                  {questionSections.map((qSection) => (
                                                    <div key={`${test.id}-${qSection.section}`} className="border-t border-gray-100">
                                                      <div className="p-3 pl-20">
                                                        <div className="font-medium text-sm text-brand-dark mb-2">
                                                          {qSection.section} ({qSection.questions.length} questions)
                                                        </div>
                                                        <div className="space-y-1">
                                                          {qSection.questions.map((question) => (
                                                            <div
                                                              key={question.id}
                                                              className="flex items-center gap-2 text-sm text-gray-700"
                                                            >
                                                              <FontAwesomeIcon
                                                                icon={faQuestionCircle}
                                                                className="text-gray-400 text-xs"
                                                              />
                                                              <span className="font-medium">Q{question.question_number}</span>
                                                              <span className="text-gray-500">{question.question_type}</span>
                                                              {question.materia && (
                                                                <span className="text-gray-400">• {question.materia}</span>
                                                              )}
                                                              {question.difficulty && (
                                                                <span
                                                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getDifficultyColor(
                                                                    question.difficulty
                                                                  )}`}
                                                                >
                                                                  {question.difficulty}
                                                                </span>
                                                              )}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </>
                                              )}
                                            </div>
                                          );
                                        }

                                        // For Simulazioni or other multitopic sections with multiple tests
                                        return (
                                          <div key={exerciseKey} className="bg-white">
                                            {tests.map((test) => {
                                              const isTestExpanded = expandedTests.has(test.id);
                                              const questionSections = groupQuestionsBySection(test.questions, testType);

                                              return (
                                                <div key={test.id} className="border-t border-gray-100">
                                                  {/* Test Header */}
                                                  <button
                                                    onClick={() => toggleTest(test.id)}
                                                    className="w-full flex items-center justify-between p-3 pl-20 bg-purple-50 hover:bg-purple-100 transition-colors"
                                                  >
                                                    <div className="flex items-center gap-3">
                                                      <FontAwesomeIcon
                                                        icon={isTestExpanded ? faChevronDown : faChevronRight}
                                                        className="text-purple-600 w-4"
                                                      />
                                                      <div className="text-left">
                                                        <div className="font-medium text-brand-dark">
                                                          Test #{test.test_number}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                          {test.format} • {test.questions.length} questions
                                                          {test.default_duration_mins && ` • ${test.default_duration_mins} min`}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </button>

                                                  {/* Question Sections */}
                                                  {isTestExpanded && (
                                                    <div className="bg-gray-100">
                                                      {questionSections.length === 0 ? (
                                                        <div className="p-3 pl-28 text-gray-500 text-sm italic">
                                                          No questions in this test
                                                        </div>
                                                      ) : (
                                                        questionSections.map((qSection) => (
                                                          <div key={`${test.id}-${qSection.section}`} className="border-t border-gray-200">
                                                            <div className="p-3 pl-28">
                                                              <div className="font-medium text-sm text-brand-dark mb-2">
                                                                {qSection.section} ({qSection.questions.length} questions)
                                                              </div>
                                                              <div className="space-y-1">
                                                                {qSection.questions.map((question) => (
                                                                  <div
                                                                    key={question.id}
                                                                    className="flex items-center gap-2 text-sm text-gray-700"
                                                                  >
                                                                    <FontAwesomeIcon
                                                                      icon={faQuestionCircle}
                                                                      className="text-gray-400 text-xs"
                                                                    />
                                                                    <span className="font-medium">Q{question.question_number}</span>
                                                                    <span className="text-gray-500">{question.question_type}</span>
                                                                    {question.materia && (
                                                                      <span className="text-gray-400">• {question.materia}</span>
                                                                    )}
                                                                    {question.difficulty && (
                                                                      <span
                                                                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getDifficultyColor(
                                                                          question.difficulty
                                                                        )}`}
                                                                      >
                                                                        {question.difficulty}
                                                                      </span>
                                                                    )}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        ))
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={exerciseKey} className="border-t border-gray-200">
                                          {/* Exercise Type Header */}
                                          <button
                                            onClick={() => toggleExerciseType(exerciseKey)}
                                            className="w-full flex items-center justify-between p-3 pl-20 bg-green-50 hover:bg-green-100 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <FontAwesomeIcon
                                                icon={isExerciseExpanded ? faChevronDown : faChevronRight}
                                                className="text-green-600 w-4"
                                              />
                                              <div className="text-left">
                                                <div className="font-semibold text-brand-dark">{exerciseType}</div>
                                                <div className="text-sm text-gray-600">
                                                  {tests.length} {tests.length === 1 ? 'test' : 'tests'}
                                                </div>
                                              </div>
                                            </div>
                                          </button>

                                          {/* Tests List */}
                                          {isExerciseExpanded && (
                                            <div className="bg-white">
                                              {tests.map((test) => {
                                                const isTestExpanded = expandedTests.has(test.id);
                                                const questionSections = groupQuestionsBySection(test.questions, testType);

                                                return (
                                                  <div key={test.id} className="border-t border-gray-100">
                                                    {/* Test Header */}
                                                    <button
                                                      onClick={() => toggleTest(test.id)}
                                                      className="w-full flex items-center justify-between p-3 pl-28 bg-purple-50 hover:bg-purple-100 transition-colors"
                                                    >
                                                      <div className="flex items-center gap-3">
                                                        <FontAwesomeIcon
                                                          icon={isTestExpanded ? faChevronDown : faChevronRight}
                                                          className="text-purple-600 w-4"
                                                        />
                                                        <div className="text-left">
                                                          <div className="font-medium text-brand-dark">
                                                            Test #{test.test_number}
                                                          </div>
                                                          <div className="text-sm text-gray-600">
                                                            {test.format} • {test.questions.length} questions
                                                            {test.default_duration_mins && ` • ${test.default_duration_mins} min`}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </button>

                                                    {/* Question Sections */}
                                                    {isTestExpanded && (
                                                      <div className="bg-gray-100">
                                                        {questionSections.length === 0 ? (
                                                          <div className="p-3 pl-36 text-gray-500 text-sm italic">
                                                            No questions in this test
                                                          </div>
                                                        ) : (
                                                          questionSections.map((qSection) => (
                                                            <div key={`${test.id}-${qSection.section}`} className="border-t border-gray-200">
                                                              <div className="p-3 pl-36">
                                                                <div className="font-medium text-sm text-brand-dark mb-2">
                                                                  {qSection.section} ({qSection.questions.length} questions)
                                                                </div>
                                                                <div className="space-y-1">
                                                                  {qSection.questions.map((question) => (
                                                                    <div
                                                                      key={question.id}
                                                                      className="flex items-center gap-2 text-sm text-gray-700"
                                                                    >
                                                                      <FontAwesomeIcon
                                                                        icon={faQuestionCircle}
                                                                        className="text-gray-400 text-xs"
                                                                      />
                                                                      <span className="font-medium">Q{question.question_number}</span>
                                                                      <span className="text-gray-500">{question.question_type}</span>
                                                                      {question.materia && (
                                                                        <span className="text-gray-400">• {question.materia}</span>
                                                                      )}
                                                                      {question.difficulty && (
                                                                        <span
                                                                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getDifficultyColor(
                                                                            question.difficulty
                                                                          )}`}
                                                                        >
                                                                          {question.difficulty}
                                                                        </span>
                                                                      )}
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              </div>
                                                            </div>
                                                          ))
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
 
