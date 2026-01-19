/**
 * GMAT Question Allocation Page
 * Allows admins to allocate questions from the question pool to specific training/assessments
 *
 * Structure (from GMAT program documentation):
 * - 3 Sections: QR (5 topics), DI (5 topics), VR (2 topics)
 * - 3 Cycles: Foundation (505-605), Development (605-665), Excellence (665-715+)
 * - Material types per topic: Training 1, Training 2, Assessment
 * - Each cycle has different difficulty distributions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBook,
  faChevronDown,
  faChevronRight,
  faCheck,
  faPlus,
  faMinus,
  faSearch,
  faExclamationTriangle,
  faCheckCircle,
  faQuestionCircle,
  faSave,
  faEye,
  faFileAlt,
  faTimes,
  faEdit,
  faClipboardList,
  faChartBar,
  faSpinner,
  faLayerGroup,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// ============================================
// GMAT PROGRAM STRUCTURE (from documentation)
// ============================================

// 3 Cycles (from cycle-definitions.md)
const GMAT_CYCLES = ['Foundation', 'Development', 'Excellence'] as const;
type GmatCycle = typeof GMAT_CYCLES[number];

// Sections and their topics (from curriculum-overview.md)
const GMAT_STRUCTURE = {
  'Quantitative Reasoning': {
    code: 'QR',
    topics: [
      { id: '01-number-properties-arithmetic', name: 'Number Properties & Arithmetic' },
      { id: '02-algebra', name: 'Algebra' },
      { id: '03-word-problems', name: 'Word Problems' },
      { id: '04-statistics-probability', name: 'Statistics & Probability' },
      { id: '05-percents-ratios-proportions', name: 'Percents, Ratios & Proportions' },
    ],
  },
  'Data Insights': {
    code: 'DI',
    topics: [
      { id: '01-data-sufficiency', name: 'Data Sufficiency', diType: 'DS' },
      { id: '02-graphics-interpretation', name: 'Graphics Interpretation', diType: 'GI' },
      { id: '03-table-analysis', name: 'Table Analysis', diType: 'TA' },
      { id: '04-two-part-analysis', name: 'Two-Part Analysis', diType: 'TPA' },
      { id: '05-multi-source-reasoning', name: 'Multi-Source Reasoning', diType: 'MSR' },
    ],
  },
  'Verbal Reasoning': {
    code: 'VR',
    topics: [
      { id: '01-critical-reasoning', name: 'Critical Reasoning' },
      { id: '02-reading-comprehension', name: 'Reading Comprehension' },
    ],
  },
} as const;

type SectionName = keyof typeof GMAT_STRUCTURE;

// Material types per topic
const MATERIAL_TYPES = ['training1', 'training2', 'assessment'] as const;
type MaterialType = typeof MATERIAL_TYPES[number];

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  training1: 'Training 1',
  training2: 'Training 2',
  assessment: 'Topic Assessment',
};

// Difficulty distributions by cycle (from question-allocation.md)
const DIFFICULTY_DISTRIBUTIONS: Record<GmatCycle, { easy: number; medium: number; hard: number }> = {
  Foundation: { easy: 60, medium: 30, hard: 10 },
  Development: { easy: 25, medium: 50, hard: 25 },
  Excellence: { easy: 5, medium: 30, hard: 65 },
};

// Question counts by section and material type (from question-allocation.md)
const QUESTION_COUNTS: Record<string, Record<MaterialType, number>> = {
  // QR topics
  'QR-training': { training1: 18, training2: 18, assessment: 20 },
  // DI topics
  'DI-DS': { training1: 14, training2: 14, assessment: 20 },
  'DI-GI': { training1: 14, training2: 14, assessment: 20 },
  'DI-TA': { training1: 10, training2: 10, assessment: 20 },
  'DI-TPA': { training1: 10, training2: 10, assessment: 20 },
  'DI-MSR': { training1: 8, training2: 8, assessment: 8 }, // MSR counts are sets
  // VR topics
  'VR-CR': { training1: 16, training2: 16, assessment: 20 },
  'VR-RC': { training1: 16, training2: 16, assessment: 20 }, // RC uses passages
};

// Cycle colors
const CYCLE_COLORS: Record<GmatCycle, { bg: string; text: string; border: string; gradient: string }> = {
  Foundation: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', gradient: 'from-blue-500 to-blue-600' },
  Development: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', gradient: 'from-green-500 to-green-600' },
  Excellence: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', gradient: 'from-purple-500 to-purple-600' },
};

// Difficulty colors
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

// ============================================
// INTERFACES
// ============================================

interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

interface Category {
  name: string;
  count: string;
  subtopics?: string[];
}

interface QuestionRequirements {
  total_questions: number;
  time_limit_minutes?: number;
  difficulty_distribution: {
    [cycle in GmatCycle]: DifficultyDistribution;
  };
  categories?: Category[];
}

interface CycleAllocation {
  allocated_questions: string[];
  allocated_at: string | null;
}

interface QuestionAllocation {
  by_cycle: {
    [cycle in GmatCycle]?: CycleAllocation;
  };
}

interface LessonMaterial {
  id: string;
  section: string;
  topic: string;
  material_type: string;
  title: string;
  pdf_storage_path: string;
  is_template: boolean;
  question_allocation: QuestionAllocation | null;
  question_requirements: QuestionRequirements | null;
}

interface Question {
  id: string;
  test_id: string;
  question_number: number;
  question_type: string;
  section: string;
  materia: string | null;
  difficulty: string | null;
  question_data: any;
  answers: any;
  is_active: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function GMATQuestionAllocationPage() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selection state
  const [selectedSection, setSelectedSection] = useState<SectionName>('Data Insights');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('01-data-sufficiency');
  const [selectedMaterialType, setSelectedMaterialType] = useState<MaterialType>('training1');
  const [selectedCycle, setSelectedCycle] = useState<GmatCycle>('Development');

  // Templates (question allocation PDFs)
  const [templates, setTemplates] = useState<LessonMaterial[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LessonMaterial | null>(null);

  // Question pool
  const [poolQuestions, setPoolQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  // Allocated questions for selected template and cycle
  const [allocatedQuestionIds, setAllocatedQuestionIds] = useState<Set<string>>(new Set());

  // All allocations for all cycles (for the current template)
  const [cycleAllocations, setCycleAllocations] = useState<Record<GmatCycle, Set<string>>>({
    Foundation: new Set(),
    Development: new Set(),
    Excellence: new Set(),
  });

  // All used question IDs (across all templates and cycles) for tracking
  const [usedQuestionIds, setUsedQuestionIds] = useState<Map<string, { template: string; cycle: GmatCycle }>>(new Map());

  // Requirements form
  const [requirementsForm, setRequirementsForm] = useState<QuestionRequirements | null>(null);
  const [editingRequirements, setEditingRequirements] = useState(false);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // UI State
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Data Insights']));
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [previewingQuestion, setPreviewingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Find matching template when selection changes
  useEffect(() => {
    findMatchingTemplate();
  }, [selectedSection, selectedTopicId, selectedMaterialType, templates]);

  // Apply filters when questions or filters change
  useEffect(() => {
    applyFilters();
  }, [poolQuestions, difficultyFilter, searchQuery, selectedSection, selectedTopicId]);

  // Update allocated questions when cycle changes
  useEffect(() => {
    setAllocatedQuestionIds(cycleAllocations[selectedCycle]);
  }, [selectedCycle, cycleAllocations]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // 1. Load question templates (is_template = true)
      const { data: templatesData, error: templatesError } = await supabase
        .from('2V_lesson_materials')
        .select('*')
        .eq('test_type', 'GMAT')
        .eq('is_template', true)
        .eq('is_active', true)
        .order('section')
        .order('topic');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // 2. Find the GMAT Question Pool test
      const { data: poolTest, error: poolError } = await supabase
        .from('2V_tests')
        .select('id')
        .eq('test_type', 'GMAT')
        .eq('section', 'Question Pool')
        .single();

      if (poolError) {
        console.warn('No GMAT Question Pool found:', poolError);
      } else if (poolTest) {
        // 3. Load all questions from the pool (with pagination to avoid 1000 row limit)
        let allQuestions: any[] = [];
        const batchSize = 1000;
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          const { data: questionBatch, error: questionsError } = await supabase
            .from('2V_questions')
            .select('*')
            .eq('test_id', poolTest.id)
            .eq('is_active', true)
            .order('section')
            .order('question_number')
            .range(from, from + batchSize - 1);

          if (questionsError) throw questionsError;

          if (questionBatch && questionBatch.length > 0) {
            allQuestions = [...allQuestions, ...questionBatch];
            from += batchSize;
            hasMore = questionBatch.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        setPoolQuestions(allQuestions);
      }

      // 4. Build map of all used question IDs from templates (per cycle)
      const allUsedIds = new Map<string, { template: string; cycle: GmatCycle }>();
      (templatesData || []).forEach(template => {
        const allocation = template.question_allocation;
        if (allocation?.by_cycle) {
          GMAT_CYCLES.forEach(cycle => {
            const cycleAlloc = allocation.by_cycle[cycle];
            if (cycleAlloc?.allocated_questions) {
              cycleAlloc.allocated_questions.forEach((id: string) => {
                allUsedIds.set(`${id}-${cycle}`, { template: template.id, cycle });
              });
            }
          });
        }
      });
      setUsedQuestionIds(allUsedIds);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function findMatchingTemplate() {
    const sectionConfig = GMAT_STRUCTURE[selectedSection];
    const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);
    if (!topic) return;

    // Find template matching section, topic, and material type
    const matchingTemplate = templates.find(t => {
      const sectionMatch = t.section === selectedSection ||
                          t.section.includes(sectionConfig.code) ||
                          selectedSection.includes(t.section);
      const topicMatch = t.topic.toLowerCase().includes(topic.name.toLowerCase()) ||
                        topic.name.toLowerCase().includes(t.topic.toLowerCase()) ||
                        t.pdf_storage_path.includes(selectedTopicId);
      const materialMatch = t.material_type.includes(selectedMaterialType) ||
                           t.title.toLowerCase().includes(MATERIAL_TYPE_LABELS[selectedMaterialType].toLowerCase()) ||
                           t.pdf_storage_path.includes(`question-template-${selectedMaterialType}`);

      return sectionMatch && topicMatch && materialMatch;
    });

    if (matchingTemplate) {
      selectTemplate(matchingTemplate);
    } else {
      // Create default requirements if no template found
      setSelectedTemplate(null);
      setRequirementsForm(getDefaultRequirements());
      setCycleAllocations({
        Foundation: new Set(),
        Development: new Set(),
        Excellence: new Set(),
      });
    }
  }

  function getDefaultRequirements(): QuestionRequirements {
    const sectionConfig = GMAT_STRUCTURE[selectedSection];
    const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);

    // Determine question count key
    let countKey = `${sectionConfig.code}-training`;
    if (selectedSection === 'Data Insights' && topic && 'diType' in topic) {
      countKey = `DI-${topic.diType}`;
    } else if (selectedSection === 'Verbal Reasoning') {
      countKey = topic?.id.includes('critical') ? 'VR-CR' : 'VR-RC';
    }

    const counts = QUESTION_COUNTS[countKey] || QUESTION_COUNTS['QR-training'];
    const totalQuestions = counts[selectedMaterialType];

    // Calculate per-cycle counts based on difficulty distribution
    const difficultyDistribution: Record<GmatCycle, DifficultyDistribution> = {
      Foundation: {
        easy: Math.round(totalQuestions * 0.60),
        medium: Math.round(totalQuestions * 0.30),
        hard: Math.round(totalQuestions * 0.10),
      },
      Development: {
        easy: Math.round(totalQuestions * 0.25),
        medium: Math.round(totalQuestions * 0.50),
        hard: Math.round(totalQuestions * 0.25),
      },
      Excellence: {
        easy: Math.round(totalQuestions * 0.05),
        medium: Math.round(totalQuestions * 0.30),
        hard: Math.round(totalQuestions * 0.65),
      },
    };

    return {
      total_questions: totalQuestions,
      time_limit_minutes: selectedMaterialType === 'assessment' ? 45 : 35,
      difficulty_distribution: difficultyDistribution,
    };
  }

  function applyFilters() {
    let filtered = [...poolQuestions];

    // Filter by section
    const sectionConfig = GMAT_STRUCTURE[selectedSection];
    filtered = filtered.filter(q => {
      const qSection = q.section.toLowerCase();
      return qSection.includes(selectedSection.toLowerCase()) ||
             qSection.includes(sectionConfig.code.toLowerCase());
    });

    // Filter by topic/DI type for Data Insights
    if (selectedSection === 'Data Insights') {
      const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);
      if (topic && 'diType' in topic) {
        filtered = filtered.filter(q => {
          return q.question_data?.di_type === topic.diType;
        });
      }
    }

    // Filter by difficulty
    if (difficultyFilter) {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => {
        const questionText = q.question_data?.question_text || '';
        const stem = q.question_data?.stem || q.question_data?.problem || '';
        return questionText.toLowerCase().includes(query) ||
               stem.toLowerCase().includes(query) ||
               String(q.question_number).includes(query);
      });
    }

    setFilteredQuestions(filtered);
  }

  function selectTemplate(template: LessonMaterial) {
    setSelectedTemplate(template);

    // Load requirements
    if (template.question_requirements) {
      setRequirementsForm(template.question_requirements);
    } else {
      setRequirementsForm(getDefaultRequirements());
    }

    // Load allocations for all cycles
    const newCycleAllocations: Record<GmatCycle, Set<string>> = {
      Foundation: new Set(),
      Development: new Set(),
      Excellence: new Set(),
    };

    const allocation = template.question_allocation;
    if (allocation?.by_cycle) {
      GMAT_CYCLES.forEach(cycle => {
        const cycleAlloc = allocation.by_cycle[cycle];
        if (cycleAlloc?.allocated_questions) {
          newCycleAllocations[cycle] = new Set(cycleAlloc.allocated_questions);
        }
      });
    }

    setCycleAllocations(newCycleAllocations);
    setAllocatedQuestionIds(newCycleAllocations[selectedCycle]);
  }

  function toggleQuestionAllocation(questionId: string) {
    const newAllocated = new Set(allocatedQuestionIds);
    if (newAllocated.has(questionId)) {
      newAllocated.delete(questionId);
    } else {
      newAllocated.add(questionId);
    }
    setAllocatedQuestionIds(newAllocated);

    // Update cycle allocations
    setCycleAllocations(prev => ({
      ...prev,
      [selectedCycle]: newAllocated,
    }));
  }

  async function saveAllocation() {
    if (!selectedTemplate && !requirementsForm) return;

    setSaving(true);
    setError(null);

    try {
      const allocation: QuestionAllocation = {
        by_cycle: {
          Foundation: {
            allocated_questions: Array.from(cycleAllocations.Foundation),
            allocated_at: new Date().toISOString(),
          },
          Development: {
            allocated_questions: Array.from(cycleAllocations.Development),
            allocated_at: new Date().toISOString(),
          },
          Excellence: {
            allocated_questions: Array.from(cycleAllocations.Excellence),
            allocated_at: new Date().toISOString(),
          },
        },
      };

      if (selectedTemplate) {
        const { error: updateError } = await supabase
          .from('2V_lesson_materials')
          .update({
            question_allocation: allocation,
            question_requirements: requirementsForm,
          })
          .eq('id', selectedTemplate.id);

        if (updateError) throw updateError;

        // Update local state
        setTemplates(prev => prev.map(t =>
          t.id === selectedTemplate.id
            ? { ...t, question_allocation: allocation, question_requirements: requirementsForm }
            : t
        ));

        setSelectedTemplate(prev => prev ? {
          ...prev,
          question_allocation: allocation,
          question_requirements: requirementsForm,
        } : null);
      }

      // Rebuild used question IDs
      await loadData();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save allocation');
    } finally {
      setSaving(false);
    }
  }

  async function viewTemplatePdf(template: LessonMaterial) {
    try {
      const { data, error } = await supabase.storage
        .from('gmat-materials')
        .createSignedUrl(template.pdf_storage_path, 3600);

      if (error) throw error;
      if (data) {
        setViewingPdf({ url: data.signedUrl, title: template.title });
      }
    } catch (err) {
      console.error('Error loading PDF:', err);
    }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  // Get allocation stats for current cycle
  function getAllocationStats() {
    const allocated = Array.from(allocatedQuestionIds)
      .map(id => poolQuestions.find(q => q.id === id))
      .filter(Boolean) as Question[];

    const byDifficulty = {
      easy: allocated.filter(q => q.difficulty === 'easy').length,
      medium: allocated.filter(q => q.difficulty === 'medium').length,
      hard: allocated.filter(q => q.difficulty === 'hard').length,
      unset: allocated.filter(q => !q.difficulty).length,
    };

    return { total: allocated.length, byDifficulty };
  }

  // Get required counts for current cycle
  function getRequiredCounts(): DifficultyDistribution | null {
    if (!requirementsForm?.difficulty_distribution) return null;
    return requirementsForm.difficulty_distribution[selectedCycle];
  }

  // Check if a question is used in another template/cycle
  function getQuestionUsage(questionId: string): { template: string; cycle: GmatCycle } | null {
    const key = `${questionId}-${selectedCycle}`;
    const usage = usedQuestionIds.get(key);
    if (usage && usage.template !== selectedTemplate?.id) {
      return usage;
    }
    return null;
  }

  // Render question content with LaTeX support
  function renderQuestionContent(question: Question) {
    const data = question.question_data;

    if (question.question_type === 'data_insights') {
      return renderDataInsightsQuestion(question);
    }

    if (question.question_type === 'multiple_choice') {
      return renderMultipleChoiceQuestion(question);
    }

    return (
      <div className="text-gray-600">
        <p>{data?.question_text || data?.stem || 'No content available'}</p>
      </div>
    );
  }

  function renderDataInsightsQuestion(question: Question) {
    const data = question.question_data;
    const diType = data?.di_type;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
            {diType}
          </span>
          {question.difficulty && (
            <span className={`px-2 py-1 rounded text-sm font-medium ${DIFFICULTY_COLORS[question.difficulty]?.bg} ${DIFFICULTY_COLORS[question.difficulty]?.text}`}>
              {question.difficulty}
            </span>
          )}
        </div>

        {/* DS Question */}
        {diType === 'DS' && (
          <>
            {data?.problem && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Problem:</h4>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {renderTextWithLatex(data.problem)}
                </div>
              </div>
            )}
            {data?.statement1 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Statements:</h4>
                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded">
                  <span className="font-bold text-blue-700">(1)</span>
                  <span>{renderTextWithLatex(data.statement1)}</span>
                </div>
                {data?.statement2 && (
                  <div className="flex items-start gap-2 bg-blue-50 p-3 rounded">
                    <span className="font-bold text-blue-700">(2)</span>
                    <span>{renderTextWithLatex(data.statement2)}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* GI Question */}
        {diType === 'GI' && (
          <>
            {data?.context_text && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Context:</h4>
                <div className="prose prose-sm max-w-none">
                  {renderTextWithLatex(data.context_text)}
                </div>
              </div>
            )}
            {data?.statement_text && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Statement:</h4>
                <p>{renderTextWithLatex(data.statement_text)}</p>
              </div>
            )}
          </>
        )}

        {/* TA Question */}
        {diType === 'TA' && data?.table_title && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">{data.table_title}</h4>
            {data.stimulus_text && <p className="text-sm text-gray-600 mb-2">{data.stimulus_text}</p>}
          </div>
        )}

        {/* TPA Question */}
        {diType === 'TPA' && data?.scenario && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Scenario:</h4>
            <div className="prose prose-sm max-w-none">
              {renderTextWithLatex(data.scenario)}
            </div>
          </div>
        )}

        {/* MSR Question */}
        {diType === 'MSR' && data?.sources && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Sources:</h4>
            {data.sources.map((source: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                <span className="font-medium text-blue-700">{source.tab_name}:</span>
                <span className="ml-2 text-sm text-gray-600">
                  {source.content_type === 'text' ? 'Text content' : 'Table data'}
                </span>
              </div>
            ))}
          </div>
        )}

        {question.answers?.correct_answer && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <span className="font-semibold text-green-700">Correct Answer: </span>
            <span className="text-green-800">{JSON.stringify(question.answers.correct_answer)}</span>
          </div>
        )}
      </div>
    );
  }

  function renderMultipleChoiceQuestion(question: Question) {
    const data = question.question_data;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Question:</h4>
          <div className="prose prose-sm max-w-none">
            {renderTextWithLatex(data?.question_text || '')}
          </div>
        </div>

        {data?.options && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Options:</h4>
            {Object.entries(data.options).map(([key, value]) => {
              const isCorrect = question.answers?.correct_answer?.toLowerCase() === key.toLowerCase();
              return (
                <div
                  key={key}
                  className={`flex items-start gap-2 p-2 border rounded ${
                    isCorrect ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-bold uppercase ${isCorrect ? 'text-green-700' : 'text-gray-500'}`}>
                    {key}.
                  </span>
                  <span>{renderTextWithLatex(String(value))}</span>
                  {isCorrect && <FontAwesomeIcon icon={faCheck} className="text-green-600 ml-auto" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderTextWithLatex(text: string) {
    if (!text) return null;

    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]+\$)/g);

    return (
      <span>
        {parts.map((part, idx) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const latex = part.slice(2, -2);
            try {
              return <BlockMath key={idx} math={latex} />;
            } catch {
              return <code key={idx}>{latex}</code>;
            }
          }
          if (part.startsWith('$') && part.endsWith('$')) {
            const latex = part.slice(1, -1);
            try {
              return <InlineMath key={idx} math={latex} />;
            } catch {
              return <code key={idx}>{latex}</code>;
            }
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  function getQuestionPreview(question: Question): string {
    const data = question.question_data;
    if (data?.question_text) {
      const text = data.question_text.replace(/\$[^$]+\$/g, '[math]');
      return text.substring(0, 80) + (text.length > 80 ? '...' : '');
    }
    if (data?.problem) {
      const text = data.problem.replace(/\$[^$]+\$/g, '[math]');
      return text.substring(0, 80) + (text.length > 80 ? '...' : '');
    }
    if (data?.di_type) {
      return `${data.di_type} Question #${question.question_number}`;
    }
    return `Question #${question.question_number}`;
  }

  if (loading) {
    return (
      <Layout pageTitle="GMAT Question Allocation" pageSubtitle="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading question pool...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = getAllocationStats();
  const requiredCounts = getRequiredCounts();
  const currentTopic = GMAT_STRUCTURE[selectedSection].topics.find(t => t.id === selectedTopicId);

  return (
    <Layout
      pageTitle="GMAT Question Allocation"
      pageSubtitle="Allocate questions by section, topic, and cycle"
    >
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/tutor/test-track-config/GMAT')}
              className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to GMAT Configuration</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
              </p>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} />
                Question allocation saved successfully!
              </p>
            </div>
          )}

          {/* Selection Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Section Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Section</label>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(GMAT_STRUCTURE) as SectionName[]).map(section => (
                    <button
                      key={section}
                      onClick={() => {
                        setSelectedSection(section);
                        setSelectedTopicId(GMAT_STRUCTURE[section].topics[0].id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedSection === section
                          ? 'bg-brand-dark text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {GMAT_STRUCTURE[section].code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Topic</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {GMAT_STRUCTURE[selectedSection].topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Material Type</label>
                <div className="flex flex-wrap gap-1">
                  {MATERIAL_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedMaterialType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedMaterialType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {MATERIAL_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cycle Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cycle</label>
                <div className="flex flex-wrap gap-1">
                  {GMAT_CYCLES.map(cycle => (
                    <button
                      key={cycle}
                      onClick={() => setSelectedCycle(cycle)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCycle === cycle
                          ? `bg-gradient-to-r ${CYCLE_COLORS[cycle].gradient} text-white`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Selection Summary */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  <span className="font-semibold">{currentTopic?.name}</span>
                  {' '}- {MATERIAL_TYPE_LABELS[selectedMaterialType]}
                </span>
                {selectedTemplate && (
                  <button
                    onClick={() => viewTemplatePdf(selectedTemplate)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Template PDF
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${CYCLE_COLORS[selectedCycle].bg} ${CYCLE_COLORS[selectedCycle].text}`}>
                  {selectedCycle}: {DIFFICULTY_DISTRIBUTIONS[selectedCycle].easy}% Easy / {DIFFICULTY_DISTRIBUTIONS[selectedCycle].medium}% Medium / {DIFFICULTY_DISTRIBUTIONS[selectedCycle].hard}% Hard
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Question Pool */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <FontAwesomeIcon icon={faBook} className="text-blue-500" />
                    Question Pool
                    <span className="text-sm font-normal text-gray-500">
                      ({filteredQuestions.length} questions)
                    </span>
                  </h2>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="px-3 py-1.5 border rounded-lg text-sm"
                    >
                      <option value="">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full pl-10 pr-4 py-1.5 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Question List */}
                <div className="max-h-[55vh] overflow-y-auto space-y-2">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <FontAwesomeIcon icon={faQuestionCircle} className="text-5xl text-gray-300 mb-4" />
                      <p className="text-gray-500">No questions found for this selection</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your filters or check if questions exist for this topic
                      </p>
                    </div>
                  ) : (
                    filteredQuestions.map(question => {
                      const isAllocated = allocatedQuestionIds.has(question.id);
                      const usage = getQuestionUsage(question.id);
                      const isUsedElsewhere = usage !== null;

                      return (
                        <div
                          key={question.id}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isAllocated
                              ? 'border-green-500 bg-green-50'
                              : isUsedElsewhere
                              ? 'border-orange-300 bg-orange-50 opacity-60'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => !isUsedElsewhere && toggleQuestionAllocation(question.id)}
                              disabled={isUsedElsewhere}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isAllocated
                                  ? 'bg-green-500 text-white'
                                  : isUsedElsewhere
                                  ? 'bg-orange-300 text-white cursor-not-allowed'
                                  : 'border-2 border-gray-300 hover:border-brand-green cursor-pointer'
                              }`}
                            >
                              {isAllocated && <FontAwesomeIcon icon={faCheck} className="text-sm" />}
                              {isUsedElsewhere && <FontAwesomeIcon icon={faMinus} className="text-sm" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <span className="font-bold text-brand-dark">
                                  Q{question.question_number}
                                </span>
                                {question.question_data?.di_type && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                    {question.question_data.di_type}
                                  </span>
                                )}
                                {question.difficulty && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[question.difficulty]?.bg} ${DIFFICULTY_COLORS[question.difficulty]?.text}`}>
                                    {question.difficulty}
                                  </span>
                                )}
                                {isUsedElsewhere && (
                                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                    Used in {usage.cycle}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{getQuestionPreview(question)}</p>
                            </div>

                            <button
                              onClick={() => setPreviewingQuestion(question)}
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                              title="Preview question"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Requirements & Stats Panel */}
            <div className="lg:col-span-4">
              <div className="space-y-4 sticky top-4">
                {/* Cycle Requirements Card */}
                <div className="bg-white rounded-2xl shadow-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-brand-dark flex items-center gap-2">
                      <FontAwesomeIcon icon={faClipboardList} className="text-purple-500" />
                      {selectedCycle} Requirements
                    </h3>
                    <button
                      onClick={() => setEditingRequirements(!editingRequirements)}
                      className="p-1.5 text-gray-400 hover:text-brand-green transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>

                  {editingRequirements && requirementsForm ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Total Questions</label>
                        <input
                          type="number"
                          value={requirementsForm.total_questions}
                          onChange={(e) => setRequirementsForm(prev => prev ? ({
                            ...prev,
                            total_questions: parseInt(e.target.value) || 0
                          }) : null)}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['easy', 'medium', 'hard'].map(diff => (
                          <div key={diff}>
                            <label className="text-xs text-gray-600 block mb-1 capitalize">{diff}</label>
                            <input
                              type="number"
                              value={requirementsForm.difficulty_distribution?.[selectedCycle]?.[diff as keyof DifficultyDistribution] || 0}
                              onChange={(e) => setRequirementsForm(prev => prev ? ({
                                ...prev,
                                difficulty_distribution: {
                                  ...prev.difficulty_distribution,
                                  [selectedCycle]: {
                                    ...prev.difficulty_distribution?.[selectedCycle],
                                    [diff]: parseInt(e.target.value) || 0
                                  }
                                }
                              }) : null)}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setEditingRequirements(false)}
                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        Done
                      </button>
                    </div>
                  ) : requirementsForm && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Questions:</span>
                        <span className="font-bold text-lg">{requirementsForm.total_questions}</span>
                      </div>
                      {requirementsForm.time_limit_minutes && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Time Limit:</span>
                          <span className="font-semibold">{requirementsForm.time_limit_minutes} min</span>
                        </div>
                      )}
                      {requiredCounts && (
                        <div className="space-y-2 pt-2 border-t">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase">Difficulty Distribution</h4>
                          {['easy', 'medium', 'hard'].map(diff => (
                            <div key={diff} className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${DIFFICULTY_COLORS[diff]?.bg} ${DIFFICULTY_COLORS[diff]?.text}`}>
                                {diff}
                              </span>
                              <span className="font-semibold">
                                {requiredCounts[diff as keyof DifficultyDistribution]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Allocation Stats Card */}
                <div className="bg-white rounded-2xl shadow-xl p-4">
                  <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartBar} className="text-blue-500" />
                    Current Allocation
                  </h3>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-bold ${
                        requirementsForm && stats.total >= requirementsForm.total_questions
                          ? 'text-green-600'
                          : stats.total > 0
                          ? 'text-yellow-600'
                          : 'text-gray-700'
                      }`}>
                        {stats.total} / {requirementsForm?.total_questions || 0}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          requirementsForm && stats.total >= requirementsForm.total_questions
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(100, requirementsForm ? (stats.total / requirementsForm.total_questions) * 100 : 0)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* By Difficulty with requirements comparison */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">By Difficulty</h4>
                    {['easy', 'medium', 'hard'].map(diff => {
                      const actual = stats.byDifficulty[diff as keyof typeof stats.byDifficulty];
                      const required = requiredCounts?.[diff as keyof DifficultyDistribution] || 0;
                      const isComplete = actual >= required;

                      return (
                        <div key={diff} className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${DIFFICULTY_COLORS[diff]?.bg} ${DIFFICULTY_COLORS[diff]?.text}`}>
                            {diff}
                          </span>
                          <span className={`font-semibold ${
                            isComplete ? 'text-green-600' : actual > 0 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {actual} / {required}
                            {isComplete && <FontAwesomeIcon icon={faCheck} className="ml-1 text-xs" />}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cycle Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">All Cycles</h4>
                    <div className="space-y-1">
                      {GMAT_CYCLES.map(cycle => {
                        const count = cycleAllocations[cycle].size;
                        const req = requirementsForm?.total_questions || 0;
                        const isComplete = count >= req && req > 0;
                        return (
                          <div
                            key={cycle}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              selectedCycle === cycle ? CYCLE_COLORS[cycle].bg : 'bg-gray-50'
                            }`}
                          >
                            <span className={`text-sm font-medium ${
                              selectedCycle === cycle ? CYCLE_COLORS[cycle].text : 'text-gray-600'
                            }`}>
                              {cycle}
                            </span>
                            <span className={`text-sm font-bold ${
                              isComplete ? 'text-green-600' : count > 0 ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {count}/{req}
                              {isComplete && <FontAwesomeIcon icon={faCheck} className="ml-1" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveAllocation}
                  disabled={saving}
                  className="w-full py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Save All Cycles
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPdf(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg text-brand-dark">{viewingPdf.title}</h3>
              <button
                onClick={() => setViewingPdf(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={viewingPdf.url}
                className="w-full h-full"
                title={viewingPdf.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Question Preview Modal */}
      {previewingQuestion && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewingQuestion(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-brand-dark">
                  Question #{previewingQuestion.question_number}
                </h3>
                <span className="text-sm text-gray-500">{previewingQuestion.section}</span>
              </div>
              <div className="flex items-center gap-2">
                {!allocatedQuestionIds.has(previewingQuestion.id) && !getQuestionUsage(previewingQuestion.id) && (
                  <button
                    onClick={() => {
                      toggleQuestionAllocation(previewingQuestion.id);
                      setPreviewingQuestion(null);
                    }}
                    className="px-4 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add to {selectedCycle}
                  </button>
                )}
                {allocatedQuestionIds.has(previewingQuestion.id) && (
                  <button
                    onClick={() => {
                      toggleQuestionAllocation(previewingQuestion.id);
                      setPreviewingQuestion(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setPreviewingQuestion(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderQuestionContent(previewingQuestion)}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
