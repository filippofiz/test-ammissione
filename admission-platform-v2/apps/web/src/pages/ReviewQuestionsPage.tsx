/**
 * Review Questions Page
 * Review and edit questions uploaded to the database
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider, MathJaxRenderer } from '../components/MathJaxRenderer';
import { AdvancedGraphRenderer } from '../components/GraphRenderer';
import { supabase } from '../lib/supabase';

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

  // Test list state
  const [tests, setTests] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'interactive' | 'mixed'>('all');
  const [reviewedFilter, setReviewedFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');
  const [flaggedFilter, setFlaggedFilter] = useState<'all' | 'flagged' | 'not_flagged'>('all');

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());

  // Actions
  const [markingReviewed, setMarkingReviewed] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = useState(false);

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

  // Image upload
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [generatingGraph, setGeneratingGraph] = useState<string | null>(null);

  // Applying graph recreation
  const [applyingGraph, setApplyingGraph] = useState<string | null>(null);

  // Regenerate graph with feedback
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateQuestionId, setRegenerateQuestionId] = useState<string | null>(null);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');

  // Per-question language override (null = use global viewLanguage)
  const [questionLanguageOverrides, setQuestionLanguageOverrides] = useState<Record<string, 'it' | 'en'>>({});

  // Get unique test types for filter
  const testTypes = [...new Set(tests.map(t => t.test_type))].sort();

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadQuestions(selectedTest.id);
    } else {
      setQuestions([]);
    }
  }, [selectedTest]);

  async function loadTests() {
    setLoadingTests(true);
    try {
      // Load tests with review_info
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('id, test_type, section, exercise_type, test_number, review_info')
        .order('test_type')
        .order('section')
        .order('test_number');

      if (testsError) throw testsError;

      // For each test, get question count, format, and flagged count
      const testsWithDetails = await Promise.all(
        (testsData || []).map(async (test) => {
          // Get questions for format detection
          const { data: questions } = await supabase
            .from('2V_questions')
            .select('id, question_type')
            .eq('test_id', test.id);

          let format: 'pdf' | 'interactive' | 'mixed' = 'pdf';
          if (questions && questions.length > 0) {
            const pdfCount = questions.filter(q => q.question_type === 'pdf').length;
            const interactiveCount = questions.filter(q => q.question_type === 'multiple_choice').length;

            if (pdfCount > 0 && interactiveCount > 0) {
              format = 'mixed';
            } else if (interactiveCount > 0) {
              format = 'interactive';
            }
          }

          // Get flagged answers count for this test's questions
          let flaggedCount = 0;
          if (questions && questions.length > 0) {
            const questionIds = questions.map(q => q.id);
            const { count } = await supabase
              .from('2V_student_answers')
              .select('*', { count: 'exact', head: true })
              .in('question_id', questionIds)
              .eq('is_flagged', true);
            flaggedCount = count || 0;
          }

          return {
            ...test,
            question_count: questions?.length || 0,
            format,
            flagged_count: flaggedCount,
          };
        })
      );

      setTests(testsWithDetails);
    } catch (err) {
      console.error('Error loading tests:', err);
    } finally {
      setLoadingTests(false);
    }
  }

  async function loadQuestions(testId: string) {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from('2V_questions')
        .select('*')
        .eq('test_id', testId)
        .order('question_number');

      if (error) throw error;
      setQuestions(data || []);

      // Get flagged question IDs
      if (data && data.length > 0) {
        const questionIds = data.map(q => q.id);
        const { data: flaggedAnswers } = await supabase
          .from('2V_student_answers')
          .select('question_id')
          .in('question_id', questionIds)
          .eq('is_flagged', true);

        const flaggedIds = new Set(flaggedAnswers?.map(a => a.question_id) || []);
        setFlaggedQuestionIds(flaggedIds);
      } else {
        setFlaggedQuestionIds(new Set());
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoadingQuestions(false);
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

  // Edit question handlers
  const handleEditQuestion = (questionId: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;

      const updated = { ...q };

      if (field === 'question_text') {
        updated.question_data = { ...updated.question_data, question_text: value };
      } else if (field === 'correct_answer') {
        updated.answers = { ...updated.answers, correct_answer: value };
      } else if (field.startsWith('option_')) {
        const optionKey = field.replace('option_', '');
        updated.question_data = {
          ...updated.question_data,
          options: { ...updated.question_data.options, [optionKey]: value }
        };
      }

      return updated;
    }));
  };

  const handleSaveQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
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

  // Filter tests
  const filteredTests = tests.filter(test => {
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

    // Track filter
    if (trackFilter !== 'all' && test.test_type !== trackFilter) return false;

    // Format filter
    if (formatFilter !== 'all' && test.format !== formatFilter) return false;

    // Reviewed filter
    if (reviewedFilter === 'reviewed' && !test.review_info) return false;
    if (reviewedFilter === 'unreviewed' && test.review_info) return false;

    // Flagged filter
    if (flaggedFilter === 'flagged' && (test.flagged_count || 0) === 0) return false;
    if (flaggedFilter === 'not_flagged' && (test.flagged_count || 0) > 0) return false;

    return true;
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

            {!selectedTest ? (
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

                    {/* Track Filter */}
                    <select
                      value={trackFilter}
                      onChange={(e) => setTrackFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green bg-white"
                    >
                      <option value="all">All Tracks</option>
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
                ) : filteredTests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No tests found</p>
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
            ) : (
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
                        Questions ({questions.length})
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

                    {/* Language Toggle and AI Check */}
                    <div className="flex items-center justify-between">
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
                      {questions.map((question) => {
                        const isFlagged = flaggedQuestionIds.has(question.id);
                        const localizedOptions = getLocalizedOptions(question);

                        return (
                        <div
                          key={question.id}
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
                              </h3>
                              {isFlagged && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                  FLAGGED
                                </span>
                              )}
                              {/* Per-question language toggle */}
                              <button
                                onClick={() => toggleQuestionLanguage(question.id)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                                title="Toggle language for this question"
                              >
                                {getQuestionLanguage(question.id) === 'it' ? '🇮🇹' : '🇬🇧'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-1 rounded ${
                                question.question_type === 'multiple_choice'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {question.question_type === 'multiple_choice' ? 'Interactive' : 'PDF'}
                              </span>
                              {question.question_data?.page_number && (
                                <span className="text-xs text-gray-500">
                                  Page {question.question_data.page_number}
                                </span>
                              )}
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
                              {/* Upload Image */}
                              <label
                                className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 cursor-pointer"
                                title="Upload/Change Image"
                              >
                                {uploadingImage === question.id ? (
                                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                  <FontAwesomeIcon icon={faUpload} />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(question.id, file);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
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
                                    onClick={() => setEditingQuestionId(null)}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setEditingQuestionId(question.id)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Question Text */}
                          <div className="bg-blue-50 p-4 rounded-lg mb-3 border border-blue-200">
                            {editingQuestionId === question.id ? (
                              <textarea
                                value={question.question_data?.question_text || ''}
                                onChange={(e) => handleEditQuestion(question.id, 'question_text', e.target.value)}
                                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[100px] font-mono text-sm"
                                placeholder="Enter question text (supports LaTeX)"
                              />
                            ) : (
                              <MathJaxRenderer>
                                {getLocalizedText(question, 'question_text', 'question_text_eng') || 'No question text'}
                              </MathJaxRenderer>
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
                                {question.question_data?.image_url && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-500">Original image:</span>
                                    <img
                                      src={question.question_data.image_url}
                                      alt="Original"
                                      className="max-w-full max-h-32 mt-1 rounded border border-gray-300 opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Image if present (only show if no graph recreation) */}
                            {question.question_data?.image_url && !question.question_data?.recreate_graph && (
                              <div className="mt-3 relative group">
                                <img
                                  src={question.question_data.image_url}
                                  alt={`Question ${question.question_number}`}
                                  className="max-w-full rounded-lg border-2 border-indigo-300"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <label className="px-3 py-1 bg-white/90 text-gray-700 text-xs rounded shadow cursor-pointer hover:bg-white">
                                    Change
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(question.id, file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Options */}
                          {localizedOptions && (
                            <div className="space-y-2">
                              {editingQuestionId === question.id && (
                                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <label className="block text-sm font-medium text-yellow-800 mb-2">
                                    Correct Answer:
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.keys(question.question_data.options || {}).map((key) => (
                                      <button
                                        key={key}
                                        onClick={() => handleEditQuestion(question.id, 'correct_answer', key)}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                                          question.answers?.correct_answer === key
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
                                  <div className="flex-1">
                                    {question.question_data?.image_options?.[key] ? (
                                      <img
                                        src={question.question_data.image_options[key]}
                                        alt={`Option ${key}`}
                                        className="max-w-full rounded"
                                      />
                                    ) : editingQuestionId === question.id ? (
                                      <input
                                        type="text"
                                        value={String(question.question_data?.options?.[key] || '')}
                                        onChange={(e) => handleEditQuestion(question.id, `option_${key}`, e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-green focus:border-transparent font-mono text-sm"
                                        placeholder={`Option ${key.toUpperCase()}`}
                                      />
                                    ) : (
                                      <MathJaxRenderer>{String(value)}</MathJaxRenderer>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          {question.question_data?.image_url ? (
                            <img
                              src={question.question_data.image_url}
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
          </div>
        </div>
      </Layout>
    </MathJaxProvider>
  );
}
