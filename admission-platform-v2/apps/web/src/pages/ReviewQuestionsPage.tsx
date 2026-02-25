/**
 * Review Questions Page
 * Review and edit questions uploaded to the database
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faSearch,
  faFilter,
  faCheckCircle,
  faEdit,
  faTrash,
  faEye,
  faImage,
  faChartBar,
  faLanguage,
  faRobot,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faUpload,
  faMagic,
  faChartLine,
  faBan,
  faList,
  faListCheck,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider, MathJaxRenderer } from '../components/MathJaxRenderer';
import { AdvancedGraphRenderer } from '../components/GraphRenderer';
import RechartsRenderer from '../components/RechartsRenderer';
import { FlaggedQuestionEditor } from '../components/FlaggedQuestionEditor';
import { DataInsightsPreview } from '../components/questions/DataInsightsPreview';
import { DataInsightsEditor } from '../components/questions/DataInsightsEditor';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { supabase } from '../lib/supabase';
import { normalizeWhitespace } from '../lib/textUtils';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ReviewInfo {
  reviewed_at: string;
  reviewed_by: string;
  reviewed_by_email: string;
  notes?: string;
}

interface Test {
  id: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  review_info: ReviewInfo | null;
  question_count?: number;
  format?: 'pdf' | 'interactive' | 'mixed';
  flagged_count?: number;
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
  review_info: ReviewInfo | null;
}

interface AIReviewResult {
  questionId: string;
  questionNumber: number;
  explanation?: string; // AI explanation of the answer
  isCorrect?: boolean; // Whether the marked answer is correct
  issues: {
    type: 'correctness' | 'translation' | 'both';
    severity: 'error' | 'warning' | 'info';
    description: string;
    currentValue?: string;
    suggestedValue?: string;
    field?: string;
    confidence?: number;
  }[];
  approved?: boolean;
  // Graph recreation fields
  graphRecreated?: boolean;
  graphFunction?: string | object;
  graphType?: string;
  graphDomain?: [number, number];
  graphRange?: [number, number];
  graphAnalysis?: string;
  cannotRecreateReason?: string;
}

type AICheckType = 'correctness' | 'translation' | 'both';

export default function ReviewQuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // View mode: 'entireTests' or 'flaggedQuestions'
  const [viewMode, setViewMode] = useState<'entireTests' | 'flaggedQuestions'>('entireTests');

  // Test list state
  const [tests, setTests] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  // Flagged questions state
  const [flaggedQuestions, setFlaggedQuestions] = useState<any[]>([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);

  // Filters - trackFilter defaults to first available test type (set in useEffect after loading)
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'interactive' | 'mixed'>('all');
  const [reviewedFilter, setReviewedFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');
  const [flaggedFilter, setFlaggedFilter] = useState<'all' | 'flagged' | 'not_flagged'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [questionReviewedFilter, setQuestionReviewedFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');

  // Test details loaded for current filter (question counts, formats, etc.)
  const [testDetails, setTestDetails] = useState<Map<string, { question_count: number; format: 'pdf' | 'interactive' | 'mixed'; flagged_count: number }>>(new Map());

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());

  // Pagination for questions (to prevent rendering too many MathJax components at once)
  const [questionsPage, setQuestionsPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;

  // Actions
  const [markingReviewed, setMarkingReviewed] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Local editing state - holds a copy of the question being edited to avoid re-rendering entire list on each keystroke
  const [localEditingQuestion, setLocalEditingQuestion] = useState<Question | null>(null);

  // Language toggle
  const [viewLanguage, setViewLanguage] = useState<'it' | 'en'>('it');

  // AI Review
  const [showAICheckModal, setShowAICheckModal] = useState(false);
  const [aiCheckType, setAICheckType] = useState<AICheckType>('both');
  const [aiCheckScope, setAICheckScope] = useState<'full' | 'single'>('full');
  const [aiCheckQuestionId, setAICheckQuestionId] = useState<string | null>(null);
  const [aiReviewing, setAIReviewing] = useState(false);
  const [aiReviewResults, setAIReviewResults] = useState<AIReviewResult[]>([]);
  const [showAIResultsModal, setShowAIResultsModal] = useState(false);

  // Graph generation
  const [generatingGraph, setGeneratingGraph] = useState<string | null>(null);

  // Applying graph recreation
  const [applyingGraph, setApplyingGraph] = useState<string | null>(null);

  // Regenerate graph with feedback
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateQuestionId, setRegenerateQuestionId] = useState<string | null>(null);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');

  // Image action modal
  const [showImageActionModal, setShowImageActionModal] = useState(false);
  const [imageActionQuestionId, setImageActionQuestionId] = useState<string | null>(null);
  const [imageExtractionProgress, setImageExtractionProgress] = useState<number>(0);
  const [extractingImage, setExtractingImage] = useState(false);
  const [recreateWithPython, setRecreateWithPython] = useState(false);
  const [recreateWithRecharts, setRecreateWithRecharts] = useState(false);

  // Answer key modal
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);

  // Recharts code editing
  const [editingRechartsCode, setEditingRechartsCode] = useState<string | null>(null);
  const [rechartsCodeQuestionId, setRechartsCodeQuestionId] = useState<string | null>(null);

  // Per-question language override (null = use global viewLanguage)
  const [questionLanguageOverrides, setQuestionLanguageOverrides] = useState<Record<string, 'it' | 'en'>>({});

  // Passage management
  const [passages, setPassages] = useState<any[]>([]);
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [editingPassageId, setEditingPassageId] = useState<string | null>(null);
  const [selectedQuestionsForPassage, setSelectedQuestionsForPassage] = useState<number[]>([]);
  const [newPassageText, setNewPassageText] = useState('');
  const [newPassageTextEng, setNewPassageTextEng] = useState('');
  const [newPassageTitle, setNewPassageTitle] = useState('');
  const [newPassageTitleEng, setNewPassageTitleEng] = useState('');
  const [detectingPassage, setDetectingPassage] = useState(false);
  const [pageRangeInput, setPageRangeInput] = useState('');

  // Image management
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [currentImageQuestionId, setCurrentImageQuestionId] = useState<string | null>(null);
  const [currentImageOptionKey, setCurrentImageOptionKey] = useState<string | null>(null); // For answer option images (a, b, c, d)
  const [selectedImageLanguage, setSelectedImageLanguage] = useState<'ita' | 'eng'>('ita');
  const [selectedPageForExtraction, setSelectedPageForExtraction] = useState<number>(1);
  const [availableImages, setAvailableImages] = useState<{ url: string; width: number; height: number; y: number }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Get unique test types for filter
  const testTypes = [...new Set(tests.map(t => t.test_type))].sort();

  useEffect(() => {
    loadTests();
  }, []);

  // Load test details when track filter changes
  useEffect(() => {
    if (trackFilter && tests.length > 0) {
      loadTestDetails(trackFilter);
    }
  }, [trackFilter, tests.length]);

  useEffect(() => {
    if (viewMode === 'flaggedQuestions') {
      loadFlaggedQuestions();
    }
  }, [viewMode]);

  useEffect(() => {
    if (selectedTest) {
      setQuestionsPage(1); // Reset to first page when selecting a new test
      loadQuestions(selectedTest.id);
    } else {
      setQuestions([]);
    }
  }, [selectedTest]);

  // Handle navigation from preview mode
  useEffect(() => {
    const state = location.state as { selectedTestId?: string; scrollToQuestion?: number } | null;
    if (state?.selectedTestId && tests.length > 0) {
      const test = tests.find(t => t.id === state.selectedTestId);
      if (test) {
        setSelectedTest(test);
        // Scroll to question after a brief delay to ensure DOM is ready
        if (state.scrollToQuestion) {
          setTimeout(() => {
            const element = document.getElementById(`question-${state.scrollToQuestion}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      }
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, tests]);

  async function loadTests() {
    setLoadingTests(true);
    try {
      // Load only tests metadata (lightweight - no question fetching)
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('id, test_type, section, exercise_type, test_number, review_info')
        .order('test_type')
        .order('section')
        .order('test_number');

      if (testsError) throw testsError;

      setTests(testsData || []);

      // Set default track filter to first available test type
      if (testsData && testsData.length > 0 && !trackFilter) {
        const firstTestType = testsData[0].test_type;
        setTrackFilter(firstTestType);
      }
    } catch (err) {
      console.error('Error loading tests:', err);
    } finally {
      setLoadingTests(false);
    }
  }

  async function loadTestDetails(testType: string) {
    try {
      // Get test IDs for the selected test type
      const filteredTestIds = tests
        .filter(t => t.test_type === testType)
        .map(t => t.id);

      if (filteredTestIds.length === 0) return;

      // Bulk fetch all questions with test_id and question_type (optimized - single query)
      const { data: allQuestions } = await supabase
        .from('2V_questions')
        .select('id, test_id, question_type, additional_test_ids');

      // Group questions by test_id for quick lookup, including additional_test_ids
      const questionsByTestId = new Map<string, { id: string; question_type: string }[]>();
      (allQuestions || []).forEach(q => {
        // Add to primary test_id
        if (!questionsByTestId.has(q.test_id)) {
          questionsByTestId.set(q.test_id, []);
        }
        questionsByTestId.get(q.test_id)!.push({ id: q.id, question_type: q.question_type });

        // Also add to any additional_test_ids (for shared questions)
        if (q.additional_test_ids && Array.isArray(q.additional_test_ids)) {
          q.additional_test_ids.forEach((additionalTestId: string) => {
            if (!questionsByTestId.has(additionalTestId)) {
              questionsByTestId.set(additionalTestId, []);
            }
            questionsByTestId.get(additionalTestId)!.push({ id: q.id, question_type: q.question_type });
          });
        }
      });

      // Bulk fetch all flagged answers (optimized - single query)
      const { data: flaggedAnswers } = await supabase
        .from('2V_student_answers')
        .select('question_id')
        .eq('is_flagged', true);

      // Create a set of flagged question IDs for quick lookup
      const flaggedQuestionIdSet = new Set((flaggedAnswers || []).map(a => a.question_id));

      // Build details map
      const newDetails = new Map<string, { question_count: number; format: 'pdf' | 'interactive' | 'mixed'; flagged_count: number }>();

      filteredTestIds.forEach(testId => {
        const questions = questionsByTestId.get(testId) || [];

        let format: 'pdf' | 'interactive' | 'mixed' = 'pdf';
        if (questions.length > 0) {
          const pdfCount = questions.filter(q => q.question_type === 'pdf').length;
          const interactiveCount = questions.filter(q => q.question_type === 'multiple_choice').length;

          if (pdfCount > 0 && interactiveCount > 0) {
            format = 'mixed';
          } else if (interactiveCount > 0) {
            format = 'interactive';
          }
        }

        let flaggedCount = 0;
        questions.forEach(q => {
          if (flaggedQuestionIdSet.has(q.id)) {
            flaggedCount++;
          }
        });

        newDetails.set(testId, {
          question_count: questions.length,
          format,
          flagged_count: flaggedCount,
        });
      });

      setTestDetails(newDetails);
    } catch (err) {
      console.error('Error loading test details:', err);
    }
  }

  async function loadQuestions(testId: string) {
    setLoadingQuestions(true);
    try {
      // Fetch questions where test_id matches OR additional_test_ids contains the test_id
      // Use pagination to fetch all questions (Supabase default limit is 1000)
      const PAGE_SIZE = 1000;
      let allQuestions: any[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('2V_questions')
          .select('*')
          .or(`test_id.eq.${testId},additional_test_ids.cs.["${testId}"]`)
          .order('question_number')
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allQuestions = [...allQuestions, ...data];
          page++;
          // If we got less than PAGE_SIZE, we've reached the end
          hasMore = data.length === PAGE_SIZE;
        } else {
          hasMore = false;
        }
      }

      const loadedQuestions = allQuestions;
      setQuestions(loadedQuestions);

      // Extract passages from question data
      if (loadedQuestions.length > 0) {
        const passageMap = new Map<string, any>();
        loadedQuestions.forEach((q: any) => {
          if (q.question_data?.passage_id && q.question_data?.passage_text) {
            if (!passageMap.has(q.question_data.passage_id)) {
              passageMap.set(q.question_data.passage_id, {
                passage_id: q.question_data.passage_id,
                passage_text: q.question_data.passage_text,
                passage_text_eng: q.question_data.passage_text_eng,
                passage_title: q.question_data.passage_title,
                passage_title_eng: q.question_data.passage_title_eng,
                question_numbers: []
              });
            }
            passageMap.get(q.question_data.passage_id)!.question_numbers.push(q.question_number);
          }
        });
        setPassages(Array.from(passageMap.values()));

        // Get flagged question IDs (batch in chunks of 500 to avoid query limits)
        const questionIds = loadedQuestions.map(q => q.id);
        const flaggedIds = new Set<string>();
        const FLAGGED_BATCH_SIZE = 500;

        for (let i = 0; i < questionIds.length; i += FLAGGED_BATCH_SIZE) {
          const batchIds = questionIds.slice(i, i + FLAGGED_BATCH_SIZE);
          const { data: flaggedAnswers } = await supabase
            .from('2V_student_answers')
            .select('question_id')
            .in('question_id', batchIds)
            .eq('is_flagged', true);

          flaggedAnswers?.forEach(a => flaggedIds.add(a.question_id));
        }

        setFlaggedQuestionIds(flaggedIds);
      } else {
        setFlaggedQuestionIds(new Set());
        setPassages([]);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function loadFlaggedQuestions() {
    setLoadingFlagged(true);
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingFlagged(false);
        return;
      }

      const { data: currentProfile } = await supabase
        .from('2V_profiles')
        .select('id, email')
        .eq('auth_uid', user.id)
        .single();

      const { data, error } = await supabase
        .from('2V_questions')
        .select(`
          *,
          2V_tests!inner(id, test_type, section, exercise_type, test_number)
        `)
        .not('Questions_toReview', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filter based on user and test type
      const ANDREA_ID = 'ed3865f5-9207-4a1e-9534-d57b0f8f15f3';
      const KLAUDIO_ID = 'ca0a06db-0b50-4edf-a26d-8b5213690413';

      // Get Filippo's ID dynamically by email
      let FILIPPO_ID: string | null = null;
      const { data: filippoProfile } = await supabase
        .from('2V_profiles')
        .select('id')
        .ilike('email', 'filippo.fiz%')
        .single();

      if (filippoProfile) {
        FILIPPO_ID = filippoProfile.id;
      }

      let filteredData = data || [];

      if (currentProfile) {
        if (currentProfile.id === FILIPPO_ID) {
          // Filippo sees ALL flagged questions (no filtering)
          // filteredData remains unchanged
        } else if (currentProfile.id === ANDREA_ID) {
          // Andrea sees everything EXCEPT SAT and GMAT
          filteredData = filteredData.filter((q: any) => {
            const testType = q['2V_tests']?.test_type?.toUpperCase();
            return testType !== 'SAT' && testType !== 'GMAT';
          });
        } else if (currentProfile.id === KLAUDIO_ID) {
          // Klaudio sees ONLY SAT and GMAT
          filteredData = filteredData.filter((q: any) => {
            const testType = q['2V_tests']?.test_type?.toUpperCase();
            return testType === 'SAT' || testType === 'GMAT';
          });
        }
        // Other users see nothing (empty list)
        else {
          filteredData = [];
        }
      }

      // Collect unique flagged_by IDs for bulk profile fetch
      const flaggedByIds = new Set<string>();
      filteredData.forEach((question) => {
        if (question.Questions_toReview?.flagged_by) {
          flaggedByIds.add(question.Questions_toReview.flagged_by);
        }
      });

      // Bulk fetch all profiles in a single query
      const profileIdArray = Array.from(flaggedByIds);
      const profileMap = new Map<string, string>();
      if (profileIdArray.length > 0) {
        const { data: profiles } = await supabase
          .from('2V_profiles')
          .select('id, name')
          .in('id', profileIdArray);

        (profiles || []).forEach(p => {
          profileMap.set(p.id, p.name || 'Unknown');
        });
      }

      // Map profile names to questions (no additional queries)
      const questionsWithNames = filteredData.map((question) => {
        if (question.Questions_toReview?.flagged_by) {
          return {
            ...question,
            Questions_toReview: {
              ...question.Questions_toReview,
              flagged_by_name: profileMap.get(question.Questions_toReview.flagged_by) || 'Unknown',
            },
          };
        }
        return question;
      });

      setFlaggedQuestions(questionsWithNames);

      // Extract passages from flagged questions (same as in loadQuestions)
      if (questionsWithNames && questionsWithNames.length > 0) {
        const passageMap = new Map<string, any>();
        questionsWithNames.forEach((q: any) => {
          if (q.question_data?.passage_id && q.question_data?.passage_text) {
            if (!passageMap.has(q.question_data.passage_id)) {
              passageMap.set(q.question_data.passage_id, {
                passage_id: q.question_data.passage_id,
                passage_text: q.question_data.passage_text,
                passage_text_eng: q.question_data.passage_text_eng,
                passage_title: q.question_data.passage_title,
                passage_title_eng: q.question_data.passage_title_eng,
                question_numbers: []
              });
            }
            passageMap.get(q.question_data.passage_id)!.question_numbers.push(q.question_number);
          }
        });
        setPassages(Array.from(passageMap.values()));
      } else {
        setPassages([]);
      }
    } catch (err) {
      console.error('Error loading flagged questions:', err);
    } finally {
      setLoadingFlagged(false);
    }
  }

  async function markAsReviewed() {
    if (!selectedTest) return;

    setMarkingReviewed(true);
    try {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();

      const reviewInfo: ReviewInfo = {
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || 'unknown',
        reviewed_by_email: user?.email || 'unknown',
      };

      const { error } = await supabase
        .from('2V_tests')
        .update({ review_info: reviewInfo })
        .eq('id', selectedTest.id);

      if (error) throw error;

      // Update local state
      setTests(prev => prev.map(t =>
        t.id === selectedTest.id ? { ...t, review_info: reviewInfo } : t
      ));
      setSelectedTest(prev => prev ? { ...prev, review_info: reviewInfo } : null);
    } catch (err) {
      console.error('Error marking as reviewed:', err);
      alert('Failed to mark as reviewed');
    } finally {
      setMarkingReviewed(false);
    }
  }

  async function markAsUnreviewed() {
    if (!selectedTest) return;

    setMarkingReviewed(true);
    try {
      const { error } = await supabase
        .from('2V_tests')
        .update({ review_info: null })
        .eq('id', selectedTest.id);

      if (error) throw error;

      // Update local state
      setTests(prev => prev.map(t =>
        t.id === selectedTest.id ? { ...t, review_info: null } : t
      ));
      setSelectedTest(prev => prev ? { ...prev, review_info: null } : null);
    } catch (err) {
      console.error('Error marking as unreviewed:', err);
      alert('Failed to mark as unreviewed');
    } finally {
      setMarkingReviewed(false);
    }
  }

  async function markQuestionAsReviewed(questionId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const reviewInfo: ReviewInfo = {
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || 'unknown',
        reviewed_by_email: user?.email || 'unknown',
      };

      const { error } = await supabase
        .from('2V_questions')
        .update({ review_info: reviewInfo })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, review_info: reviewInfo } : q
      ));
    } catch (err) {
      console.error('Error marking question as reviewed:', err);
      alert('Failed to mark question as reviewed');
    }
  }

  async function markQuestionAsUnreviewed(questionId: string) {
    try {
      const { error } = await supabase
        .from('2V_questions')
        .update({ review_info: null })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, review_info: null } : q
      ));
    } catch (err) {
      console.error('Error marking question as unreviewed:', err);
      alert('Failed to mark question as unreviewed');
    }
  }

  // Start editing a question - copy to local state
  const startEditingQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setLocalEditingQuestion({ ...question });
      setEditingQuestionId(questionId);
    }
  };

  // Cancel editing - discard local changes
  const cancelEditingQuestion = () => {
    setLocalEditingQuestion(null);
    setEditingQuestionId(null);
  };

  // Edit question handlers - update LOCAL state only (fast, no re-render of entire list)
  const handleEditQuestion = (questionId: string, field: string, value: any) => {
    setLocalEditingQuestion(prev => {
      if (!prev || prev.id !== questionId) return prev;

      const updated = { ...prev };

      // Handle nested Data Insights fields (e.g., question_data.problem, question_data.statement1)
      if (field.startsWith('question_data.')) {
        const nestedField = field.replace('question_data.', '');
        updated.question_data = { ...updated.question_data, [nestedField]: value };
      }
      // Handle nested answers fields (e.g., answers.correct_answer)
      else if (field.startsWith('answers.')) {
        const nestedField = field.replace('answers.', '');
        updated.answers = { ...updated.answers, [nestedField]: value };
      }
      // Legacy handlers for regular multiple choice questions
      else if (field === 'question_text' || field === 'question_text_eng') {
        updated.question_data = { ...updated.question_data, [field]: value };
      } else if (field === 'correct_answer') {
        updated.answers = { ...updated.answers, correct_answer: value };
      } else if (field.startsWith('option_')) {
        // Handle language-specific options (e.g., option_a_eng, option_a_it)
        if (field.endsWith('_eng')) {
          const optionKey = field.replace('option_', '').replace('_eng', '');
          updated.question_data = {
            ...updated.question_data,
            options_eng: { ...updated.question_data.options_eng, [optionKey]: value }
          };
        } else if (field.endsWith('_it')) {
          const optionKey = field.replace('option_', '').replace('_it', '');
          updated.question_data = {
            ...updated.question_data,
            options: { ...updated.question_data.options, [optionKey]: value }
          };
        } else {
          // Legacy format without language suffix - default to Italian
          const optionKey = field.replace('option_', '');
          updated.question_data = {
            ...updated.question_data,
            options: { ...updated.question_data.options, [optionKey]: value }
          };
        }
      }

      return updated;
    });
  };

  const handleSaveQuestion = async (questionId: string) => {
    // Use local editing state if available, otherwise fall back to main state
    const question = localEditingQuestion?.id === questionId
      ? localEditingQuestion
      : questions.find(q => q.id === questionId);
    if (!question) return;

    setSavingQuestion(true);
    try {
      // Update question_data
      const { error: dataError } = await supabase
        .from('2V_questions')
        .update({ question_data: question.question_data })
        .eq('id', questionId);

      if (dataError) throw dataError;

      // Update answers
      const { error: answerError } = await supabase
        .from('2V_questions')
        .update({ answers: question.answers })
        .eq('id', questionId);

      if (answerError) throw answerError;

      // Sync local changes back to main questions state
      if (localEditingQuestion?.id === questionId) {
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...localEditingQuestion } : q
        ));
      }

      // Clear editing state
      setLocalEditingQuestion(null);
      setEditingQuestionId(null);
      console.log('Question saved successfully');
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save question');
    } finally {
      setSavingQuestion(false);
    }
  };

  // AI Review functions
  const startAICheck = (scope: 'full' | 'single', questionId?: string) => {
    setAICheckScope(scope);
    setAICheckQuestionId(questionId || null);
    setShowAICheckModal(true);
  };

  const runAICheck = async () => {
    setAIReviewing(true);
    setShowAICheckModal(false);

    try {
      const questionsToCheck = aiCheckScope === 'single' && aiCheckQuestionId
        ? questions.filter(q => q.id === aiCheckQuestionId)
        : questions;

      // Log what we're checking
      const questionsWithImages = questionsToCheck.filter(q => q.question_data?.image_url);
      console.log(`🔍 AI Check starting...`);
      console.log(`   Questions to check: ${questionsToCheck.length}`);
      console.log(`   Questions with images: ${questionsWithImages.length}`);
      console.log(`   Check type: ${aiCheckType}`);
      if (questionsWithImages.length > 0) {
        console.log(`   Image URLs:`, questionsWithImages.map(q => ({ q: q.question_number, url: q.question_data.image_url })));
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call the AI review edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-questions-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questions: questionsToCheck.map(q => ({
              id: q.id,
              question_number: q.question_number,
              question_data: q.question_data,
              answers: q.answers,
            })),
            checkType: aiCheckType,
            testInfo: selectedTest ? {
              test_type: selectedTest.test_type,
              section: selectedTest.section,
            } : undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI review failed');
      }

      const data = await response.json();

      // Convert API response to our format
      const results: AIReviewResult[] = (data.reviews || []).map((review: any) => ({
        questionId: review.questionId,
        questionNumber: review.questionNumber,
        explanation: review.explanation,
        isCorrect: review.isCorrect,
        issues: (review.issues || []).map((issue: any) => ({
          type: issue.type as 'correctness' | 'translation',
          severity: issue.severity as 'error' | 'warning' | 'info',
          description: issue.description,
          currentValue: issue.currentValue,
          suggestedValue: issue.suggestedValue,
          field: issue.field,
          confidence: issue.confidence,
        })),
        // Graph recreation fields
        graphRecreated: review.graphRecreated,
        graphFunction: review.graphFunction,
        graphType: review.graphType,
        graphDomain: review.graphDomain,
        graphRange: review.graphRange,
        graphAnalysis: review.graphAnalysis,
        cannotRecreateReason: review.cannotRecreateReason,
      }));

      setAIReviewResults(results);
      setShowAIResultsModal(true);

      // Log results summary
      console.log(`✅ AI Check complete`);
      console.log(`   Total reviews: ${results.length}`);
      console.log(`   Correct: ${results.filter(r => r.isCorrect).length}`);
      console.log(`   With issues: ${results.filter(r => r.issues.length > 0).length}`);
      console.log(`   Graphs recreated: ${results.filter(r => r.graphRecreated).length}`);
      console.log(`   Cannot recreate: ${results.filter(r => r.cannotRecreateReason).length}`);

      // Log usage info
      if (data.usage) {
        console.log('AI Review usage:', data.usage);
        console.log(`Cost: $${data.usage.cost_usd.toFixed(4)}`);
      }
    } catch (err) {
      console.error('❌ Error running AI check:', err);
      alert(`Failed to run AI check: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAIReviewing(false);
    }
  };

  const applyAISuggestion = async (questionId: string, field: string, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Update local state
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;

      const updated = { ...q };
      if (field === 'question_text_eng') {
        updated.question_data = { ...updated.question_data, question_text_eng: value };
      } else if (field.startsWith('option_')) {
        const optionKey = field.replace('option_', '');
        updated.question_data = {
          ...updated.question_data,
          options: { ...updated.question_data.options, [optionKey]: value }
        };
      }
      return updated;
    }));

    // Save to database
    const updatedQuestion = questions.find(q => q.id === questionId);
    if (updatedQuestion) {
      const updatedData = { ...updatedQuestion.question_data };
      if (field === 'question_text_eng') {
        updatedData.question_text_eng = value;
      }

      await supabase
        .from('2V_questions')
        .update({ question_data: updatedData })
        .eq('id', questionId);
    }

    // Remove from results
    setAIReviewResults(prev => prev.map(r => {
      if (r.questionId !== questionId) return r;
      return {
        ...r,
        issues: r.issues.filter(i => i.field !== field),
      };
    }).filter(r => r.issues.length > 0));
  };

  const dismissAIIssue = (questionId: string, field: string) => {
    setAIReviewResults(prev => prev.map(r => {
      if (r.questionId !== questionId) return r;
      return {
        ...r,
        issues: r.issues.filter(i => i.field !== field),
      };
    }).filter(r => r.issues.length > 0));
  };

  // Apply graph recreation from AI review
  const applyGraphRecreation = async (result: AIReviewResult) => {
    const question = questions.find(q => q.id === result.questionId);
    if (!question || !result.graphRecreated || !result.graphFunction) return;

    setApplyingGraph(result.questionId);
    try {
      const updatedData = {
        ...question.question_data,
        recreate_graph: true,
        graph_function: typeof result.graphFunction === 'string'
          ? result.graphFunction
          : JSON.stringify(result.graphFunction),
        graph_type: result.graphType,
        graph_domain: result.graphDomain,
        graph_range: result.graphRange,
        graph_analysis: result.graphAnalysis,
      };

      // Save to database
      const { error } = await supabase
        .from('2V_questions')
        .update({ question_data: updatedData })
        .eq('id', result.questionId);

      if (error) throw error;

      // Update local state
      setQuestions(prev => prev.map(q =>
        q.id === result.questionId
          ? { ...q, question_data: updatedData }
          : q
      ));

      // Mark as applied in results (remove graphRecreated)
      setAIReviewResults(prev => prev.map(r =>
        r.questionId === result.questionId
          ? { ...r, graphRecreated: false, graphFunction: undefined }
          : r
      ));

      console.log(`✓ Applied graph recreation for Q${result.questionNumber}`);
    } catch (err) {
      console.error('Error applying graph recreation:', err);
      alert('Failed to apply graph recreation');
    } finally {
      setApplyingGraph(null);
    }
  };

  // Helper to get text based on selected language (respects per-question overrides)
  const getQuestionLanguage = (questionId: string) => {
    return questionLanguageOverrides[questionId] || viewLanguage;
  };

  const getLocalizedText = (question: Question, italianField: string, englishField: string) => {
    const qData = question.question_data;
    const lang = getQuestionLanguage(question.id);
    if (lang === 'en' && qData[englishField]) {
      return qData[englishField];
    }
    return qData[italianField];
  };

  const getLocalizedOptions = (question: Question) => {
    const qData = question.question_data;
    const lang = getQuestionLanguage(question.id);
    if (lang === 'en' && qData.options_eng) {
      return qData.options_eng;
    }
    return qData.options;
  };

  const toggleQuestionLanguage = (questionId: string) => {
    setQuestionLanguageOverrides(prev => {
      const current = prev[questionId] || viewLanguage;
      return {
        ...prev,
        [questionId]: current === 'it' ? 'en' : 'it',
      };
    });
  };

  // Image upload handler
  const handleImageUpload = async (questionId: string, file: File) => {
    setUploadingImage(questionId);
    try {
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
      const base64Data = await base64Promise;

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
            imageData: base64Data,
            fileName: `question_${questionId}_${Date.now()}.${file.name.split('.').pop()}`,
            contentType: file.type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();

      // Update question in database
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const updatedData = {
          ...question.question_data,
          image_url: url,
        };

        await supabase
          .from('2V_questions')
          .update({ question_data: updatedData })
          .eq('id', questionId);

        // Update local state
        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, question_data: updatedData }
            : q
        ));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  // Generate graph from question using AI
  const handleGenerateGraph = async (questionId: string, feedback?: string) => {
    setGeneratingGraph(questionId);
    setShowRegenerateModal(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      // Build question data with feedback if provided
      const questionData = { ...question.question_data };
      if (feedback) {
        questionData.regenerate_feedback = feedback;
      }

      console.log(`🎨 Generating graph for Q${question.question_number}${feedback ? ` with feedback: "${feedback}"` : ''}`);

      // Call Claude to analyze and generate graph function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-questions-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questions: [{
              id: question.id,
              question_number: question.question_number,
              question_data: questionData,
              answers: question.answers,
            }],
            checkType: 'correctness',
            generateGraph: true, // Special flag to generate graph
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Graph generation failed:', errorData);
        throw new Error(errorData.error || 'Graph generation failed');
      }

      const data = await response.json();
      console.log('Graph generation response:', data);

      // Check if graph was generated - look in reviews array
      const review = data.reviews?.[0];
      if (review?.graphRecreated && review?.graphFunction) {
        const updatedData = {
          ...question.question_data,
          graph_function: typeof review.graphFunction === 'string'
            ? review.graphFunction
            : JSON.stringify(review.graphFunction),
          graph_type: review.graphType,
          graph_domain: review.graphDomain,
          graph_range: review.graphRange,
          graph_analysis: review.graphAnalysis,
          recreate_graph: true,
        };

        await supabase
          .from('2V_questions')
          .update({ question_data: updatedData })
          .eq('id', questionId);

        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, question_data: updatedData }
            : q
        ));
        console.log(`✓ Graph generated for Q${question.question_number}`);
      } else {
        // Show why it couldn't be recreated
        const reason = review?.cannotRecreateReason || 'AI could not recreate the graph/image';
        console.warn(`Cannot recreate graph for Q${question.question_number}:`, reason);
        alert(`Cannot recreate graph:\n\n${reason}`);
      }
    } catch (err) {
      console.error('Error generating graph:', err);
      alert('Failed to generate graph');
    } finally {
      setGeneratingGraph(null);
    }
  };

  // Delete Recharts code and go back to image
  const handleDeleteRechartsCode = async (questionId: string) => {
    if (!confirm('Are you sure you want to remove the Recharts graph and go back to the static image?')) {
      return;
    }

    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const updatedData = {
        ...question.question_data,
        recharts_code: null,
        graph_type: null,
      };

      const { error } = await supabase
        .from('2V_questions')
        .update({ question_data: updatedData })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, question_data: updatedData }
          : q
      ));

      console.log('✓ Recharts code removed, showing static image');
    } catch (err) {
      console.error('Error deleting Recharts code:', err);
      alert('Failed to delete Recharts code');
    }
  };

  // Save edited Recharts code
  const handleSaveRechartsCode = async () => {
    if (!rechartsCodeQuestionId || !editingRechartsCode) return;

    try {
      const question = questions.find(q => q.id === rechartsCodeQuestionId);
      if (!question) return;

      const updatedData = {
        ...question.question_data,
        recharts_code: editingRechartsCode,
      };

      const { error } = await supabase
        .from('2V_questions')
        .update({ question_data: updatedData })
        .eq('id', rechartsCodeQuestionId);

      if (error) throw error;

      setQuestions(prev => prev.map(q =>
        q.id === rechartsCodeQuestionId
          ? { ...q, question_data: updatedData }
          : q
      ));

      setEditingRechartsCode(null);
      setRechartsCodeQuestionId(null);
      alert('✅ Recharts code updated successfully!');
    } catch (err) {
      console.error('Error saving Recharts code:', err);
      alert('Failed to save Recharts code');
    }
  };

  // Download Answer Key as PDF
  const downloadAnswerKeyPDF = () => {
    if (!selectedTest) return;

    try {
      const doc = new jsPDF();

      // Prepare table data
      const tableData = questions.map((question) => {
        let correctAnswerDisplay = '';

        try {
          const answersData = typeof question.answers === 'string'
            ? JSON.parse(question.answers)
            : question.answers;

          if (question.question_type === 'multiple_choice') {
            const correctAnswer = Array.isArray(answersData?.correct_answer)
              ? answersData.correct_answer[0]
              : answersData?.correct_answer;
            correctAnswerDisplay = correctAnswer ? correctAnswer.toUpperCase() : 'N/A';
          } else if (question.question_type === 'tpa') {
            if (answersData?.correct_answer) {
              const tpaAnswer = answersData.correct_answer;
              if (typeof tpaAnswer === 'object' && tpaAnswer.col1 && tpaAnswer.col2) {
                correctAnswerDisplay = `Col1: ${tpaAnswer.col1}, Col2: ${tpaAnswer.col2}`;
              } else {
                correctAnswerDisplay = 'N/A';
              }
            } else {
              correctAnswerDisplay = 'N/A';
            }
          } else if (question.question_type === 'msr') {
            if (Array.isArray(answersData?.correct_answer)) {
              correctAnswerDisplay = answersData.correct_answer
                .map((ans: string, idx: number) => `${idx + 1}: ${ans.toUpperCase()}`)
                .join(', ');
            } else {
              correctAnswerDisplay = 'N/A';
            }
          } else if (question.question_type === 'open_ended') {
            correctAnswerDisplay = 'Open-ended';
          } else {
            correctAnswerDisplay = 'N/A';
          }
        } catch (error) {
          console.error('Error parsing answer for question', question.id, error);
          correctAnswerDisplay = 'Error';
        }

        const questionType = question.question_type.replace('_', ' ').toUpperCase();

        return [
          question.question_number.toString(),
          questionType,
          correctAnswerDisplay
        ];
      });

      // Prepare test name
      const testName = selectedTest.test_name || selectedTest.name || 'Test';

      // Add title table
      autoTable(doc, {
        body: [
          [{ content: 'ANSWER KEY', styles: { halign: 'center', fontSize: 16, fontStyle: 'bold' } }],
          [{ content: testName, styles: { halign: 'center', fontSize: 12 } }],
          [{ content: `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, styles: { halign: 'center', fontSize: 8, textColor: [100, 100, 100] } }]
        ],
        startY: 10,
        theme: 'plain',
        tableWidth: 'auto',
        margin: { left: 14 }
      });

      // Add answer key table
      autoTable(doc, {
        head: [['Question #', 'Type', 'Correct Answer']],
        body: tableData,
        startY: (doc as any).lastAutoTable.finalY + 10,
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229], // Indigo color
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 'auto' }
        }
      });

      // Save the PDF
      const fileName = `Answer_Key_${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Recreate graph with Recharts using Claude API
  const handleRecreateGraphWithRecharts = async (questionId: string) => {
    setGeneratingGraph(questionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      // Check if question has an image
      const imageUrl = question.question_data?.image_url || question.question_data?.graph_url;
      if (!imageUrl) {
        alert('Please extract an image from PDF first before recreating the graph.');
        setGeneratingGraph(null);
        return;
      }

      console.log(`📊 Recreating graph with Recharts for Q${question.question_number}`);

      // Fetch the image as base64
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
        };
        reader.readAsDataURL(imageBlob);
      });

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recreate-graph-with-recharts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64,
            width: question.question_data?.image_width || 800,
            height: question.question_data?.image_height || 600,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Recharts generation failed:', errorData);
        throw new Error(errorData.error || 'Recharts generation failed');
      }

      const data = await response.json();
      console.log('Recharts code generated:', data);

      if (data.rechartsCode) {
        const updatedData = {
          ...question.question_data,
          recharts_code: data.rechartsCode,
          graph_type: 'recharts',
          recreate_graph: true,
        };

        await supabase
          .from('2V_questions')
          .update({ question_data: updatedData })
          .eq('id', questionId);

        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, question_data: updatedData }
            : q
        ));

        alert('✅ Graph recreated with Recharts! Check the question data.');
        console.log(`✓ Recharts code generated for Q${question.question_number}`);
      }
    } catch (err) {
      console.error('Error generating Recharts code:', err);
      alert('Failed to generate Recharts code: ' + (err as Error).message);
    } finally {
      setGeneratingGraph(null);
    }
  };

  // Image management functions
  const handleAddImage = (questionId: string, optionKey?: string) => {
    const question = questions.find(q => q.id === questionId);
    setCurrentImageQuestionId(questionId);
    setCurrentImageOptionKey(optionKey || null);
    setSelectedPageForExtraction(question?.question_data?.page_number || 1);
    setShowImageSourceModal(true);
  };

  const handleExtractFromPDF = async (pageNumber: number) => {
    if (!currentImageQuestionId || !selectedTest) return;

    const question = questions.find(q => q.id === currentImageQuestionId);
    if (!question) return;

    setLoadingImages(true);
    try {
      // Get PDF URL from question data
      const pdfUrl = question.question_data?.pdf_url || questions[0]?.question_data?.pdf_url;
      if (!pdfUrl) {
        alert('No PDF URL found');
        return;
      }

      // Fetch and load PDF
      const pdfResponse = await fetch(pdfUrl);
      const pdfBlob = await pdfResponse.blob();
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
      const pdfDoc = await loadingTask.promise;

      if (pageNumber > pdfDoc.numPages) {
        alert(`Page ${pageNumber} does not exist. PDF has ${pdfDoc.numPages} pages.`);
        return;
      }

      // Get the page
      const page = await pdfDoc.getPage(pageNumber);

      // Render page
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx!,
        viewport: viewport,
      }).promise;

      // Get operator list to find images
      const ops = await page.getOperatorList();
      const allImagesOnPage: any[] = [];

      console.log(`📄 Found ${ops.fnArray.filter(fn => fn === pdfjsLib.OPS.paintImageXObject).length} image operations on page ${pageNumber}`);

      // First, collect all image names
      const imageNames: string[] = [];
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          imageNames.push(ops.argsArray[i][0]);
        }
      }

      // Wait a bit for all objects to be loaded
      if (imageNames.length > 0) {
        console.log(`⏳ Waiting for ${imageNames.length} images to be resolved...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Now process the images
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const imageName = ops.argsArray[i][0];

          try {
            // Check if the image is resolved
            const isResolved = page.objs.has(imageName);
            if (!isResolved) {
              console.log(`  ⏳ Image ${imageName} not yet resolved, waiting...`);
              // Wait a bit more
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            const image = await page.objs.get(imageName);

            if (image && image.width && image.height) {
              // Get Y position
              let yPosition = 0;
              for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
                if (ops.fnArray[j] === pdfjsLib.OPS.transform ||
                    ops.fnArray[j] === pdfjsLib.OPS.setMatrix) {
                  const matrix = ops.argsArray[j];
                  if (matrix && matrix.length >= 6) {
                    yPosition = matrix[5];
                    break;
                  }
                }
              }

              console.log(`  ✓ Image ${imageName}: ${image.width}×${image.height}px, Y: ${yPosition}`);

              allImagesOnPage.push({
                imageName,
                image,
                yPosition,
                width: image.width,
                height: image.height,
                opIndex: i
              });
            } else {
              console.log(`  ✗ Image ${imageName}: Invalid dimensions`);
            }
          } catch (err) {
            console.error(`  ✗ Failed to get image ${imageName}:`, err);
          }
        }
      }

      console.log(`📊 Total valid images found: ${allImagesOnPage.length}`);

      // Sort by Y position (top to bottom)
      allImagesOnPage.sort((a, b) => b.yPosition - a.yPosition);

      // No filtering - extract every single image
      const imagesToProcess = allImagesOnPage;

      // Extract images
      const extractedImages: { url: string; width: number; height: number; y: number }[] = [];

      console.log(`🎨 Processing ${imagesToProcess.length} images for extraction...`);

      for (const imgData of imagesToProcess) {
        const { image, yPosition, imageName } = imgData;

        try {
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error(`  ✗ ${imageName}: Failed to get canvas context`);
            continue;
          }

          let imageDrawn = false;

          if (image.bitmap) {
            console.log(`  📸 ${imageName}: Drawing from bitmap`);
            ctx.drawImage(image.bitmap, 0, 0);
            imageDrawn = true;
          } else if (image.data) {
            console.log(`  📸 ${imageName}: Drawing from raw data (type: ${typeof image.data})`);

            // Try to handle different data formats
            try {
              if (image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray) {
                const imageData = ctx.createImageData(image.width, image.height);

                // Check if it's RGBA (4 channels) or other format
                if (image.data.length === image.width * image.height * 4) {
                  // RGBA data
                  imageData.data.set(image.data);
                } else if (image.data.length === image.width * image.height * 3) {
                  // RGB data - convert to RGBA
                  for (let i = 0, j = 0; i < image.data.length; i += 3, j += 4) {
                    imageData.data[j] = image.data[i];     // R
                    imageData.data[j + 1] = image.data[i + 1]; // G
                    imageData.data[j + 2] = image.data[i + 2]; // B
                    imageData.data[j + 3] = 255;           // A
                  }
                } else if (image.data.length === image.width * image.height) {
                  // Grayscale - convert to RGBA
                  for (let i = 0, j = 0; i < image.data.length; i++, j += 4) {
                    const gray = image.data[i];
                    imageData.data[j] = gray;     // R
                    imageData.data[j + 1] = gray; // G
                    imageData.data[j + 2] = gray; // B
                    imageData.data[j + 3] = 255;  // A
                  }
                } else {
                  console.error(`  ✗ ${imageName}: Unexpected data length: ${image.data.length} for ${image.width}×${image.height}`);
                }

                ctx.putImageData(imageData, 0, 0);
                imageDrawn = true;
              } else {
                console.error(`  ✗ ${imageName}: Unexpected data type:`, typeof image.data);
              }
            } catch (dataErr) {
              console.error(`  ✗ ${imageName}: Error processing image data:`, dataErr);
            }
          } else {
            console.error(`  ✗ ${imageName}: No bitmap or data available. Image properties:`, Object.keys(image));
          }

          if (imageDrawn) {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/png');
            });

            if (blob) {
              const url = URL.createObjectURL(blob);
              extractedImages.push({
                url,
                width: image.width,
                height: image.height,
                y: yPosition,
              });
              console.log(`  ✅ ${imageName}: Successfully extracted (${blob.size} bytes)`);
            } else {
              console.error(`  ✗ ${imageName}: Failed to create blob`);
            }
          }
        } catch (err) {
          console.error(`  ✗ ${imageName}: Extraction failed:`, err);
        }
      }

      console.log(`✅ Successfully extracted ${extractedImages.length} images`);
      console.log('  → recreateWithRecharts flag after extraction:', recreateWithRecharts);
      console.log('  → recreateWithPython flag after extraction:', recreateWithPython);

      // Python recreation if enabled
      if (recreateWithPython && extractedImages.length > 0) {
        setExtractingImage(true);
        setLoadingImages(false);

        try {
          console.log(`🐍 Recreating ${extractedImages.length} images with Python API...`);
          const recreatedImages: { url: string; width: number; height: number; y: number }[] = [];

          for (let i = 0; i < extractedImages.length; i++) {
            setImageExtractionProgress(Math.round(((i + 1) / extractedImages.length) * 100));

            const img = extractedImages[i];

            // Convert image to base64
            const response = await fetch(img.url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let j = 0; j < bytes.byteLength; j++) {
              binary += String.fromCharCode(bytes[j]);
            }
            const imageBase64 = btoa(binary);

            // Call Python API to recreate image
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) throw new Error('Not authenticated');

            console.log(`  🔄 Recreating image ${i + 1}/${extractedImages.length}...`);

            const pythonResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recreate-image-python`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  imageBase64,
                  width: img.width,
                  height: img.height,
                }),
              }
            );

            if (!pythonResponse.ok) {
              console.error(`  ✗ Python recreation failed for image ${i + 1}`);
              // Fallback to original image
              recreatedImages.push(img);
              continue;
            }

            const pythonData = await pythonResponse.json();

            if (pythonData.recreatedImageBase64) {
              // Convert base64 back to blob URL
              const binaryString = atob(pythonData.recreatedImageBase64);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              const recreatedBlob = new Blob([bytes], { type: 'image/png' });
              const recreatedUrl = URL.createObjectURL(recreatedBlob);

              recreatedImages.push({
                url: recreatedUrl,
                width: pythonData.width || img.width,
                height: pythonData.height || img.height,
                y: img.y,
              });
              console.log(`  ✅ Image ${i + 1} recreated successfully`);
            } else {
              // Fallback to original
              recreatedImages.push(img);
            }
          }

          console.log(`✅ Python recreation complete: ${recreatedImages.length} images`);
          setAvailableImages(recreatedImages);
        } catch (err) {
          console.error('Python recreation error:', err);
          alert(`Python recreation failed: ${err.message}. Showing original images.`);
          setAvailableImages(extractedImages);
        } finally {
          setExtractingImage(false);
          setImageExtractionProgress(0);
        }
      } else {
        setAvailableImages(extractedImages);
      }
    } catch (err) {
      console.error('Error extracting images:', err);
      alert('Failed to extract images from PDF');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSelectImage = async (imageUrl: string) => {
    if (!currentImageQuestionId) return;

    console.log('📸 User selected image');
    console.log('  → recreateWithRecharts state:', recreateWithRecharts);
    console.log('  → recreateWithPython state:', recreateWithPython);

    setUploadingImage(true);
    try {
      console.log('📤 Starting image upload...');

      // Convert blob URL to base64
      console.log('  📥 Fetching blob from URL...');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      console.log(`  ✓ Blob fetched: ${blob.size} bytes, type: ${blob.type}`);

      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const imageBase64 = btoa(binary);
      console.log(`  ✓ Converted to base64: ${imageBase64.length} characters`);

      // Upload via edge function
      console.log('  🔐 Getting auth session...');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');
      console.log('  ✓ Auth token obtained');

      const question = questions.find(q => q.id === currentImageQuestionId);
      const filePath = currentImageOptionKey
        ? `question_${question?.question_number}_option_${currentImageOptionKey}_${Date.now()}.png`
        : `question_${question?.question_number}_${Date.now()}.png`;
      console.log(`  📝 File path: ${filePath}`);

      console.log('  🌐 Uploading to edge function...');
      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64,
          }),
        }
      );

      console.log(`  📡 Response status: ${uploadResponse.status} ${uploadResponse.statusText}`);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload error response:', errorText);
        throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
      }

      const responseData = await uploadResponse.json();
      console.log('  ✓ Upload response:', responseData);
      const { publicUrl } = responseData;

      if (!publicUrl) {
        console.error('❌ No publicUrl in response:', responseData);
        throw new Error('No publicUrl returned from upload');
      }

      console.log(`  📸 Public URL: ${publicUrl}`);

      // Update question in database
      if (question) {
        console.log('  💾 Updating question in database...');
        let updatedData;

        if (currentImageOptionKey) {
          // Updating an answer option image
          console.log(`  → Updating option ${currentImageOptionKey} image (${selectedImageLanguage})`);
          if (selectedImageLanguage === 'ita') {
            updatedData = {
              ...question.question_data,
              image_options: {
                ...(question.question_data.image_options || {}),
                [currentImageOptionKey]: publicUrl,
              },
            };
          } else {
            // English version
            updatedData = {
              ...question.question_data,
              image_options_eng: {
                ...(question.question_data.image_options_eng || {}),
                [currentImageOptionKey]: publicUrl,
              },
            };
          }
        } else {
          // Updating the main question image
          console.log(`  → Updating main question image (${selectedImageLanguage})`);
          if (selectedImageLanguage === 'ita') {
            updatedData = {
              ...question.question_data,
              image_url: publicUrl,
            };
          } else {
            // English version
            updatedData = {
              ...question.question_data,
              image_url_eng: publicUrl,
            };
          }
        }

        const { error: updateError } = await supabase
          .from('2V_questions')
          .update({ question_data: updatedData })
          .eq('id', currentImageQuestionId);

        if (updateError) {
          console.error('❌ Database update error:', updateError);
          throw updateError;
        }

        console.log('  ✓ Database updated successfully');

        // Update local state
        setQuestions(prev => prev.map(q =>
          q.id === currentImageQuestionId
            ? { ...q, question_data: updatedData }
            : q
        ));
        console.log('  ✓ Local state updated');
      }

      // If recreating with Recharts, trigger it now
      console.log('  🔍 Checking Recharts flag:', { recreateWithRecharts, currentImageQuestionId });
      if (recreateWithRecharts && currentImageQuestionId) {
        console.log('🤖 Auto-triggering Recharts recreation...');
        setRecreateWithRecharts(false);
        // Clean up modal first
        availableImages.forEach(img => URL.revokeObjectURL(img.url));
        setAvailableImages([]);
        setShowImageSourceModal(false);
        const questionId = currentImageQuestionId;
        setCurrentImageQuestionId(null);
        // Then trigger recreation
        handleRecreateGraphWithRecharts(questionId);
        console.log('✅ Image uploaded, Recharts recreation triggered!');
        return;
      }

      // Don't close modal - allow uploading another language
      // Clean up
      // console.log('  🧹 Cleaning up...');
      // availableImages.forEach(img => URL.revokeObjectURL(img.url));
      // setAvailableImages([]);
      // setShowImageSourceModal(false);
      // setCurrentImageQuestionId(null);
      // setCurrentImageOptionKey(null);
      console.log('✅ Image upload completed successfully! Modal stays open for other language.');
    } catch (err) {
      console.error('❌ Error uploading image:', err);
      alert(`Failed to upload image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRecreateWithRecharts(false);
      setRecreateWithPython(false);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDirectUpload = async (file: File) => {
    if (!currentImageQuestionId) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // Upload via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      const question = questions.find(q => q.id === currentImageQuestionId);
      const filePath = currentImageOptionKey
        ? `question_${question?.question_number}_option_${currentImageOptionKey}_${Date.now()}.${file.name.split('.').pop()}`
        : `question_${question?.question_number}_${Date.now()}.${file.name.split('.').pop()}`;

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64,
          }),
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { publicUrl } = await uploadResponse.json();

      console.log('🖼️ Image uploaded successfully:', {
        publicUrl,
        selectedLanguage: selectedImageLanguage,
        questionId: currentImageQuestionId,
        isOption: !!currentImageOptionKey,
        optionKey: currentImageOptionKey
      });

      // Update question in database
      if (question) {
        let updatedData;

        if (currentImageOptionKey) {
          // Updating an answer option image
          console.log(`  → Applying to image_options${selectedImageLanguage === 'eng' ? '_eng' : ''}.${currentImageOptionKey}`);
          if (selectedImageLanguage === 'ita') {
            updatedData = {
              ...question.question_data,
              image_options: {
                ...(question.question_data.image_options || {}),
                [currentImageOptionKey]: publicUrl,
              },
            };
          } else {
            // English version
            updatedData = {
              ...question.question_data,
              image_options_eng: {
                ...(question.question_data.image_options_eng || {}),
                [currentImageOptionKey]: publicUrl,
              },
            };
          }
        } else {
          // Updating the main question image
          console.log(`  → Applying to ${selectedImageLanguage === 'ita' ? 'image_url' : 'image_url_eng'}`);
          if (selectedImageLanguage === 'ita') {
            updatedData = {
              ...question.question_data,
              image_url: publicUrl,
            };
          } else {
            // English version
            updatedData = {
              ...question.question_data,
              image_url_eng: publicUrl,
            };
          }
        }

        console.log('  → Updated data:', {
          has_image_url: !!updatedData.image_url,
          has_image_url_eng: !!updatedData.image_url_eng,
          has_image_options: !!updatedData.image_options,
          has_image_options_eng: !!updatedData.image_options_eng
        });

        await supabase
          .from('2V_questions')
          .update({ question_data: updatedData })
          .eq('id', currentImageQuestionId);

        // Update local state
        setQuestions(prev => prev.map(q =>
          q.id === currentImageQuestionId
            ? { ...q, question_data: updatedData }
            : q
        ));
      }

      // Don't close modal - allow uploading another language
      // setShowImageSourceModal(false);
      // setCurrentImageQuestionId(null);
      // setCurrentImageOptionKey(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Filter tests and merge with loaded details
  const filteredTests = tests
    .filter(test => {
      // Track filter is required
      if (!trackFilter || test.test_type !== trackFilter) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          test.test_type.toLowerCase().includes(search) ||
          test.section.toLowerCase().includes(search) ||
          test.exercise_type.toLowerCase().includes(search) ||
          `${test.test_number}`.includes(search);
        if (!matchesSearch) return false;
      }

      // Get details from loaded data
      const details = testDetails.get(test.id);

      // Format filter
      if (formatFilter !== 'all') {
        const format = details?.format || 'pdf';
        if (format !== formatFilter) return false;
      }

      // Reviewed filter
      if (reviewedFilter === 'reviewed' && !test.review_info) return false;
      if (reviewedFilter === 'unreviewed' && test.review_info) return false;

      // Flagged filter
      const flaggedCount = details?.flagged_count || 0;
      if (flaggedFilter === 'flagged' && flaggedCount === 0) return false;
      if (flaggedFilter === 'not_flagged' && flaggedCount > 0) return false;

      return true;
    })
    .map(test => {
      // Merge with loaded details
      const details = testDetails.get(test.id);
      return {
        ...test,
        question_count: details?.question_count || 0,
        format: details?.format || ('pdf' as const),
        flagged_count: details?.flagged_count || 0,
      };
    });

  // Get PDF URL from first question
  const pdfUrl = questions.length > 0 ? questions[0]?.question_data?.pdf_url : null;

  return (
    <MathJaxProvider>
      <Layout pageTitle="Review Questions" pageSubtitle="Review and approve converted questions">
        <div className="flex-1 p-4 md:p-8 bg-gray-50">
          <div className="max-w-full mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/admin')}
              className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Admin Dashboard</span>
            </button>

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-4 bg-white rounded-xl shadow-md p-2">
              <button
                onClick={() => {
                  setViewMode('entireTests');
                  setSelectedTest(null);
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  viewMode === 'entireTests'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faListCheck} className="mr-2" />
                Entire Tests
              </button>
              <button
                onClick={() => {
                  setViewMode('flaggedQuestions');
                  setSelectedTest(null);
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all relative ${
                  viewMode === 'flaggedQuestions'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                Flagged Questions
                {flaggedQuestions.length > 0 && (
                  <span className="ml-2 bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                    {flaggedQuestions.length}
                  </span>
                )}
              </button>
            </div>

            {viewMode === 'entireTests' && !selectedTest ? (
              /* Test Selection View */
              <div className="bg-white rounded-xl shadow-xl p-6">
                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      />
                    </div>

                    {/* Track Filter (Required) */}
                    <select
                      value={trackFilter}
                      onChange={(e) => setTrackFilter(e.target.value)}
                      className="px-4 py-2 border-2 border-brand-green rounded-lg focus:ring-2 focus:ring-brand-green bg-white font-semibold"
                    >
                      <option value="" disabled>Select Track</option>
                      {testTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    {/* Format Filter */}
                    <select
                      value={formatFilter}
                      onChange={(e) => setFormatFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green bg-white"
                    >
                      <option value="all">All Formats</option>
                      <option value="pdf">PDF</option>
                      <option value="interactive">Interactive</option>
                      <option value="mixed">Mixed</option>
                    </select>

                    {/* Reviewed Filter */}
                    <select
                      value={reviewedFilter}
                      onChange={(e) => setReviewedFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="unreviewed">Not Reviewed</option>
                    </select>

                    {/* Flagged Filter */}
                    <select
                      value={flaggedFilter}
                      onChange={(e) => setFlaggedFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green bg-white"
                    >
                      <option value="all">All Flags</option>
                      <option value="flagged">Has Flags</option>
                      <option value="not_flagged">No Flags</option>
                    </select>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{filteredTests.length} tests</span>
                    <span className="text-green-600">
                      {filteredTests.filter(t => t.review_info).length} reviewed
                    </span>
                    <span className="text-orange-600">
                      {filteredTests.filter(t => !t.review_info).length} pending
                    </span>
                    {filteredTests.some(t => (t.flagged_count || 0) > 0) && (
                      <span className="text-red-600">
                        {filteredTests.filter(t => (t.flagged_count || 0) > 0).length} with flags
                      </span>
                    )}
                  </div>
                </div>

                {/* Test List */}
                {loadingTests ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-brand-green mb-4" />
                    <p className="text-gray-600">Loading tests...</p>
                  </div>
                ) : !trackFilter ? (
                  <div className="text-center py-12 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <FontAwesomeIcon icon={faFilter} className="text-4xl text-blue-400 mb-4" />
                    <p className="text-blue-700 font-semibold">Please select a Track to view tests</p>
                    <p className="text-blue-600 text-sm mt-2">
                      Tests are filtered by track to improve performance
                    </p>
                  </div>
                ) : testDetails.size === 0 ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-brand-green mb-4" />
                    <p className="text-gray-600">Loading {trackFilter} tests...</p>
                  </div>
                ) : filteredTests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No tests found matching your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTests.map(test => (
                      <button
                        key={test.id}
                        onClick={() => setSelectedTest(test)}
                        className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                          (test.flagged_count || 0) > 0
                            ? 'border-red-300 bg-red-50 hover:border-red-500'
                            : test.review_info
                            ? 'border-green-200 bg-green-50 hover:border-green-400'
                            : 'border-gray-200 bg-white hover:border-brand-green'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-bold text-brand-dark">
                            {test.section}
                          </span>
                          <div className="flex items-center gap-1">
                            {(test.flagged_count || 0) > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full font-bold">
                                {test.flagged_count} flags
                              </span>
                            )}
                            {test.review_info && (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {test.exercise_type} #{test.test_number}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {test.test_type}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            test.format === 'interactive'
                              ? 'bg-green-100 text-green-700'
                              : test.format === 'mixed'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {test.format === 'interactive' ? 'Interactive' : test.format === 'mixed' ? 'Mixed' : 'PDF'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {test.question_count} Q
                          </span>
                        </div>
                        {test.review_info && (
                          <p className="mt-2 text-xs text-green-600">
                            Reviewed {new Date(test.review_info.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : viewMode === 'entireTests' && selectedTest ? (
              /* Test Review View - PDF Left, Questions Right */
              <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                {/* Fixed PDF Panel */}
                <div className="bg-white rounded-xl shadow-xl p-6 lg:fixed lg:left-8 lg:top-4 lg:w-[calc(50%-2rem)] lg:h-[calc(100vh-32px)] overflow-hidden flex flex-col z-10">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                        <span className="text-2xl">📄</span>
                        {selectedTest.section}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedTest.exercise_type} #{selectedTest.test_number}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTest(null)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
                    >
                      Back to List
                    </button>
                  </div>

                  {pdfUrl ? (
                    <div className="flex-1 overflow-hidden rounded-lg border-2 border-gray-300">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-300 mb-2" />
                        <p className="text-gray-500">No PDF available</p>
                        <p className="text-sm text-gray-400">This is an interactive test</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Spacer for fixed panel */}
                <div className="hidden lg:block" />

                {/* Questions Panel */}
                <div className="bg-white rounded-xl shadow-xl p-6 mt-6 lg:mt-0">
                  {/* Header with actions */}
                  <div className="flex flex-col gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Questions ({sectionFilter === 'all' ? questions.length : `${questions.filter(q => q.section === sectionFilter).length}/${questions.length}`})
                      </h2>
                      <div className="flex items-center gap-2">
                        {selectedTest.review_info ? (
                          <button
                            onClick={markAsUnreviewed}
                            disabled={markingReviewed}
                            className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2 font-semibold text-sm"
                          >
                            {markingReviewed ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            )}
                            Unmark Reviewed
                          </button>
                        ) : (
                          <button
                            onClick={markAsReviewed}
                            disabled={markingReviewed}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold text-sm"
                          >
                            {markingReviewed ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            )}
                            Mark as Reviewed
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Language Toggle, Section Filter, Answer Key and AI Check */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        {/* Answer Key Button */}
                        <button
                          onClick={() => setShowAnswerKeyModal(true)}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 border-2 border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2 font-semibold text-sm"
                          title="View all correct answers at a glance"
                        >
                          <FontAwesomeIcon icon={faList} />
                          Answer Key
                        </button>

                        {/* Language Toggle */}
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLanguage} className="text-gray-500" />
                          <div className="flex rounded-lg overflow-hidden border border-gray-300">
                            <button
                              onClick={() => setViewLanguage('it')}
                              className={`px-3 py-1.5 text-sm font-medium transition ${
                                viewLanguage === 'it'
                                  ? 'bg-brand-green text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              🇮🇹 IT
                            </button>
                            <button
                              onClick={() => setViewLanguage('en')}
                              className={`px-3 py-1.5 text-sm font-medium transition ${
                                viewLanguage === 'en'
                                  ? 'bg-brand-green text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              🇬🇧 EN
                            </button>
                          </div>
                        </div>

                        {/* Section Filter */}
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                          <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green bg-white"
                          >
                            <option value="all">All Sections</option>
                            {[...new Set(questions.map(q => q.section))].sort().map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                        </div>

                        {/* Question Reviewed Filter */}
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-gray-500" />
                          <select
                            value={questionReviewedFilter}
                            onChange={(e) => {
                              setQuestionReviewedFilter(e.target.value as 'all' | 'reviewed' | 'unreviewed');
                              setQuestionsPage(1); // Reset to page 1 when filter changes
                            }}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green bg-white"
                          >
                            <option value="all">All Questions</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="unreviewed">Not Reviewed</option>
                          </select>
                        </div>
                      </div>

                      {/* AI Check Button */}
                      <button
                        onClick={() => startAICheck('full')}
                        disabled={aiReviewing}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold text-sm"
                      >
                        {aiReviewing ? (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                          <FontAwesomeIcon icon={faRobot} />
                        )}
                        AI Check Test
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {loadingQuestions ? (
                    <div className="text-center py-12">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-brand-green mb-4" />
                      <p className="text-gray-600">Loading questions...</p>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No questions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pagination Controls */}
                      {(() => {
                        const filteredQuestions = questions.filter(q => {
                          if (sectionFilter !== 'all' && q.section !== sectionFilter) return false;
                          if (questionReviewedFilter === 'reviewed' && !q.review_info) return false;
                          if (questionReviewedFilter === 'unreviewed' && q.review_info) return false;
                          return true;
                        });
                        const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
                        if (totalPages > 1) {
                          return (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
                              <span className="text-sm text-gray-600">
                                Showing {((questionsPage - 1) * QUESTIONS_PER_PAGE) + 1}-{Math.min(questionsPage * QUESTIONS_PER_PAGE, filteredQuestions.length)} of {filteredQuestions.length} questions
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setQuestionsPage(p => Math.max(1, p - 1))}
                                  disabled={questionsPage === 1}
                                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Previous
                                </button>
                                <span className="text-sm font-medium">
                                  Page {questionsPage} of {totalPages}
                                </span>
                                <button
                                  onClick={() => setQuestionsPage(p => Math.min(totalPages, p + 1))}
                                  disabled={questionsPage === totalPages}
                                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        const filteredQuestions = questions.filter(q => {
                          if (sectionFilter !== 'all' && q.section !== sectionFilter) return false;
                          if (questionReviewedFilter === 'reviewed' && !q.review_info) return false;
                          if (questionReviewedFilter === 'unreviewed' && q.review_info) return false;
                          return true;
                        });
                        const paginatedQuestions = filteredQuestions.slice((questionsPage - 1) * QUESTIONS_PER_PAGE, questionsPage * QUESTIONS_PER_PAGE);
                        // Track which passages have been shown on this page
                        const shownPassagesOnPage = new Set<string>();

                        return paginatedQuestions.map((question) => {
                        const isFlagged = flaggedQuestionIds.has(question.id);
                        const localizedOptions = getLocalizedOptions(question);

                        // Check if this question starts a passage group (first occurrence on this page)
                        const passageId = question.question_data?.passage_id;
                        const passage = passageId ? passages.find(p => p.passage_id === passageId) : null;
                        const isFirstInPassage = passage && passageId && !shownPassagesOnPage.has(passageId);
                        if (passageId && isFirstInPassage) {
                          shownPassagesOnPage.add(passageId);
                        }

                        return (
                        <div key={question.id}>
                          {/* Show passage before the first question that uses it */}
                          {isFirstInPassage && passage && (
                            <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                  <span>📖</span>
                                  {getQuestionLanguage(question.id) === 'en' && passage.passage_title_eng
                                    ? passage.passage_title_eng
                                    : passage.passage_title || 'Shared Passage'}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                    For Questions: {questions
                                      .filter(q => q.question_data?.passage_id === passageId)
                                      .map(q => q.question_number)
                                      .join(', ')}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingPassageId(passageId);
                                      const linkedQuestions = questions.filter(q => q.question_data?.passage_id === passageId);
                                      setSelectedQuestionsForPassage(linkedQuestions.map(q => q.question_number));
                                      setNewPassageText(passage.passage_text || '');
                                      setNewPassageTextEng(passage.passage_text_eng || '');
                                      setNewPassageTitle(passage.passage_title || '');
                                      setNewPassageTitleEng(passage.passage_title_eng || '');
                                      setPageRangeInput('');
                                      setShowPassageModal(true);
                                    }}
                                    className="text-amber-600 hover:text-amber-800 text-sm"
                                    title="Edit passage"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-4 text-gray-700 overflow-x-auto">
                                <div className="whitespace-pre-wrap">
                                  <MathJaxRenderer>
                                    {normalizeWhitespace(getQuestionLanguage(question.id) === 'en' && passage.passage_text_eng
                                      ? passage.passage_text_eng
                                      : passage.passage_text || '')}
                                  </MathJaxRenderer>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Question Card */}
                          <div
                            id={`question-${question.question_number}`}
                            className={`border-2 rounded-xl p-4 transition-colors ${
                              isFlagged
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-200 hover:border-brand-green'
                            }`}
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-brand-dark text-lg">
                                  Question {question.question_number}
                                  {passageId && (
                                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                      📖 {passageId}
                                    </span>
                                  )}
                                  {/* Language Consistency Indicator */}
                                  {(() => {
                                    // Check if both Italian and English options exist
                                    const hasItalian = question.question_data?.options;
                                    const hasEnglish = question.question_data?.options_eng;

                                    if (hasItalian && hasEnglish && question.question_type === 'multiple_choice') {
                                      // Get correct answer
                                      const answersData = typeof question.answers === 'string'
                                        ? JSON.parse(question.answers)
                                        : question.answers;
                                      const correctAnswer = Array.isArray(answersData?.correct_answer)
                                        ? answersData.correct_answer[0]
                                        : answersData?.correct_answer;

                                      if (correctAnswer) {
                                        // Show which option is correct (same for both languages)
                                        return (
                                          <span
                                            className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700"
                                            title={`Correct answer: ${correctAnswer.toUpperCase()} (same for IT & EN)`}
                                          >
                                            ✓ {correctAnswer.toUpperCase()}
                                          </span>
                                        );
                                      } else {
                                        // No correct answer defined
                                        return (
                                          <span
                                            className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700"
                                            title="No correct answer defined"
                                          >
                                            ⚠ No Answer
                                          </span>
                                        );
                                      }
                                    }
                                    return null;
                                  })()}
                                </h3>
                              {isFlagged && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                  FLAGGED
                                </span>
                              )}
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Mark as Reviewed Button */}
                                {question.review_info ? (
                                  <button
                                    onClick={() => markQuestionAsUnreviewed(question.id)}
                                    className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-xs font-semibold"
                                    title={`Reviewed by ${question.review_info.reviewed_by_email} on ${new Date(question.review_info.reviewed_at).toLocaleDateString()}`}
                                  >
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                                    Reviewed
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => markQuestionAsReviewed(question.id)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition-colors flex items-center gap-1 text-xs font-semibold"
                                    title="Mark this question as reviewed"
                                  >
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    Mark Reviewed
                                  </button>
                                )}
                                {/* Per-question language toggle */}
                                <button
                                  onClick={() => toggleQuestionLanguage(question.id)}
                                  className={`px-3 py-1 border-2 text-sm font-semibold rounded-lg hover:shadow-md transition-all ${
                                    getQuestionLanguage(question.id) === 'it'
                                      ? 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100'
                                      : 'bg-red-50 border-red-400 text-red-700 hover:bg-red-100'
                                  }`}
                                  title="Click to switch language for this question"
                                >
                                  {getQuestionLanguage(question.id) === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English'}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 ${
                                  question.question_type === 'multiple_choice'
                                    ? 'bg-green-100 text-green-700'
                                    : question.question_type === 'open_ended'
                                    ? 'bg-purple-100 text-purple-700'
                                    : question.question_type === 'data_insights'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                                title="Click to change question type"
                                onClick={async () => {
                                  const types = ['multiple_choice', 'open_ended'] as const;
                                  const currentIdx = types.indexOf(question.question_type as any);
                                  const newType = currentIdx >= 0 ? types[(currentIdx + 1) % types.length] : types[0];

                                  if (!confirm(`Change question type from "${question.question_type.replace('_', ' ')}" to "${newType.replace('_', ' ')}"?`)) return;

                                  try {
                                    const { error } = await supabase
                                      .from('2V_questions')
                                      .update({ question_type: newType })
                                      .eq('id', question.id);
                                    if (error) throw error;

                                    setQuestions(prev => prev.map(q =>
                                      q.id === question.id ? { ...q, question_type: newType } : q
                                    ));
                                  } catch (err) {
                                    console.error('Error changing question type:', err);
                                    alert('Failed to change question type');
                                  }
                                }}
                              >
                                {question.question_type === 'multiple_choice' ? 'Multiple Choice'
                                : question.question_type === 'open_ended' ? 'Open Ended'
                                : question.question_type === 'data_insights' ? 'Data Insights'
                                : 'PDF'}
                              </span>
                              {question.question_data?.page_number && (
                                <span className="text-xs text-gray-500">
                                  Page {question.question_data.page_number}
                                </span>
                              )}
                              {/* Manage Passage */}
                              <button
                                onClick={() => {
                                  setEditingPassageId(passageId || null);
                                  const linkedQuestions = questions.filter(q => q.question_data?.passage_id === passageId);
                                  setSelectedQuestionsForPassage(linkedQuestions.map(q => q.question_number));
                                  setNewPassageText(passage?.passage_text || '');
                                  setNewPassageTextEng(passage?.passage_text_eng || '');
                                  setPageRangeInput('');
                                  setShowPassageModal(true);
                                }}
                                className={`px-2 py-1 text-xs rounded ${
                                  passageId
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={passageId ? "Edit passage" : "Add passage"}
                              >
                                📖
                              </button>
                              {/* AI Check Single Question */}
                              <button
                                onClick={() => startAICheck('single', question.id)}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200"
                                title="AI Check this question"
                              >
                                <FontAwesomeIcon icon={faRobot} />
                              </button>
                              {/* Generate Graph - only show if question has an image */}
                              {question.question_data?.image_url && (
                                <button
                                  onClick={() => handleGenerateGraph(question.id)}
                                  disabled={generatingGraph === question.id}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 disabled:bg-gray-100"
                                  title="AI Generate Graph from image"
                                >
                                  {generatingGraph === question.id ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                  ) : (
                                    <FontAwesomeIcon icon={faMagic} />
                                  )}
                                </button>
                              )}
                              {/* Add/Change Image */}
                              <button
                                onClick={() => handleAddImage(question.id)}
                                className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200"
                                title={question.question_data?.image_url ? "Change Image" : "Add Image"}
                              >
                                <FontAwesomeIcon icon={faUpload} />
                              </button>
                              {/* Preview Test */}
                              <button
                                onClick={() => {
                                  navigate(`/preview-test/${selectedTest!.id}/${question.question_number}`);
                                }}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 font-semibold"
                                title="Preview this question in test mode"
                              >
                                <FontAwesomeIcon icon={faEye} /> Preview
                              </button>
                              {editingQuestionId === question.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveQuestion(question.id)}
                                    disabled={savingQuestion}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                                  >
                                    {savingQuestion ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={cancelEditingQuestion}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startEditingQuestion(question.id)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                  Edit
                                </button>
                              )}
                            </div>

                          {/* Question Content - Different rendering for Data Insights vs regular questions */}
                          <div className="bg-blue-50 p-4 rounded-lg mb-3 border border-blue-200 overflow-x-auto">
                            {question.question_data?.di_type ? (
                              /* Data Insights Question - Show editor if editing, otherwise preview */
                              editingQuestionId === question.id && localEditingQuestion ? (
                                <DataInsightsEditor
                                  questionData={localEditingQuestion.question_data}
                                  answers={localEditingQuestion.answers}
                                  onChange={(field, value) => handleEditQuestion(question.id, field, value)}
                                />
                              ) : (
                                <DataInsightsPreview
                                  questionData={question.question_data}
                                  answers={question.answers}
                                  showCorrectAnswer={true}
                                />
                              )
                            ) : editingQuestionId === question.id && localEditingQuestion ? (
                              <textarea
                                value={
                                  getQuestionLanguage(question.id) === 'en'
                                    ? (localEditingQuestion.question_data?.question_text_eng || '')
                                    : (localEditingQuestion.question_data?.question_text || '')
                                }
                                onChange={(e) => {
                                  const field = getQuestionLanguage(question.id) === 'en' ? 'question_text_eng' : 'question_text';
                                  handleEditQuestion(question.id, field, e.target.value);
                                }}
                                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[100px] font-mono text-sm"
                                placeholder="Enter question text (supports LaTeX)"
                              />
                            ) : (
                              <div className="overflow-x-auto">
                                <MathJaxRenderer>
                                  {normalizeWhitespace(getLocalizedText(question, 'question_text', 'question_text_eng') || 'No question text')}
                                </MathJaxRenderer>
                              </div>
                            )}

                            {/* Graph Recreation (if available) */}
                            {(question.question_data?.recreate_graph || question.question_data?.graph_function) && (
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-indigo-600 font-medium">AI Generated Graph</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        setRegenerateQuestionId(question.id);
                                        setRegenerateFeedback('');
                                        setShowRegenerateModal(true);
                                      }}
                                      disabled={generatingGraph === question.id}
                                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                                      title="Regenerate graph with feedback"
                                    >
                                      {generatingGraph === question.id ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                      ) : (
                                        <FontAwesomeIcon icon={faMagic} />
                                      )}
                                    </button>
                                    <button
                                      onClick={async () => {
                                        // Delete the generated graph
                                        const updatedData = { ...question.question_data };
                                        delete updatedData.recreate_graph;
                                        delete updatedData.graph_function;
                                        delete updatedData.graph_type;
                                        delete updatedData.graph_domain;
                                        delete updatedData.graph_range;
                                        delete updatedData.graph_analysis;

                                        await supabase
                                          .from('2V_questions')
                                          .update({ question_data: updatedData })
                                          .eq('id', question.id);

                                        setQuestions(prev => prev.map(q =>
                                          q.id === question.id
                                            ? { ...q, question_data: updatedData }
                                            : q
                                        ));
                                      }}
                                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                                      title="Delete generated graph (show original image)"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </div>
                                </div>
                                <AdvancedGraphRenderer
                                  question={{
                                    question_number: question.question_number,
                                    question_text: question.question_data.question_text,
                                    options: question.question_data.options,
                                    graph_function: question.question_data.graph_function,
                                    graph_type: question.question_data.graph_type,
                                    graph_domain: question.question_data.graph_domain,
                                    graph_range: question.question_data.graph_range,
                                  }}
                                  className="rounded-lg border-2 border-indigo-300"
                                />
                                {/* Show original image below for comparison */}
                                {(question.question_data?.image_url || question.question_data?.image_url_eng) && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-500">Original image:</span>
                                    <ImageWithFallback
                                      src={
                                        getQuestionLanguage(question.id) === 'en' && question.question_data.image_url_eng
                                          ? question.question_data.image_url_eng
                                          : question.question_data.image_url || question.question_data.image_url_eng
                                      }
                                      alt="Original"
                                      className="max-w-full max-h-32 mt-1 rounded border border-gray-300 opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Recharts recreation if present */}
                            {question.question_data?.recharts_code && (
                              <div className="mt-3">
                                <div className="mb-2 flex items-center gap-2 justify-between">
                                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                    🤖 Interactive Recharts Graph
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setRechartsCodeQuestionId(question.id);
                                        setEditingRechartsCode(question.question_data.recharts_code);
                                      }}
                                      className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                                    >
                                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                      Edit Code
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRechartsCode(question.id)}
                                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                      title="Remove Recharts and show static image"
                                    >
                                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                                <RechartsRenderer
                                  code={question.question_data.recharts_code}
                                  className="rounded-lg border-2 border-indigo-300 p-4 bg-white"
                                />
                                {/* Show original image below for comparison */}
                                {(question.question_data?.image_url || question.question_data?.image_url_eng) && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-500">Original extracted image:</span>
                                    <ImageWithFallback
                                      src={
                                        getQuestionLanguage(question.id) === 'en' && question.question_data.image_url_eng
                                          ? question.question_data.image_url_eng
                                          : question.question_data.image_url || question.question_data.image_url_eng
                                      }
                                      alt="Original"
                                      className="max-w-full max-h-32 mt-1 rounded border border-gray-300 opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Image if present (only show if no graph recreation and no recharts) */}
                            {(question.question_data?.image_url || question.question_data?.image_url_eng) && !question.question_data?.recreate_graph && !question.question_data?.recharts_code && (
                              <div className="mt-3 relative group">
                                <ImageWithFallback
                                  src={
                                    getQuestionLanguage(question.id) === 'en' && question.question_data.image_url_eng
                                      ? question.question_data.image_url_eng
                                      : question.question_data.image_url || question.question_data.image_url_eng
                                  }
                                  alt={`Question ${question.question_number}`}
                                  className="max-w-full rounded-lg border-2 border-indigo-300"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleAddImage(question.id)}
                                    className="px-3 py-1 bg-white/90 text-gray-700 text-xs rounded shadow cursor-pointer hover:bg-white"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Options / Answer */}
                          {question.question_type === 'open_ended' ? (
                            /* Open-Ended Answer */
                            <div className="mt-3 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                              <h4 className="text-sm font-semibold text-purple-900 mb-2">Answer:</h4>
                              {editingQuestionId === question.id && localEditingQuestion ? (
                                <textarea
                                  value={localEditingQuestion.answers?.correct_answer || ''}
                                  onChange={(e) => handleEditQuestion(question.id, 'correct_answer', e.target.value)}
                                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] font-mono text-sm"
                                  placeholder="Enter correct answer..."
                                />
                              ) : (
                                <div className="text-gray-800 font-medium">
                                  <MathJaxRenderer>{String(question.answers?.correct_answer || 'No answer provided')}</MathJaxRenderer>
                                </div>
                              )}
                            </div>
                          ) : localizedOptions && (
                            /* Multiple Choice Options */
                            <div className="space-y-2">
                              {editingQuestionId === question.id && localEditingQuestion && (
                                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <label className="block text-sm font-medium text-yellow-800 mb-2">
                                    Correct Answer:
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.keys(localEditingQuestion.question_data.options || {}).map((key) => (
                                      <button
                                        key={key}
                                        onClick={() => handleEditQuestion(question.id, 'correct_answer', key)}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                                          localEditingQuestion.answers?.correct_answer === key
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                      >
                                        {key.toUpperCase()}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {Object.entries(localizedOptions).map(([key, value]) => (
                                <div
                                  key={key}
                                  className={`flex items-start gap-2 p-2 rounded ${
                                    question.answers?.correct_answer === key
                                      ? 'bg-green-50 border-2 border-green-400'
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                                    question.answers?.correct_answer === key
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {key.toUpperCase()}
                                  </span>
                                  <div className="flex-1 relative">
                                    {(question.question_data?.image_options?.[key] || question.question_data?.image_options_eng?.[key]) ? (
                                      <div className="relative group">
                                        <ImageWithFallback
                                          src={
                                            getQuestionLanguage(question.id) === 'en' && question.question_data.image_options_eng?.[key]
                                              ? question.question_data.image_options_eng[key]
                                              : question.question_data.image_options?.[key] || question.question_data.image_options_eng?.[key]
                                          }
                                          alt={`Option ${key}`}
                                          className="max-w-full rounded"
                                        />
                                        {editingQuestionId === question.id && (
                                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() => handleAddImage(question.id, key)}
                                              className="px-3 py-1 bg-white/90 text-gray-700 text-xs rounded shadow cursor-pointer hover:bg-white"
                                            >
                                              Change
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ) : editingQuestionId === question.id && localEditingQuestion ? (
                                      <div className="flex gap-2 items-center">
                                        <input
                                          type="text"
                                          value={String(
                                            getQuestionLanguage(question.id) === 'en'
                                              ? (localEditingQuestion.question_data?.options_eng?.[key] || '')
                                              : (localEditingQuestion.question_data?.options?.[key] || '')
                                          )}
                                          onChange={(e) => {
                                            const isEnglish = getQuestionLanguage(question.id) === 'en';
                                            handleEditQuestion(question.id, `option_${key}_${isEnglish ? 'eng' : 'it'}`, e.target.value);
                                          }}
                                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-green focus:border-transparent font-mono text-sm"
                                          placeholder={`Option ${key.toUpperCase()}`}
                                        />
                                        <button
                                          onClick={() => handleAddImage(question.id, key)}
                                          className="px-3 py-2 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 whitespace-nowrap"
                                          title="Add image for this option"
                                        >
                                          <FontAwesomeIcon icon={faImage} className="mr-1" />
                                          Add Image
                                        </button>
                                      </div>
                                    ) : (
                                      <MathJaxRenderer>{String(value)}</MathJaxRenderer>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          </div>
                        </div>
                      );
                      });
                      })()}
                      {/* Bottom Pagination Controls */}
                      {(() => {
                        const filteredQuestions = questions.filter(q => {
                          if (sectionFilter !== 'all' && q.section !== sectionFilter) return false;
                          if (questionReviewedFilter === 'reviewed' && !q.review_info) return false;
                          if (questionReviewedFilter === 'unreviewed' && q.review_info) return false;
                          return true;
                        });
                        const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
                        if (totalPages > 1) {
                          return (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mt-4">
                              <span className="text-sm text-gray-600">
                                Showing {((questionsPage - 1) * QUESTIONS_PER_PAGE) + 1}-{Math.min(questionsPage * QUESTIONS_PER_PAGE, filteredQuestions.length)} of {filteredQuestions.length} questions
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setQuestionsPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                  disabled={questionsPage === 1}
                                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Previous
                                </button>
                                <span className="text-sm font-medium">
                                  Page {questionsPage} of {totalPages}
                                </span>
                                <button
                                  onClick={() => { setQuestionsPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                  disabled={questionsPage === totalPages}
                                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : viewMode === 'flaggedQuestions' ? (
              /* Flagged Questions List View */
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-orange-600 mb-6 flex items-center gap-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Flagged Questions for Review
                  <span className="text-sm font-normal text-gray-500">({flaggedQuestions.length} total)</span>
                </h2>

                {loadingFlagged ? (
                  <div className="flex items-center justify-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-gray-400 animate-spin" />
                  </div>
                ) : flaggedQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" />
                    <p className="text-xl text-gray-600">No flagged questions!</p>
                    <p className="text-sm text-gray-500 mt-2">All questions are good to go.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {flaggedQuestions.map((question: any) => {
                      // Find passage for this question if it has one
                      const passageId = question.question_data?.passage_id;
                      const passage = passageId ? passages.find(p => p.passage_id === passageId) : null;

                      return (
                        <FlaggedQuestionEditor
                          key={question.id}
                          question={question}
                          passage={passage}
                          onUpdate={loadFlaggedQuestions}
                          onClearFlag={(questionId) => {
                            setFlaggedQuestions(prev => prev.filter(q => q.id !== questionId));
                          }}
                          onGoToTest={(testId, questionNumber) => {
                            // Find the test
                            const test = tests.find(t => t.id === testId);
                            if (test) {
                              setSelectedTest(test);
                              setViewMode('entireTests');
                              // Scroll to question after a brief delay
                              setTimeout(() => {
                                const element = document.getElementById(`question-${questionNumber}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }, 500);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {/* AI Check Modal */}
            {showAICheckModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                  <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faRobot} className="text-purple-600" />
                    AI Check Options
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {aiCheckScope === 'single'
                      ? 'Check this question for issues'
                      : `Check all ${questions.length} questions for issues`}
                  </p>

                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What to check:
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="aiCheckType"
                        value="correctness"
                        checked={aiCheckType === 'correctness'}
                        onChange={() => setAICheckType('correctness')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <span className="font-medium">Correctness</span>
                        <p className="text-xs text-gray-500">Check questions and answers for errors</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="aiCheckType"
                        value="translation"
                        checked={aiCheckType === 'translation'}
                        onChange={() => setAICheckType('translation')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <span className="font-medium">Translations</span>
                        <p className="text-xs text-gray-500">Check for missing or incorrect translations</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="aiCheckType"
                        value="both"
                        checked={aiCheckType === 'both'}
                        onChange={() => setAICheckType('both')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <span className="font-medium">Both</span>
                        <p className="text-xs text-gray-500">Check everything</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowAICheckModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={runAICheck}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faRobot} />
                      Run Check
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Processing Modal */}
            {aiReviewing && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                  <FontAwesomeIcon icon={faRobot} className="text-6xl text-purple-600 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    AI is Analyzing Questions
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Claude is reviewing your questions for correctness, translations, and recreating graphs/images...
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-purple-600" />
                    <span className="text-purple-600 font-medium">Processing...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Applying Graph Modal */}
            {applyingGraph && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                  <FontAwesomeIcon icon={faChartLine} className="text-6xl text-indigo-600 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    Creating Graph
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Saving recreated graph to the question...
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-indigo-600" />
                    <span className="text-indigo-600 font-medium">Applying...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generating Graph Modal */}
            {generatingGraph && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                  <FontAwesomeIcon icon={faMagic} className="text-6xl text-indigo-600 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    AI Generating Graph
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Claude is analyzing the image and recreating the graph/diagram...
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-indigo-600" />
                    <span className="text-indigo-600 font-medium">Generating...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Regenerate Graph Modal with Feedback */}
            {showRegenerateModal && regenerateQuestionId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
                  <h3 className="text-xl font-bold text-brand-dark mb-4">
                    Regenerate Graph
                  </h3>

                  {/* Show current generated graph and original image */}
                  {(() => {
                    const question = questions.find(q => q.id === regenerateQuestionId);
                    if (!question) return null;
                    return (
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Current generated:</span>
                          <div className="bg-gray-50 p-2 rounded border h-32 flex items-center justify-center overflow-hidden">
                            {question.question_data?.graph_function ? (
                              <span className="text-xs text-gray-400">Graph</span>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Original image:</span>
                          {(question.question_data?.image_url || question.question_data?.image_url_eng) ? (
                            <ImageWithFallback
                              src={
                                getQuestionLanguage(question.id) === 'en' && question.question_data.image_url_eng
                                  ? question.question_data.image_url_eng
                                  : question.question_data.image_url || question.question_data.image_url_eng
                              }
                              alt="Original"
                              className="max-h-32 rounded border"
                            />
                          ) : (
                            <div className="bg-gray-50 p-2 rounded border h-32 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What should be improved?
                    </label>
                    <textarea
                      value={regenerateFeedback}
                      onChange={(e) => setRegenerateFeedback(e.target.value)}
                      placeholder="e.g., 'Label a/2 should be on left side of rectangle', 'Right angle marker in wrong corner', 'Triangle should be pointing up not down'"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowRegenerateModal(false);
                        setRegenerateQuestionId(null);
                        setRegenerateFeedback('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (regenerateQuestionId) {
                          handleGenerateGraph(regenerateQuestionId, regenerateFeedback || undefined);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faMagic} />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Passage Management Modal */}
            {showPassageModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-brand-dark">
                      {editingPassageId ? `Edit Passage: ${editingPassageId}` : 'Create New Passage'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowPassageModal(false);
                        setEditingPassageId(null);
                        setSelectedQuestionsForPassage([]);
                        setNewPassageText('');
                        setNewPassageTextEng('');
                        setNewPassageTitle('');
                        setNewPassageTitleEng('');
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* AI Detection */}
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      🤖 Let Claude Find the Passage
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pageRangeInput}
                        onChange={(e) => setPageRangeInput(e.target.value)}
                        placeholder="e.g., pages 13-16, questions 9-13"
                        className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        disabled={detectingPassage}
                      />
                      <button
                        onClick={async () => {
                          if (!selectedTest || !pageRangeInput) return;

                          setDetectingPassage(true);
                          try {
                            const { data: sessionData } = await supabase.auth.getSession();
                            const token = sessionData?.session?.access_token;

                            // Parse page range
                            const pageMatch = pageRangeInput.match(/pages?\s*(\d+)(?:\s*-\s*(\d+))?/i);
                            const questionMatch = pageRangeInput.match(/questions?\s*(\d+)(?:\s*-\s*(\d+))?/i);

                            const pageStart = pageMatch ? parseInt(pageMatch[1]) : undefined;
                            const pageEnd = pageMatch && pageMatch[2] ? parseInt(pageMatch[2]) : pageStart;

                            const questionStart = questionMatch ? parseInt(questionMatch[1]) : undefined;
                            const questionEnd = questionMatch && questionMatch[2] ? parseInt(questionMatch[2]) : questionStart;

                            // Get the PDF URL from the first question
                            const pdfUrl = questions[0]?.question_data?.pdf_url;
                            if (!pdfUrl) {
                              alert('No PDF URL found in questions');
                              return;
                            }

                            // Call API to extract just the passage
                            const response = await fetch(
                              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-questions-from-pdf`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  pdfUrl,
                                  testType: selectedTest.test_type,
                                  section: selectedTest.section,
                                  testNumber: selectedTest.test_number,
                                  pageStart,
                                  pageEnd,
                                  extractPassageOnly: true,
                                  targetQuestions: questionStart && questionEnd ?
                                    Array.from({length: questionEnd - questionStart + 1}, (_, i) => questionStart + i) :
                                    selectedQuestionsForPassage
                                }),
                              }
                            );

                            if (response.ok) {
                              const data = await response.json();
                              if (data.passages && data.passages.length > 0) {
                                setNewPassageText(data.passages[0].passage_text || '');

                                // Auto-select questions if Claude identified them
                                if (data.passages[0].question_numbers) {
                                  setSelectedQuestionsForPassage(data.passages[0].question_numbers);
                                }
                              } else if (data.extractedText) {
                                // Fallback: raw text extraction
                                setNewPassageText(data.extractedText);
                              }
                            }
                          } catch (error) {
                            console.error('Failed to detect passage:', error);
                          } finally {
                            setDetectingPassage(false);
                          }
                        }}
                        disabled={detectingPassage || !pageRangeInput}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 font-semibold flex items-center gap-2"
                      >
                        {detectingPassage ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faMagic} />
                            Detect
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Enter page numbers and/or question numbers where the passage appears
                    </p>
                  </div>

                  {/* Passage Title - Italian */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passage Title (Italian)
                    </label>
                    <input
                      type="text"
                      value={newPassageTitle || (editingPassageId ? passages.find(p => p.passage_id === editingPassageId)?.passage_title : '')}
                      onChange={(e) => setNewPassageTitle(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., Brano per le domande 1-3"
                    />
                  </div>

                  {/* Passage Title - English */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passage Title (English) - Optional
                    </label>
                    <input
                      type="text"
                      value={newPassageTitleEng || (editingPassageId ? passages.find(p => p.passage_id === editingPassageId)?.passage_title_eng : '')}
                      onChange={(e) => setNewPassageTitleEng(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., Passage for Questions 1-3"
                    />
                  </div>

                  {/* Passage Text - Italian */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Passage Text (Italian)
                      </label>
                      <span className="text-xs text-gray-500">
                        {(newPassageText || passages.find(p => p.passage_id === editingPassageId)?.passage_text || '').length} characters
                      </span>
                    </div>
                    <textarea
                      value={newPassageText || (editingPassageId ? passages.find(p => p.passage_id === editingPassageId)?.passage_text : '')}
                      onChange={(e) => setNewPassageText(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                      rows={6}
                      placeholder="Enter the shared passage text or use AI detection above..."
                      style={{ minHeight: '150px', maxHeight: '300px' }}
                    />
                  </div>

                  {/* Passage Text - English */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Passage Text (English) - Optional
                      </label>
                      <span className="text-xs text-gray-500">
                        {(newPassageTextEng || passages.find(p => p.passage_id === editingPassageId)?.passage_text_eng || '').length} characters
                      </span>
                    </div>
                    <textarea
                      value={newPassageTextEng || (editingPassageId ? passages.find(p => p.passage_id === editingPassageId)?.passage_text_eng : '')}
                      onChange={(e) => setNewPassageTextEng(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                      rows={6}
                      placeholder="Enter English translation of the passage (optional)"
                      style={{ minHeight: '150px', maxHeight: '300px' }}
                    />
                  </div>

                  {/* Select Questions */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign Questions to this Passage
                    </label>
                    <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                      {questions.map((q) => (
                        <button
                          key={q.question_number}
                          onClick={() => {
                            setSelectedQuestionsForPassage(prev =>
                              prev.includes(q.question_number)
                                ? prev.filter(n => n !== q.question_number)
                                : [...prev, q.question_number]
                            );
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            selectedQuestionsForPassage.includes(q.question_number)
                              ? 'bg-amber-500 text-white'
                              : q.question_data?.passage_id
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Q{q.question_number}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedQuestionsForPassage.length} questions
                      {selectedQuestionsForPassage.length > 0 && ` (${selectedQuestionsForPassage.sort((a,b) => a-b).join(', ')})`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowPassageModal(false);
                        setEditingPassageId(null);
                        setSelectedQuestionsForPassage([]);
                        setNewPassageText('');
                        setNewPassageTextEng('');
                        setNewPassageTitle('');
                        setNewPassageTitleEng('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const passageId = editingPassageId || `passage_${passages.length + 1}`;
                        const passageText = newPassageText || passages.find(p => p.passage_id === editingPassageId)?.passage_text || '';
                        const passageTextEng = newPassageTextEng || passages.find(p => p.passage_id === editingPassageId)?.passage_text_eng || '';
                        const passageTitle = newPassageTitle || passages.find(p => p.passage_id === editingPassageId)?.passage_title || `Passage ${passageId}`;
                        const passageTitleEng = newPassageTitleEng || passages.find(p => p.passage_id === editingPassageId)?.passage_title_eng || '';

                        // Update or create passage in local state
                        if (editingPassageId) {
                          setPassages(prev => prev.map(p =>
                            p.passage_id === editingPassageId
                              ? { ...p, passage_text: passageText, passage_text_eng: passageTextEng, passage_title: passageTitle, passage_title_eng: passageTitleEng, question_numbers: selectedQuestionsForPassage }
                              : p
                          ));
                        } else {
                          setPassages(prev => [...prev, {
                            passage_id: passageId,
                            passage_text: passageText,
                            passage_text_eng: passageTextEng,
                            passage_title: passageTitle,
                            passage_title_eng: passageTitleEng,
                            question_numbers: selectedQuestionsForPassage
                          }]);
                        }

                        // Update questions in database
                        try {
                          // Update questions that should have this passage
                          const questionsToUpdate = questions.filter(q => selectedQuestionsForPassage.includes(q.question_number));
                          for (const q of questionsToUpdate) {
                            const updatedData = {
                              ...q.question_data,
                              passage_id: passageId,
                              passage_text: passageText,
                              passage_text_eng: passageTextEng || null,
                              passage_title: passageTitle,
                              passage_title_eng: passageTitleEng || null
                            };

                            await supabase
                              .from('2V_questions')
                              .update({ question_data: updatedData })
                              .eq('id', q.id);
                          }

                          // Remove passage from questions that were previously linked but are no longer
                          if (editingPassageId) {
                            const questionsToUnlink = questions.filter(q =>
                              q.question_data?.passage_id === editingPassageId &&
                              !selectedQuestionsForPassage.includes(q.question_number)
                            );
                            for (const q of questionsToUnlink) {
                              const updatedData = { ...q.question_data };
                              delete updatedData.passage_id;
                              delete updatedData.passage_text;
                              delete updatedData.passage_text_eng;
                              delete updatedData.passage_title;
                              delete updatedData.passage_title_eng;

                              await supabase
                                .from('2V_questions')
                                .update({ question_data: updatedData })
                                .eq('id', q.id);
                            }
                          }

                          // Reload questions to reflect changes
                          await loadQuestions(selectedTest!.id);
                        } catch (err) {
                          console.error('Error updating passage:', err);
                          alert('Failed to save passage');
                        }

                        setShowPassageModal(false);
                        setEditingPassageId(null);
                        setSelectedQuestionsForPassage([]);
                        setNewPassageText('');
                        setNewPassageTextEng('');
                        setNewPassageTitle('');
                        setNewPassageTitleEng('');
                      }}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold"
                    >
                      {editingPassageId ? 'Update Passage' : 'Create Passage'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Image Management Modal (shows on right side, PDF visible on left) */}
            {showImageSourceModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-brand-dark">
                      {currentImageOptionKey
                        ? (questions.find(q => q.id === currentImageQuestionId)?.question_data?.image_options?.[currentImageOptionKey]
                            ? `Change Image for Option ${currentImageOptionKey.toUpperCase()}`
                            : `Add Image for Option ${currentImageOptionKey.toUpperCase()}`)
                        : (questions.find(q => q.id === currentImageQuestionId)?.question_data?.image_url
                            ? 'Change Image'
                            : 'Add Image')}
                    </h3>
                    <button
                      onClick={() => {
                        availableImages.forEach(img => URL.revokeObjectURL(img.url));
                        setAvailableImages([]);
                        setShowImageSourceModal(false);
                        setCurrentImageQuestionId(null);
                        setCurrentImageOptionKey(null);
                        setImageActionQuestionId(null);
                        setRecreateWithRecharts(false);
                        setRecreateWithPython(false);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Choice: Recreate Graph vs Extract Image */}
                  {!imageActionQuestionId && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Choose an action:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            console.log('🤖 User clicked Recreate Graph (AI)');
                            setRecreateWithRecharts(true);
                            setImageActionQuestionId(currentImageQuestionId);
                            console.log('  → Set recreateWithRecharts to true');
                          }}
                          className="p-6 border-2 border-indigo-300 rounded-xl hover:bg-indigo-50 hover:border-indigo-500 transition-all group"
                        >
                          <div className="text-4xl mb-3">🤖</div>
                          <h5 className="font-bold text-indigo-900 mb-2">Recreate Graph (AI)</h5>
                          <p className="text-sm text-gray-600">
                            Use Claude to analyze graph and generate Recharts code
                          </p>
                        </button>
                        <button
                          onClick={() => setImageActionQuestionId(currentImageQuestionId)}
                          className="p-6 border-2 border-orange-300 rounded-xl hover:bg-orange-50 hover:border-orange-500 transition-all group"
                        >
                          <div className="text-4xl mb-3">📄</div>
                          <h5 className="font-bold text-orange-900 mb-2">Extract from PDF</h5>
                          <p className="text-sm text-gray-600">
                            Extract professional-quality image directly from PDF
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Page Selector for PDF Extraction - Only show if image extraction chosen */}
                  {imageActionQuestionId && (
                    <>
                  {/* Page Selector for PDF Extraction */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                      {recreateWithRecharts
                        ? '🤖 Select graph from PDF to recreate with Recharts:'
                        : '📄 Extract from PDF - Select Page Number:'}
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="number"
                        min="1"
                        value={selectedPageForExtraction}
                        onChange={(e) => setSelectedPageForExtraction(parseInt(e.target.value) || 1)}
                        className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter page number"
                      />
                      <button
                        onClick={() => handleExtractFromPDF(selectedPageForExtraction)}
                        disabled={loadingImages || extractingImage}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold flex items-center gap-2"
                      >
                        {loadingImages || extractingImage ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            {extractingImage ? `Processing... ${imageExtractionProgress}%` : 'Extracting...'}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faImage} />
                            Extract Images
                          </>
                        )}
                      </button>
                    </div>

                    {/* Python Recreation Option - hide if recreating with Recharts */}
                    {!recreateWithRecharts && (
                      <label className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={recreateWithPython}
                          onChange={(e) => setRecreateWithPython(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-indigo-900">🐍 Recreate image with Python API</span>
                          <p className="text-xs text-indigo-700 mt-0.5">
                            Use Python script to professionally recreate the extracted image (higher quality, vector-based)
                          </p>
                        </div>
                      </label>
                    )}

                    {/* Recharts Recreation Info */}
                    {recreateWithRecharts && (
                      <div className="p-3 bg-indigo-50 border border-indigo-300 rounded-lg">
                        <span className="font-semibold text-indigo-900">🤖 Recharts Recreation Mode</span>
                        <p className="text-xs text-indigo-700 mt-0.5">
                          After selecting an image, Claude will analyze it and generate interactive Recharts code
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-blue-700 mt-2">
                      Current question is on page {questions.find(q => q.id === currentImageQuestionId)?.question_data?.page_number || '?'}
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-2">
                      🌐 Select Language Version
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Choose which language this image is for. If only one image is uploaded, it will be used for both languages automatically.
                    </p>
                    <div className="mb-3 p-2 bg-white rounded border border-blue-200">
                      <span className="text-xs font-bold text-blue-900">
                        Currently selected: {selectedImageLanguage === 'ita' ? '🇮🇹 ITALIAN' : '🇬🇧 ENGLISH'}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          console.log('🇮🇹 Switching to Italian');
                          setSelectedImageLanguage('ita');
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          selectedImageLanguage === 'ita'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        🇮🇹 Italian
                      </button>
                      <button
                        onClick={() => {
                          console.log('🇬🇧 Switching to English');
                          setSelectedImageLanguage('eng');
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          selectedImageLanguage === 'eng'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>

                    {/* Current status indicators */}
                    {currentImageQuestionId && (() => {
                      const question = questions.find(q => q.id === currentImageQuestionId);
                      if (!question) return null;

                      const hasItalianImage = currentImageOptionKey
                        ? !!question.question_data?.image_options?.[currentImageOptionKey]
                        : !!question.question_data?.image_url;

                      const hasEnglishImage = currentImageOptionKey
                        ? !!question.question_data?.image_options_eng?.[currentImageOptionKey]
                        : !!question.question_data?.image_url_eng;

                      if (hasItalianImage || hasEnglishImage) {
                        return (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs font-semibold text-blue-800 mb-1">Current status:</p>
                            <div className="flex gap-2">
                              {hasItalianImage && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  ✓ 🇮🇹 Italian uploaded
                                </span>
                              )}
                              {hasEnglishImage && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  ✓ 🇬🇧 English uploaded
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Direct Upload Option */}
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <label className="block text-sm font-semibold text-orange-900 mb-2">
                      📤 Or Upload Image File:
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-orange-300 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={faUpload} className="text-orange-700" />
                      <span className="font-medium text-orange-900">Choose File from Computer</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDirectUpload(file);
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {/* Extracted Images Grid */}
                  {availableImages.length > 0 ? (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">
                        Found {availableImages.length} image(s) - Click to select:
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {availableImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectImage(img.url)}
                            disabled={uploadingImage}
                            className="border-2 border-gray-300 rounded-lg overflow-hidden hover:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ImageWithFallback
                              src={img.url}
                              alt={`Extracted ${idx + 1}`}
                              className="w-full"
                            />
                            <div className="p-2 bg-gray-50 text-xs text-gray-600">
                              {img.width}×{img.height}px
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : loadingImages ? (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-indigo-600 mb-4" />
                      <p className="text-gray-600">Extracting images from page {selectedPageForExtraction}...</p>
                    </div>
                  ) : null}

                  {uploadingImage && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-green mr-2" />
                      <span className="text-sm text-green-700 font-medium">Uploading image...</span>
                    </div>
                  )}
                  </>
                  )}
                </div>
              </div>
            )}

            {/* AI Results Modal */}
            {showAIResultsModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                      <FontAwesomeIcon icon={faRobot} className="text-purple-600" />
                      AI Review Results
                    </h3>
                    <button
                      onClick={() => setShowAIResultsModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                  </div>

                  {aiReviewResults.length === 0 ? (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faCheck} className="text-4xl text-green-600 mb-3" />
                      <p className="text-lg font-medium text-green-700">All checks passed!</p>
                      <p className="text-gray-500">No issues found in the selected questions.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          {aiReviewResults.filter(r => r.isCorrect).length} correct
                        </span>
                        <span className="text-red-600 font-medium">
                          {aiReviewResults.filter(r => !r.isCorrect).length} with issues
                        </span>
                      </div>

                      {aiReviewResults.map((result) => (
                        <div key={result.questionId} className={`border-2 rounded-lg p-4 ${
                          result.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-brand-dark">
                              Question {result.questionNumber}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              result.isCorrect
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {result.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                            </span>
                          </div>

                          {/* Always show explanation */}
                          {result.explanation && (
                            <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1">AI Explanation:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.explanation}</p>
                            </div>
                          )}

                          {/* Graph Recreation Section */}
                          {result.graphRecreated && result.graphFunction && (
                            <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-indigo-700 flex items-center gap-1">
                                  <FontAwesomeIcon icon={faChartLine} />
                                  Graph Can Be Recreated
                                </p>
                                <button
                                  onClick={() => applyGraphRecreation(result)}
                                  disabled={applyingGraph === result.questionId}
                                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-1"
                                >
                                  {applyingGraph === result.questionId ? (
                                    <>
                                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                      Applying...
                                    </>
                                  ) : (
                                    <>
                                      <FontAwesomeIcon icon={faCheck} />
                                      Apply
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="text-xs space-y-1">
                                <p><strong>Type:</strong> {result.graphType}</p>
                                <p><strong>Function:</strong> <code className="bg-indigo-100 px-1 rounded">
                                  {typeof result.graphFunction === 'string'
                                    ? result.graphFunction
                                    : JSON.stringify(result.graphFunction)}
                                </code></p>
                                {result.graphAnalysis && (
                                  <p><strong>Analysis:</strong> {result.graphAnalysis}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Cannot Recreate Section */}
                          {result.graphRecreated === false && result.cannotRecreateReason && (
                            <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <p className="text-xs font-medium text-orange-700 flex items-center gap-1 mb-1">
                                <FontAwesomeIcon icon={faBan} />
                                Cannot Recreate Graph/Image
                              </p>
                              <p className="text-xs text-orange-600">{result.cannotRecreateReason}</p>
                            </div>
                          )}

                          {/* Show issues if any */}
                          {result.issues.length > 0 && (
                          <div className="space-y-3">
                            {result.issues.map((issue, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  issue.severity === 'error'
                                    ? 'bg-red-50 border-red-200'
                                    : issue.severity === 'warning'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-2">
                                    <FontAwesomeIcon
                                      icon={faExclamationTriangle}
                                      className={`mt-0.5 ${
                                        issue.severity === 'error'
                                          ? 'text-red-600'
                                          : issue.severity === 'warning'
                                          ? 'text-yellow-600'
                                          : 'text-blue-600'
                                      }`}
                                    />
                                    <div>
                                      <p className="font-medium text-sm">{issue.description}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        issue.type === 'correctness'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}>
                                        {issue.type}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => dismissAIIssue(result.questionId, issue.field || '')}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Dismiss"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </div>

                                {/* Show current vs suggested comparison */}
                                {(issue.currentValue || issue.suggestedValue) && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    {issue.currentValue && (
                                      <div className="mb-2">
                                        <p className="text-xs text-gray-500 mb-1">Current value:</p>
                                        <p className="text-sm bg-red-50 p-2 rounded border border-red-200 font-mono">
                                          {issue.currentValue}
                                        </p>
                                      </div>
                                    )}
                                    {issue.suggestedValue && (
                                      <div className="mb-2">
                                        <p className="text-xs text-gray-500 mb-1">Suggested fix:</p>
                                        <p className="text-sm bg-green-50 p-2 rounded border border-green-200 font-mono">
                                          {issue.suggestedValue}
                                        </p>
                                      </div>
                                    )}
                                    {/* Confidence indicator */}
                                    {issue.confidence !== undefined && (
                                      <div className="mb-2">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                          <span>AI Confidence:</span>
                                          <span className={`font-bold ${
                                            issue.confidence >= 80 ? 'text-green-600' :
                                            issue.confidence >= 50 ? 'text-yellow-600' : 'text-red-600'
                                          }`}>
                                            {issue.confidence}%
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full ${
                                              issue.confidence >= 80 ? 'bg-green-500' :
                                              issue.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${issue.confidence}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {issue.suggestedValue && (
                                      <button
                                        onClick={() => applyAISuggestion(result.questionId, issue.field || '', issue.suggestedValue || '')}
                                        className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                      >
                                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                        Apply Fix
                                      </button>
                                    )}
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

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowAIResultsModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Recharts Code Editor Modal */}
          {editingRechartsCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-brand-dark">Edit Recharts Code</h3>
                  <button
                    onClick={() => {
                      setEditingRechartsCode(null);
                      setRechartsCodeQuestionId(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Edit the Recharts component code below. The code will be saved and the graph will update.
                </p>

                <textarea
                  value={editingRechartsCode}
                  onChange={(e) => setEditingRechartsCode(e.target.value)}
                  className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="Recharts component code..."
                  spellCheck={false}
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setEditingRechartsCode(null);
                      setRechartsCodeQuestionId(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRechartsCode}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Save Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Answer Key Modal */}
          {showAnswerKeyModal && selectedTest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-brand-dark">
                    Answer Key - {selectedTest.test_name}
                  </h3>
                  <button
                    onClick={() => setShowAnswerKeyModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions.map((question) => {
                      let correctAnswerDisplay = '';

                      try {
                        const answersData = typeof question.answers === 'string'
                          ? JSON.parse(question.answers)
                          : question.answers;

                        if (question.question_type === 'multiple_choice') {
                          const correctAnswer = Array.isArray(answersData?.correct_answer)
                            ? answersData.correct_answer[0]
                            : answersData?.correct_answer;
                          correctAnswerDisplay = correctAnswer ? correctAnswer.toUpperCase() : 'N/A';
                        } else if (question.question_type === 'tpa') {
                          // TPA has two columns
                          if (answersData?.correct_answer) {
                            const tpaAnswer = answersData.correct_answer;
                            if (typeof tpaAnswer === 'object' && tpaAnswer.col1 && tpaAnswer.col2) {
                              correctAnswerDisplay = `Col1: ${tpaAnswer.col1}, Col2: ${tpaAnswer.col2}`;
                            } else {
                              correctAnswerDisplay = 'N/A';
                            }
                          } else {
                            correctAnswerDisplay = 'N/A';
                          }
                        } else if (question.question_type === 'msr') {
                          // MSR has multiple sub-questions
                          if (Array.isArray(answersData?.correct_answer)) {
                            correctAnswerDisplay = answersData.correct_answer
                              .map((ans: string, idx: number) => `${idx + 1}: ${ans.toUpperCase()}`)
                              .join(', ');
                          } else {
                            correctAnswerDisplay = 'N/A';
                          }
                        } else if (question.question_type === 'open_ended') {
                          correctAnswerDisplay = 'Open-ended';
                        } else {
                          correctAnswerDisplay = 'N/A';
                        }
                      } catch (error) {
                        console.error('Error parsing answer for question', question.id, error);
                        correctAnswerDisplay = 'Error';
                      }

                      return (
                        <div
                          key={question.id}
                          className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600">
                              Question {question.question_number}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {question.question_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-indigo-600">
                            {correctAnswerDisplay}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={downloadAnswerKeyPDF}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowAnswerKeyModal(false)}
                    className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </Layout>
    </MathJaxProvider>
  );
}
