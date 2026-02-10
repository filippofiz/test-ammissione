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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBook,
  faCheck,
  faPlus,
  faMinus,
  faSearch,
  faExclamationTriangle,
  faCheckCircle,
  faQuestionCircle,
  faSave,
  faEye,
  faTimes,
  faEdit,
  faClipboardList,
  faChartBar,
  faSpinner,
  faFilter,
  faRobot,
  faMagic,
  faDollarSign,
  faTrash,
  faFlag,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { MathJaxProvider, MathJaxRenderer } from '../components/MathJaxRenderer';
import {
  generateGMATQuestions,
  saveGeneratedQuestion,
  getGMATQuestionPoolId,
  estimateGenerationCost,
  type GeneratedQuestion,
  type DIType,
} from '../lib/api/gmat';


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
  // Key is just the question ID, value contains all places where it's used
  const [usedQuestionIds, setUsedQuestionIds] = useState<Map<string, Array<{ templateId: string; templateTitle: string; materialType: string; cycle: GmatCycle }>>>(new Map());

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Requirements form
  const [requirementsForm, setRequirementsForm] = useState<QuestionRequirements | null>(null);
  const [editingRequirements, setEditingRequirements] = useState(false);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usageFilter, setUsageFilter] = useState<'all' | 'unused' | 'used'>('all');

  // Available categories (extracted from pool questions)
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // UI State
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [previewingQuestion, setPreviewingQuestion] = useState<Question | null>(null);
  const [editingCategories, setEditingCategories] = useState(false);
  const [editedCategories, setEditedCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [savingCategories, setSavingCategories] = useState(false);

  // AI Question Generation State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateDifficulty, setGenerateDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generateCount, setGenerateCount] = useState(3);
  const [generateCategories, setGenerateCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentGeneratedIndex, setCurrentGeneratedIndex] = useState(0);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [editingGeneratedJson, setEditingGeneratedJson] = useState(false);
  const [generatedJsonEdit, setGeneratedJsonEdit] = useState('');
  const [generationCost, setGenerationCost] = useState<{ input_tokens: number; output_tokens: number; cost_usd: number } | null>(null);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [questionPoolTestId, setQuestionPoolTestId] = useState<string | null>(null);
  const [exampleQuestionsUsed, setExampleQuestionsUsed] = useState<Array<{ question_data: any; difficulty: string }>>([]);

  // Manual Question Inserter State
  const [showManualInsertModal, setShowManualInsertModal] = useState(false);
  const [manualQuestionSection, setManualQuestionSection] = useState<SectionName>('Quantitative Reasoning');
  const [manualQuestionType, setManualQuestionType] = useState<'multiple_choice' | 'data_insights'>('multiple_choice');
  const [manualQuestionDifficulty, setManualQuestionDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [manualQuestionDIType, setManualQuestionDIType] = useState<DIType>('DS');
  const [manualQuestionJsonMode, setManualQuestionJsonMode] = useState(false);
  const [manualQuestionJson, setManualQuestionJson] = useState('');
  const [manualQuestionText, setManualQuestionText] = useState('');
  const [manualQuestionOptions, setManualQuestionOptions] = useState<Record<string, string>>({ a: '', b: '', c: '', d: '', e: '' });
  const [manualQuestionCorrectAnswer, setManualQuestionCorrectAnswer] = useState('a');
  const [savingManualQuestion, setSavingManualQuestion] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<Array<{ question: Question; similarity: number }>>([]);
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);
  // Verbal Reasoning specific fields
  const [manualQuestionVRType, setManualQuestionVRType] = useState<'critical_reasoning' | 'reading_comprehension'>('critical_reasoning');
  const [manualQuestionPassage, setManualQuestionPassage] = useState('');

  // Question Checker State
  const [showQuestionChecker, setShowQuestionChecker] = useState(false);
  const [checkerRunning, setCheckerRunning] = useState(false);
  const [checkerProgress, setCheckerProgress] = useState(0);
  const [duplicateGroups, setDuplicateGroups] = useState<Array<{ questions: Question[]; similarity: number }>>([]);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [markingForReviewId, setMarkingForReviewId] = useState<string | null>(null);

  // Compute matching questions for generation preview (shows how many questions will be used as examples)
  const generationMatchingQuestions = useMemo(() => {
    // Start from ALL pool questions and filter by section/topic
    let matching = [...poolQuestions];

    // Filter by section
    const sectionConfig = GMAT_STRUCTURE[selectedSection];
    matching = matching.filter(q => {
      const qSection = q.section.toLowerCase();
      return qSection.includes(selectedSection.toLowerCase()) ||
             qSection.includes(sectionConfig.code.toLowerCase());
    });

    // Filter by topic/DI type for Data Insights
    if (selectedSection === 'Data Insights') {
      const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);
      if (topic && 'diType' in topic) {
        matching = matching.filter(q => {
          return q.question_data?.di_type === topic.diType;
        });
      }
    }

    // Store section/topic filtered count for fallback info
    const sectionTopicCount = matching.length;

    // Filter by the modal's difficulty selection
    matching = matching.filter(q => q.difficulty === generateDifficulty);

    // Filter by the modal's category selections (AND condition - must have ALL selected categories)
    if (generateCategories.length > 0) {
      matching = matching.filter(q => {
        const qCategories = q.question_data?.categories as string[] || [];
        return generateCategories.every(cat => qCategories.includes(cat));
      });
    }

    return {
      exactMatch: matching.length,
      sectionTopicTotal: sectionTopicCount,
      questions: matching,
    };
  }, [poolQuestions, selectedSection, selectedTopicId, generateDifficulty, generateCategories]);

  useEffect(() => {
    loadData();
    // Load question pool ID for saving generated questions
    getGMATQuestionPoolId().then(id => setQuestionPoolTestId(id));
  }, []);

  // Find matching template when selection changes
  useEffect(() => {
    findMatchingTemplate();
  }, [selectedSection, selectedTopicId, selectedMaterialType, templates]);

  // Apply filters when questions or filters change
  useEffect(() => {
    applyFilters();
  }, [poolQuestions, difficultyFilter, categoryFilter, searchQuery, selectedSection, selectedTopicId, usageFilter, usedQuestionIds]);

  // Extract available categories from section-filtered questions (not all pool questions)
  useEffect(() => {
    const categories = new Set<string>();

    // Filter to current section first
    const sectionConfig = GMAT_STRUCTURE[selectedSection];
    let sectionQuestions = poolQuestions.filter(q => {
      const qSection = q.section.toLowerCase();
      return qSection.includes(selectedSection.toLowerCase()) ||
             qSection.includes(sectionConfig.code.toLowerCase());
    });

    // For Data Insights, also filter by DI type
    if (selectedSection === 'Data Insights') {
      const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);
      if (topic && 'diType' in topic) {
        sectionQuestions = sectionQuestions.filter(q => {
          return q.question_data?.di_type === topic.diType;
        });
      }
    }

    // Extract categories from section-filtered questions
    for (const q of sectionQuestions) {
      const questionCategories = q.question_data?.categories;
      if (Array.isArray(questionCategories)) {
        for (const cat of questionCategories) {
          categories.add(cat);
        }
      }
    }
    setAvailableCategories(Array.from(categories).sort());
  }, [poolQuestions, selectedSection, selectedTopicId]);

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
      setTemplates((templatesData || []) as unknown as LessonMaterial[]);

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

      // 4. Build map of all used question IDs from ALL templates and cycles
      // This tracks GLOBAL usage - a question used anywhere cannot be used again
      const allUsedIds = new Map<string, Array<{ templateId: string; templateTitle: string; materialType: string; cycle: GmatCycle }>>();
      (templatesData || []).forEach(template => {
        const allocation = template.question_allocation as QuestionAllocation | null;
        if (allocation?.by_cycle) {
          GMAT_CYCLES.forEach(cycle => {
            const cycleAlloc = allocation.by_cycle[cycle];
            if (cycleAlloc?.allocated_questions) {
              cycleAlloc.allocated_questions.forEach((id: string) => {
                if (!allUsedIds.has(id)) {
                  allUsedIds.set(id, []);
                }
                allUsedIds.get(id)!.push({
                  templateId: template.id,
                  templateTitle: template.title || `${template.section} - ${template.topic}`,
                  materialType: template.material_type,
                  cycle
                });
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

    // If we have unsaved changes, warn the user
    if (hasUnsavedChanges) {
      const shouldContinue = window.confirm(
        'You have unsaved changes. Do you want to continue? Your changes will be lost.\n\nClick "Save All Cycles" to save before switching.'
      );
      if (!shouldContinue) {
        return; // Don't switch - user wants to save first
      }
    }

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
    setHasUnsavedChanges(false);
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
    // Use floor for first two, then calculate last to ensure they sum to total
    const calcDistribution = (easyPct: number, mediumPct: number, hardPct: number): DifficultyDistribution => {
      const easy = Math.floor(totalQuestions * easyPct);
      const medium = Math.floor(totalQuestions * mediumPct);
      const hard = totalQuestions - easy - medium; // Ensures sum equals total
      return { easy, medium, hard };
    };

    const difficultyDistribution: Record<GmatCycle, DifficultyDistribution> = {
      Foundation: calcDistribution(0.60, 0.30, 0.10),
      Development: calcDistribution(0.25, 0.50, 0.25),
      Excellence: calcDistribution(0.05, 0.30, 0.65),
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

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(q => {
        const categories = q.question_data?.categories;
        return Array.isArray(categories) && categories.includes(categoryFilter);
      });
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

    // Filter by usage status
    if (usageFilter !== 'all') {
      filtered = filtered.filter(q => {
        const isUsed = usedQuestionIds.has(q.id);
        return usageFilter === 'used' ? isUsed : !isUsed;
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

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await supabase
          .from('2V_lesson_materials')
          .update({
            question_allocation: allocation as any,
            question_requirements: requirementsForm as any,
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

      // Clear unsaved changes flag
      setHasUnsavedChanges(false);

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

  // ============================================
  // AI QUESTION GENERATION HANDLERS
  // ============================================

  async function handleGenerateQuestions() {
    if (poolQuestions.length === 0) {
      setError('No questions available in the pool.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Start from ALL pool questions and filter by section/topic (context-based)
      // This removes the need to manually pre-filter the question pool UI
      let matchingQuestions = [...poolQuestions];

      // Filter by section
      const sectionConfig = GMAT_STRUCTURE[selectedSection];
      matchingQuestions = matchingQuestions.filter(q => {
        const qSection = q.section.toLowerCase();
        return qSection.includes(selectedSection.toLowerCase()) ||
               qSection.includes(sectionConfig.code.toLowerCase());
      });

      // Filter by topic/DI type for Data Insights
      if (selectedSection === 'Data Insights') {
        const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);
        if (topic && 'diType' in topic) {
          matchingQuestions = matchingQuestions.filter(q => {
            return q.question_data?.di_type === topic.diType;
          });
        }
      }

      // Filter by the modal's difficulty selection
      matchingQuestions = matchingQuestions.filter(q =>
        q.difficulty === generateDifficulty
      );

      // Filter by the modal's category selections (AND condition - must have ALL selected categories)
      if (generateCategories.length > 0) {
        matchingQuestions = matchingQuestions.filter(q => {
          const qCategories = q.question_data?.categories as string[] || [];
          return generateCategories.every(cat => qCategories.includes(cat));
        });
      }

      // If no questions match the exact criteria, fall back to section/topic questions only
      if (matchingQuestions.length === 0) {
        // Reset to section/topic filtered questions
        matchingQuestions = [...poolQuestions];
        matchingQuestions = matchingQuestions.filter(q => {
          const qSection = q.section.toLowerCase();
          return qSection.includes(selectedSection.toLowerCase()) ||
                 qSection.includes(sectionConfig.code.toLowerCase());
        });
        if (selectedSection === 'Data Insights') {
          const topic = sectionConfig.topics.find(t => t.id === selectedTopicId);
          if (topic && 'diType' in topic) {
            matchingQuestions = matchingQuestions.filter(q => {
              return q.question_data?.di_type === topic.diType;
            });
          }
        }
      }

      // Send ALL matching questions to Claude (not just 5) so it knows what exists
      // This ensures it doesn't generate duplicates of AI-generated questions
      const exampleQuestions = matchingQuestions.map(q => ({
        question_data: q.question_data,
        answers: q.answers,
        difficulty: q.difficulty || 'medium',
      }));

      // Store example questions for comparison in validation modal
      setExampleQuestionsUsed(exampleQuestions.map(q => ({
        question_data: q.question_data,
        difficulty: q.difficulty,
      })));

      // Determine DI type if applicable
      const topic = GMAT_STRUCTURE[selectedSection].topics.find(t => t.id === selectedTopicId);
      const diType = selectedSection === 'Data Insights' ? (topic as { diType?: DIType })?.diType : undefined;

      const response = await generateGMATQuestions({
        section: selectedSection as 'Quantitative Reasoning' | 'Data Insights',
        diType,
        difficulty: generateDifficulty,
        count: generateCount,
        categories: generateCategories,
        exampleQuestions,
      });

      if (!response.success || response.questions.length === 0) {
        setError(response.error || 'No questions were generated. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Store the generated questions and show validation modal
      setGeneratedQuestions(response.questions);
      setGenerationCost({
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cost_usd: response.usage.cost_usd,
      });
      setCurrentGeneratedIndex(0);
      setAcceptedCount(0);
      setRejectedCount(0);
      setShowGenerateModal(false);
      setShowValidationModal(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveCategories() {
    if (!previewingQuestion) return;

    setSavingCategories(true);
    try {
      // Update the question_data with new categories
      const updatedQuestionData = {
        ...previewingQuestion.question_data,
        categories: editedCategories,
      };

      const { error } = await supabase
        .from('2V_questions')
        .update({ question_data: updatedQuestionData })
        .eq('id', previewingQuestion.id);

      if (error) throw error;

      // Update local state
      setPoolQuestions(prev => prev.map(q =>
        q.id === previewingQuestion.id
          ? { ...q, question_data: updatedQuestionData }
          : q
      ));

      // Update the previewing question state
      setPreviewingQuestion(prev => prev ? { ...prev, question_data: updatedQuestionData } : null);

      setEditingCategories(false);
      setNewCategoryInput('');
    } catch (err) {
      console.error('Error saving categories:', err);
      setError('Failed to save categories');
    } finally {
      setSavingCategories(false);
    }
  }

  function handleStartEditingCategories() {
    if (!previewingQuestion) return;
    const currentCategories = previewingQuestion.question_data?.categories as string[] || [];
    setEditedCategories([...currentCategories]);
    setEditingCategories(true);
  }

  function handleAddCategory() {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !editedCategories.includes(trimmed)) {
      setEditedCategories(prev => [...prev, trimmed]);
      setNewCategoryInput('');
    }
  }

  function handleRemoveCategory(cat: string) {
    setEditedCategories(prev => prev.filter(c => c !== cat));
  }

  async function handleAcceptQuestion() {
    if (!questionPoolTestId) {
      setError('Question pool not found. Cannot save question.');
      return;
    }

    const currentQuestion = generatedQuestions[currentGeneratedIndex];

    // Save to database
    const result = await saveGeneratedQuestion(currentQuestion, questionPoolTestId);

    if (!result.success) {
      setError(result.error || 'Failed to save question');
      return;
    }

    // Add to current allocation
    if (result.questionId) {
      toggleQuestionAllocation(result.questionId);

      // Reload pool questions to include the new one
      // This is a simplified approach - in production you might want to just add to local state
      loadData();
    }

    setAcceptedCount(prev => prev + 1);
    moveToNextQuestion();
  }

  function handleRejectQuestion() {
    setRejectedCount(prev => prev + 1);
    moveToNextQuestion();
  }

  function moveToNextQuestion() {
    if (currentGeneratedIndex < generatedQuestions.length - 1) {
      setCurrentGeneratedIndex(prev => prev + 1);
    } else {
      // All questions processed
      setShowValidationModal(false);
      setGeneratedQuestions([]);
    }
  }

  // ============================================
  // SIMILARITY & DUPLICATE DETECTION FUNCTIONS
  // ============================================

  // Calculate text similarity - handles LaTeX math expressions properly
  function calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    // Normalize LaTeX - extract meaningful content from math expressions
    const normalizeLatex = (t: string) => {
      let result = t;

      // Replace display math $$...$$ and inline $...$, keeping content
      result = result.replace(/\$\$([^$]+)\$\$/g, ' $1 ');
      result = result.replace(/\$([^$]+)\$/g, ' $1 ');

      // Extract fractions: \frac{1}{2} -> FRAC_1_2
      result = result.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (_, n, d) => ` FRAC_${n}_${d} `);

      // Extract exponents: ^{-3} -> EXP_-3, ^2 -> EXP_2
      result = result.replace(/\^\{([^}]*)\}/g, (_, exp) => ` EXP_${exp} `);
      result = result.replace(/\^(-?\d+)/g, (_, exp) => ` EXP_${exp} `);

      // Extract subscripts: _{n} -> SUB_n
      result = result.replace(/_\{([^}]*)\}/g, (_, sub) => ` SUB_${sub} `);
      result = result.replace(/_(\d+)/g, (_, sub) => ` SUB_${sub} `);

      // Extract square roots: \sqrt{x} -> SQRT_x
      result = result.replace(/\\sqrt\{([^}]*)\}/g, (_, content) => ` SQRT_${content} `);

      // Preserve operators as tokens
      result = result.replace(/\\times/g, ' TIMES ');
      result = result.replace(/\\div/g, ' DIV ');
      result = result.replace(/\\pm/g, ' PLUSMINUS ');
      result = result.replace(/\\cdot/g, ' DOT ');
      result = result.replace(/\\leq/g, ' LEQ ');
      result = result.replace(/\\geq/g, ' GEQ ');
      result = result.replace(/\\neq/g, ' NEQ ');

      // Keep displaystyle marker as it indicates math context
      result = result.replace(/\\displaystyle/g, ' ');

      // Remove formatting commands but keep important ones
      result = result.replace(/\\left|\\right/g, '');
      result = result.replace(/\\text\{([^}]*)\}/g, ' $1 ');
      result = result.replace(/\\[a-zA-Z]+/g, ' ');

      // Keep operators as meaningful tokens
      result = result.replace(/\+/g, ' PLUS ');
      result = result.replace(/-/g, ' MINUS ');
      result = result.replace(/\*/g, ' MULT ');
      result = result.replace(/\//g, ' DIVIDE ');
      result = result.replace(/=/g, ' EQUALS ');

      // Normalize brackets and braces
      result = result.replace(/[{}]/g, '');
      result = result.replace(/\(/g, ' LPAREN ');
      result = result.replace(/\)/g, ' RPAREN ');
      result = result.replace(/\[/g, ' LBRACKET ');
      result = result.replace(/\]/g, ' RBRACKET ');

      result = result.replace(/\s+/g, ' ').trim().toLowerCase();

      return result;
    };

    const a = normalizeLatex(text1);
    const b = normalizeLatex(text2);

    // Exact match after normalization
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    // Quick length check - very different lengths = likely not similar
    const lenRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    if (lenRatio < 0.3) return lenRatio * 0.2;

    // Token-based comparison - split on whitespace only (operators are now tokenized)
    const getTokens = (str: string): string[] => {
      // Split on whitespace and punctuation that wasn't converted to tokens
      const tokens = str.split(/[\s,;:.]+/).filter(t => t.length > 0);
      return tokens;
    };

    const tokens1 = getTokens(a);
    const tokens2 = getTokens(b);

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    // LCS (Longest Common Subsequence) - captures structural similarity
    const lcs = (arr1: string[], arr2: string[]): number => {
      const m = arr1.length;
      const n = arr2.length;
      const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (arr1[i - 1] === arr2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }
      return dp[m][n];
    };

    const lcsLength = lcs(tokens1, tokens2);
    const lcsRatio = (2 * lcsLength) / (tokens1.length + tokens2.length);

    // Jaccard similarity for unordered comparison
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    let intersection = 0;
    set1.forEach(t => { if (set2.has(t)) intersection++; });
    const union = set1.size + set2.size - intersection;
    const jaccardRatio = union > 0 ? intersection / union : 0;

    // Combine: LCS for structure (60%) + Jaccard for content overlap (40%)
    return (lcsRatio * 0.6) + (jaccardRatio * 0.4);
  }

  // Extract comparable text from question - ONLY the core question text, not options
  // This prevents false positives from standard answer choices
  function getComparableText(question: Question): string {
    const data = question.question_data || {};
    let text = '';

    // Primary question text fields (in order of priority)
    if (data.question_text) text += data.question_text + ' ';
    if (data.problem) text += data.problem + ' '; // DS questions
    if (data.scenario) text += data.scenario + ' '; // TPA questions

    // For DS questions, include statements as they are unique identifiers
    if (data.di_type === 'DS') {
      if (data.statement1) text += data.statement1 + ' ';
      if (data.statement2) text += data.statement2 + ' ';
    }

    // For GI questions, include statement text
    if (data.di_type === 'GI' && data.statement_text) {
      text += data.statement_text + ' ';
    }

    // For Verbal questions with passages - use a truncated version to match structure
    if (data.passage_text) {
      // Only use first 200 chars of passage to identify similar passages
      text += data.passage_text.substring(0, 200) + ' ';
    }

    return text;
  }

  // Get options text for secondary comparison
  function getOptionsText(question: Question): string {
    const data = question.question_data || {};
    let text = '';

    if (data.options && typeof data.options === 'object') {
      Object.values(data.options).forEach(opt => {
        if (typeof opt === 'string') text += opt + ' ';
      });
    }

    return text;
  }

  // Check similarity of a new question against existing questions
  async function checkQuestionSimilarity(questionText: string, options?: Record<string, string>) {
    setCheckingSimilarity(true);
    setSimilarQuestions([]);

    try {
      let newText = questionText;
      if (options) {
        Object.values(options).forEach(opt => {
          if (opt) newText += ' ' + opt;
        });
      }

      const similar: Array<{ question: Question; similarity: number }> = [];

      for (const q of poolQuestions) {
        const existingText = getComparableText(q);
        const similarity = calculateSimilarity(newText, existingText);

        if (similarity >= 0.5) { // 50% threshold
          similar.push({ question: q, similarity });
        }
      }

      // Sort by similarity descending
      similar.sort((a, b) => b.similarity - a.similarity);
      setSimilarQuestions(similar.slice(0, 10)); // Top 10 matches
    } finally {
      setCheckingSimilarity(false);
    }
  }

  // Run full duplicate check on all questions - improved algorithm
  async function runDuplicateCheck() {
    setCheckerRunning(true);
    setCheckerProgress(0);
    setDuplicateGroups([]);

    try {
      // Group questions by section and type first to reduce false positives
      const groupedQuestions: Record<string, Array<{ question: Question; text: string; optionsText: string }>> = {};

      for (const q of poolQuestions) {
        const key = `${q.section}_${q.question_type}_${q.question_data?.di_type || ''}`;
        if (!groupedQuestions[key]) groupedQuestions[key] = [];
        groupedQuestions[key].push({
          question: q,
          text: getComparableText(q),
          optionsText: getOptionsText(q)
        });
      }

      const allDuplicates: Array<{ questions: Question[]; similarity: number }> = [];
      const processed = new Set<string>();
      let totalProcessed = 0;
      const totalQuestions = poolQuestions.length;

      // Compare within each group
      for (const [groupKey, questions] of Object.entries(groupedQuestions)) {
        for (let i = 0; i < questions.length; i++) {
          const q1 = questions[i];
          if (processed.has(q1.question.id)) continue;

          for (let j = i + 1; j < questions.length; j++) {
            const q2 = questions[j];
            if (processed.has(q2.question.id)) continue;

            // Skip if texts are too different in length
            const lenRatio = Math.min(q1.text.length, q2.text.length) / Math.max(q1.text.length, q2.text.length);
            if (lenRatio < 0.5) continue;

            // Calculate text similarity
            const textSimilarity = calculateSimilarity(q1.text, q2.text);

            // Only check options if text is very similar (80%+)
            if (textSimilarity >= 0.8) {
              const optionsSimilarity = q1.optionsText && q2.optionsText
                ? calculateSimilarity(q1.optionsText, q2.optionsText)
                : 0;

              // Weighted combined score: 70% text + 30% options
              const combinedScore = (textSimilarity * 0.7) + (optionsSimilarity * 0.3);

              // Only flag as duplicate if combined score >= 75%
              if (combinedScore >= 0.75) {
                allDuplicates.push({
                  questions: [q1.question, q2.question],
                  similarity: combinedScore
                });
                processed.add(q2.question.id);
              }
            }
          }

          totalProcessed++;
          if (totalProcessed % 50 === 0) {
            setCheckerProgress(Math.round((totalProcessed / totalQuestions) * 100));
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
      }

      // Sort by similarity descending
      allDuplicates.sort((a, b) => b.similarity - a.similarity);
      setDuplicateGroups(allDuplicates);
      setCheckerProgress(100);
    } finally {
      setCheckerRunning(false);
    }
  }

  // Mark question for review
  async function markQuestionForReview(questionId: string) {
    setMarkingForReviewId(questionId);
    try {
      const { error } = await supabase
        .from('2V_questions')
        .update({
          Questions_toReview: {
            flagged_at: new Date().toISOString(),
            reason: 'Potential duplicate - needs review',
            flagged_by: 'duplicate_checker'
          }
        })
        .eq('id', questionId);

      if (error) throw error;

      // Update local state
      setPoolQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, Questions_toReview: { flagged_at: new Date().toISOString(), reason: 'Potential duplicate' } }
          : q
      ));
    } catch (err) {
      console.error('Error marking question for review:', err);
      setError('Failed to mark question for review');
    } finally {
      setMarkingForReviewId(null);
    }
  }

  // Delete question
  async function deleteQuestion(questionId: string) {
    // Check if question is allocated anywhere
    const allocations = usedQuestionIds.get(questionId);
    const isAllocated = allocations && allocations.length > 0;

    let confirmMessage = 'Are you sure you want to delete this question? This action cannot be undone.';
    if (isAllocated) {
      const allocationDetails = allocations.map(a => `• ${a.templateTitle} (${a.cycle})`).join('\n');
      confirmMessage = `⚠️ WARNING: This question is currently allocated in:\n\n${allocationDetails}\n\nDeleting it will remove it from all allocations. Continue?`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingQuestionId(questionId);
    try {
      // If question is allocated, remove it from all templates
      if (isAllocated) {
        // Group allocations by template
        const templateUpdates = new Map<string, { template: LessonMaterial; cyclesToUpdate: GmatCycle[] }>();

        for (const alloc of allocations) {
          const template = templates.find(t => t.id === alloc.templateId);
          if (template) {
            if (!templateUpdates.has(alloc.templateId)) {
              templateUpdates.set(alloc.templateId, { template, cyclesToUpdate: [] });
            }
            templateUpdates.get(alloc.templateId)!.cyclesToUpdate.push(alloc.cycle);
          }
        }

        // Update each affected template
        for (const [templateId, { template, cyclesToUpdate }] of templateUpdates) {
          const currentAllocation = template.question_allocation as QuestionAllocation | null;
          if (currentAllocation?.by_cycle) {
            const updatedAllocation: QuestionAllocation = {
              by_cycle: { ...currentAllocation.by_cycle }
            };

            // Remove question from each affected cycle
            for (const cycle of cyclesToUpdate) {
              const cycleAlloc = updatedAllocation.by_cycle[cycle];
              if (cycleAlloc) {
                updatedAllocation.by_cycle[cycle] = {
                  ...cycleAlloc,
                  allocated_questions: cycleAlloc.allocated_questions.filter(id => id !== questionId)
                };
              }
            }

            // Save to database
            const { error: updateError } = await supabase
              .from('2V_lesson_materials')
              .update({ question_allocation: updatedAllocation as any })
              .eq('id', templateId);

            if (updateError) {
              console.error(`Failed to update template ${templateId}:`, updateError);
            }
          }
        }

        // Update local templates state
        setTemplates(prev => prev.map(t => {
          const update = templateUpdates.get(t.id);
          if (!update) return t;

          const currentAllocation = t.question_allocation as QuestionAllocation | null;
          if (!currentAllocation?.by_cycle) return t;

          const updatedAllocation: QuestionAllocation = {
            by_cycle: { ...currentAllocation.by_cycle }
          };

          for (const cycle of update.cyclesToUpdate) {
            const cycleAlloc = updatedAllocation.by_cycle[cycle];
            if (cycleAlloc) {
              updatedAllocation.by_cycle[cycle] = {
                ...cycleAlloc,
                allocated_questions: cycleAlloc.allocated_questions.filter(id => id !== questionId)
              };
            }
          }

          return { ...t, question_allocation: updatedAllocation };
        }));

        // Update cycle allocations for current template
        setCycleAllocations(prev => ({
          Foundation: new Set([...prev.Foundation].filter(id => id !== questionId)),
          Development: new Set([...prev.Development].filter(id => id !== questionId)),
          Excellence: new Set([...prev.Excellence].filter(id => id !== questionId)),
        }));

        // Update usedQuestionIds
        setUsedQuestionIds(prev => {
          const newMap = new Map(prev);
          newMap.delete(questionId);
          return newMap;
        });
      }

      // Delete the question from database
      const { error } = await supabase
        .from('2V_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      // Update local state
      setPoolQuestions(prev => prev.filter(q => q.id !== questionId));

      // Remove from duplicate groups
      setDuplicateGroups(prev => prev.map(group => ({
        ...group,
        questions: group.questions.filter(q => q.id !== questionId)
      })).filter(group => group.questions.length > 1));

    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    } finally {
      setDeletingQuestionId(null);
    }
  }

  // Save manually inserted question
  async function saveManualQuestion() {
    if (!questionPoolTestId) {
      setError('Question pool not found. Cannot save question.');
      return;
    }

    setSavingManualQuestion(true);
    try {
      let questionData: any;
      let answers: any;

      if (manualQuestionJsonMode) {
        // Parse JSON mode
        const parsed = JSON.parse(manualQuestionJson);
        questionData = parsed.question_data || parsed;
        answers = parsed.answers || { correct_answer: manualQuestionCorrectAnswer };
      } else {
        // Form mode - handle all question types
        if (manualQuestionType === 'multiple_choice') {
          // Build question data based on section
          if (manualQuestionSection === 'Verbal Reasoning') {
            // Verbal Reasoning questions have passage or argument
            const categories = manualQuestionVRType === 'critical_reasoning'
              ? ['Critical Reasoning']
              : ['Reading Comprehension'];

            questionData = {
              question_text: manualQuestionText,
              options: manualQuestionOptions,
              categories,
              questionSubtype: manualQuestionVRType === 'critical_reasoning' ? 'critical-reasoning' : 'reading-comprehension',
            };

            // Add passage for RC or argument for CR
            if (manualQuestionVRType === 'reading_comprehension' && manualQuestionPassage) {
              questionData.passage_text = manualQuestionPassage;
              questionData.passage_id = `RC-MANUAL-${Date.now()}`;
            } else if (manualQuestionVRType === 'critical_reasoning' && manualQuestionPassage) {
              questionData.passage_text = manualQuestionPassage;
              questionData.passage_id = `CR-STIMULUS-MANUAL-${Date.now()}`;
            }
          } else {
            // Quantitative Reasoning - standard multiple choice
            questionData = {
              question_text: manualQuestionText,
              options: manualQuestionOptions,
              categories: [],
            };
          }
          answers = {
            correct_answer: manualQuestionCorrectAnswer,
            wrong_answers: ['a', 'b', 'c', 'd', 'e'].filter(x => x !== manualQuestionCorrectAnswer)
          };
        } else {
          // Data Insights - use JSON mode for complex types
          setError('Please use JSON mode for Data Insights questions. The structure varies by DI type.');
          setSavingManualQuestion(false);
          return;
        }
      }

      // Get next question number
      const maxQuestionNumber = poolQuestions.reduce((max, q) => Math.max(max, q.question_number), 0);
      const nextQuestionNumber = maxQuestionNumber + 1;

      // Determine section name
      let sectionName = manualQuestionSection;
      if (manualQuestionType === 'data_insights') {
        sectionName = 'Data Insights';
      }

      // Generate question ID
      const prefix = sectionName === 'Quantitative Reasoning' ? 'QR' :
                     sectionName === 'Verbal Reasoning' ? 'VR' : 'DI';
      questionData.gmat_question_id = `${prefix}-MANUAL-${Date.now()}`;

      // Insert question
      const { data, error } = await supabase
        .from('2V_questions')
        .insert({
          test_id: questionPoolTestId,
          question_number: nextQuestionNumber,
          question_type: manualQuestionType,
          section: sectionName,
          difficulty: manualQuestionDifficulty,
          question_data: questionData,
          answers: answers,
          is_active: true,
          test_type: 'GMAT',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      if (data) {
        setPoolQuestions(prev => [...prev, data as Question]);
      }

      // Reset form
      setShowManualInsertModal(false);
      setManualQuestionText('');
      setManualQuestionPassage('');
      setManualQuestionOptions({ a: '', b: '', c: '', d: '', e: '' });
      setManualQuestionCorrectAnswer('a');
      setManualQuestionJson('');
      setSimilarQuestions([]);

      alert('Question saved successfully!');
    } catch (err) {
      console.error('Error saving manual question:', err);
      setError(`Failed to save question: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSavingManualQuestion(false);
    }
  }

  // Render generated question preview (similar to pool question preview)
  function renderGeneratedQuestionPreview(question: GeneratedQuestion) {
    const data = question.question_data;

    if (question.question_type === 'data_insights') {
      const diType = data.di_type as string;

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {diType}
            </span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.difficulty}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
              AI Generated
            </span>
          </div>

          {diType === 'DS' && (
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-600 mb-2">Problem:</div>
                <MathJaxRenderer>{data.problem as string || ''}</MathJaxRenderer>
              </div>
              <div className="pl-4 border-l-2 border-blue-300 space-y-2">
                <div>
                  <span className="text-sm font-semibold text-blue-600">(1)</span>{' '}
                  <MathJaxRenderer>{data.statement1 as string || ''}</MathJaxRenderer>
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-600">(2)</span>{' '}
                  <MathJaxRenderer>{data.statement2 as string || ''}</MathJaxRenderer>
                </div>
              </div>
            </div>
          )}

          {diType === 'GI' && (
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-600 mb-2">Context:</div>
                <p>{data.context_text as string}</p>
              </div>
              {!!data.chart_config && (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">[Chart Preview: {String((data.chart_config as { title?: string }).title || 'Untitled')}]</p>
                  <p className="text-xs text-gray-400">Type: {String((data.chart_config as { type?: string }).type || 'unknown')}</p>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-600 mb-2">Statement:</div>
                <MathJaxRenderer>{data.statement_text as string || ''}</MathJaxRenderer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">BLANK 1 Options:</div>
                  <div className="space-y-1">
                    {(data.blank1_options as string[] || []).map((opt, i) => (
                      <div key={i} className={`px-2 py-1 rounded text-sm ${opt === data.blank1_correct ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">BLANK 2 Options:</div>
                  <div className="space-y-1">
                    {(data.blank2_options as string[] || []).map((opt, i) => (
                      <div key={i} className={`px-2 py-1 rounded text-sm ${opt === data.blank2_correct ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {diType === 'TA' && (
            <div className="space-y-4">
              <div className="font-medium">{String(data.table_title || '')}</div>
              {!!data.stimulus_text && <p className="text-gray-600">{String(data.stimulus_text)}</p>}
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {(data.column_headers as string[] || []).map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left text-sm font-medium border-b">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.table_data as string[][] || []).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-sm border-b">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-gray-600">Statements:</div>
                {(data.statements as Array<{ text: string; is_true: boolean }> || []).map((stmt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${stmt.is_true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {stmt.is_true ? 'TRUE' : 'FALSE'}
                    </span>
                    <span>{stmt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diType === 'TPA' && (
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-600 mb-2">Scenario:</div>
                <MathJaxRenderer>{data.scenario as string || ''}</MathJaxRenderer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">{data.column1_title as string}</div>
                <div className="text-sm font-medium text-gray-500">{data.column2_title as string}</div>
              </div>
              <div className="space-y-1">
                {(data.shared_options as string[] || []).map((opt, i) => (
                  <div key={i} className={`px-3 py-2 rounded text-sm ${
                    opt === (data.correct_answers as { col1?: string; col2?: string })?.col1 ||
                    opt === (data.correct_answers as { col1?: string; col2?: string })?.col2
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'bg-gray-100'
                  }`}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {diType === 'MSR' && (
            <div className="space-y-4">
              <div className="font-medium text-gray-600 mb-2">Sources:</div>
              {(data.sources as Array<{ tab_name: string; content_type: string; content?: string }> || []).map((source, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="font-medium text-sm text-blue-600 mb-2">{source.tab_name}</div>
                  {source.content_type === 'text' && <p className="text-sm">{source.content}</p>}
                  {source.content_type === 'table' && <p className="text-sm text-gray-500">[Table content]</p>}
                </div>
              ))}
              <div className="font-medium text-gray-600 mb-2">Questions:</div>
              {(data.questions as Array<{ text: string; options: Record<string, string>; correct_answer: string }> || []).map((q, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <p className="font-medium mb-2">{q.text}</p>
                  <div className="space-y-1">
                    {Object.entries(q.options || {}).map(([key, value]) => (
                      <div key={key} className={`px-2 py-1 rounded text-sm ${key === q.correct_answer ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-50'}`}>
                        ({key}) {value}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Multiple Choice (QR)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
            Multiple Choice
          </span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {question.difficulty}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
            AI Generated
          </span>
        </div>

        <div>
          <MathJaxRenderer>{data.question_text as string || ''}</MathJaxRenderer>
        </div>

        <div className="space-y-2 mt-4">
          {Object.entries((data.options || {}) as Record<string, string>).map(([key, value]) => {
            const isCorrect = question.answers.correct_answer === key;
            return (
              <div
                key={key}
                className={`px-4 py-3 rounded-lg border ${
                  isCorrect
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="font-semibold mr-2">({key})</span>
                <MathJaxRenderer>{value}</MathJaxRenderer>
              </div>
            );
          })}
        </div>

        {(data.categories as string[] || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {(data.categories as string[]).map((cat) => (
              <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Extract question text from question_data for comparison display
  function getQuestionText(questionData: any): string {
    // For QR (multiple choice)
    if (questionData.question_text) {
      return questionData.question_text;
    }
    // For DS (Data Sufficiency)
    if (questionData.di_type === 'DS') {
      return `${questionData.problem || ''}\n(1) ${questionData.statement1 || ''}\n(2) ${questionData.statement2 || ''}`;
    }
    // For GI (Graphics Interpretation)
    if (questionData.di_type === 'GI') {
      return `${questionData.context_text || ''}\n${questionData.statement_text || ''}`;
    }
    // For TA (Table Analysis)
    if (questionData.di_type === 'TA') {
      const statements = (questionData.statements as Array<{ text: string }> || [])
        .map((s, i) => `${i + 1}. ${s.text}`)
        .join('\n');
      return `${questionData.stimulus_text || ''}\n\nStatements:\n${statements}`;
    }
    // For TPA (Two-Part Analysis)
    if (questionData.di_type === 'TPA') {
      return questionData.scenario || '';
    }
    // For MSR (Multi-Source Reasoning)
    if (questionData.di_type === 'MSR') {
      const questions = (questionData.questions as Array<{ text: string }> || [])
        .map((q, i) => `Q${i + 1}: ${q.text}`)
        .join('\n');
      return questions || 'Multi-source reasoning question';
    }
    // Fallback
    return questionData.stem || questionData.problem || 'Question text not available';
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

  // Check if a question is used in another template/cycle (global check)
  // Returns usage info if the question is used ANYWHERE except the current template
  function getQuestionUsage(questionId: string): { templateTitle: string; materialType: string; cycle: GmatCycle } | null {
    const usages = usedQuestionIds.get(questionId);
    if (!usages || usages.length === 0) return null;

    // Find usage in a DIFFERENT template (not current one)
    const externalUsage = usages.find(u => u.templateId !== selectedTemplate?.id);
    if (externalUsage) {
      return {
        templateTitle: externalUsage.templateTitle,
        materialType: externalUsage.materialType,
        cycle: externalUsage.cycle
      };
    }

    return null;
  }

  // Check if question is already allocated in CURRENT template (any cycle)
  function isQuestionAllocatedInCurrentTemplate(questionId: string): { cycle: GmatCycle } | null {
    for (const cycle of GMAT_CYCLES) {
      if (cycle !== selectedCycle && cycleAllocations[cycle].has(questionId)) {
        return { cycle };
      }
    }
    return null;
  }

  // ============================================
  // VALIDATION SYSTEM
  // ============================================

  interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }

  interface CycleValidation {
    cycle: GmatCycle;
    totalAllocated: number;
    totalRequired: number;
    byDifficulty: {
      easy: { allocated: number; required: number; };
      medium: { allocated: number; required: number; };
      hard: { allocated: number; required: number; };
    };
    isComplete: boolean;
    difficultyMatch: boolean;
    errors: string[];
    warnings: string[];
  }

  // Validate allocation for a single cycle
  function validateCycleAllocation(cycle: GmatCycle): CycleValidation {
    const allocatedIds = cycleAllocations[cycle];
    const allocated = Array.from(allocatedIds)
      .map(id => poolQuestions.find(q => q.id === id))
      .filter(Boolean) as Question[];

    const totalRequired = requirementsForm?.total_questions || 0;
    const requiredDist = requirementsForm?.difficulty_distribution?.[cycle];

    const byDifficulty = {
      easy: {
        allocated: allocated.filter(q => q.difficulty === 'easy').length,
        required: requiredDist?.easy || 0
      },
      medium: {
        allocated: allocated.filter(q => q.difficulty === 'medium').length,
        required: requiredDist?.medium || 0
      },
      hard: {
        allocated: allocated.filter(q => q.difficulty === 'hard').length,
        required: requiredDist?.hard || 0
      },
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check difficulty distribution - this is the source of truth
    // Total is simply the sum of difficulty requirements
    let difficultyMatch = true;
    if (requiredDist) {
      if (byDifficulty.easy.allocated < byDifficulty.easy.required) {
        errors.push(`Need ${byDifficulty.easy.required - byDifficulty.easy.allocated} more easy questions`);
        difficultyMatch = false;
      } else if (byDifficulty.easy.allocated > byDifficulty.easy.required) {
        warnings.push(`${byDifficulty.easy.allocated - byDifficulty.easy.required} extra easy questions`);
      }

      if (byDifficulty.medium.allocated < byDifficulty.medium.required) {
        errors.push(`Need ${byDifficulty.medium.required - byDifficulty.medium.allocated} more medium questions`);
        difficultyMatch = false;
      } else if (byDifficulty.medium.allocated > byDifficulty.medium.required) {
        warnings.push(`${byDifficulty.medium.allocated - byDifficulty.medium.required} extra medium questions`);
      }

      if (byDifficulty.hard.allocated < byDifficulty.hard.required) {
        errors.push(`Need ${byDifficulty.hard.required - byDifficulty.hard.allocated} more hard questions`);
        difficultyMatch = false;
      } else if (byDifficulty.hard.allocated > byDifficulty.hard.required) {
        warnings.push(`${byDifficulty.hard.allocated - byDifficulty.hard.required} extra hard questions`);
      }
    }

    // Check total count against total_questions (the authoritative value)
    const isComplete = difficultyMatch && allocated.length >= totalRequired;

    // Check for questions without difficulty set
    const unsetDifficulty = allocated.filter(q => !q.difficulty).length;
    if (unsetDifficulty > 0) {
      warnings.push(`${unsetDifficulty} questions have no difficulty set`);
    }

    return {
      cycle,
      totalAllocated: allocated.length,
      totalRequired,
      byDifficulty,
      isComplete,
      difficultyMatch,
      errors,
      warnings,
    };
  }

  // Validate all cycles
  function validateAllCycles(): { cycles: CycleValidation[]; overall: ValidationResult } {
    const cycleValidations = GMAT_CYCLES.map(cycle => validateCycleAllocation(cycle));

    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Check for duplicate questions across cycles (same question in multiple cycles)
    const questionCycleMap = new Map<string, GmatCycle[]>();
    GMAT_CYCLES.forEach(cycle => {
      cycleAllocations[cycle].forEach(qId => {
        if (!questionCycleMap.has(qId)) {
          questionCycleMap.set(qId, []);
        }
        questionCycleMap.get(qId)!.push(cycle);
      });
    });

    const duplicates = Array.from(questionCycleMap.entries())
      .filter(([, cycles]) => cycles.length > 1);

    if (duplicates.length > 0) {
      allWarnings.push(`${duplicates.length} questions are used in multiple cycles`);
    }

    // Aggregate errors/warnings from all cycles
    cycleValidations.forEach(cv => {
      if (cv.errors.length > 0) {
        allErrors.push(`${cv.cycle}: ${cv.errors.join(', ')}`);
      }
    });

    const isValid = cycleValidations.every(cv => cv.isComplete && cv.difficultyMatch);

    return {
      cycles: cycleValidations,
      overall: {
        isValid,
        errors: allErrors,
        warnings: allWarnings,
      },
    };
  }

  // Get validation for current selection
  const validation = validateAllCycles();
  const currentCycleValidation = validation.cycles.find(cv => cv.cycle === selectedCycle);

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

    // MathJaxRenderer handles $...$ and $$...$$ delimiters automatically
    return <MathJaxRenderer>{text}</MathJaxRenderer>;
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
      <MathJaxProvider>
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

          {/* Validation Banner */}
          {selectedTemplate && (validation.overall.errors.length > 0 || validation.overall.warnings.length > 0) && (
            <div className={`rounded-xl p-4 mb-6 border-2 ${
              validation.overall.errors.length > 0
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className={`text-xl mt-0.5 ${
                    validation.overall.errors.length > 0 ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                <div className="flex-1">
                  <h4 className={`font-bold mb-2 ${
                    validation.overall.errors.length > 0 ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {validation.overall.errors.length > 0 ? 'Allocation Incomplete' : 'Allocation Warnings'}
                  </h4>
                  {validation.overall.errors.length > 0 && (
                    <ul className="space-y-1 text-sm text-red-600 mb-2">
                      {validation.overall.errors.map((err, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                  {validation.overall.warnings.length > 0 && (
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {validation.overall.warnings.map((warn, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-500">⚠</span>
                          {warn}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All Cycles Complete Banner */}
          {selectedTemplate && validation.overall.isValid && validation.overall.warnings.length === 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} />
                All cycles are properly allocated with correct difficulty distributions!
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

              {/* Cycle Selector with Validation Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cycle</label>
                <div className="flex flex-wrap gap-1">
                  {GMAT_CYCLES.map(cycle => {
                    const cycleVal = validation.cycles.find(cv => cv.cycle === cycle);
                    const hasErrors = cycleVal && cycleVal.errors.length > 0;
                    const hasWarnings = cycleVal && cycleVal.warnings.length > 0;
                    const isComplete = cycleVal?.isComplete && cycleVal?.difficultyMatch;

                    return (
                      <button
                        key={cycle}
                        onClick={() => setSelectedCycle(cycle)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                          selectedCycle === cycle
                            ? `bg-gradient-to-r ${CYCLE_COLORS[cycle].gradient} text-white`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cycle}
                        {selectedTemplate && (
                          <>
                            {isComplete && !hasWarnings && (
                              <FontAwesomeIcon icon={faCheckCircle} className={`text-xs ${selectedCycle === cycle ? 'text-white' : 'text-green-500'}`} />
                            )}
                            {hasErrors && (
                              <FontAwesomeIcon icon={faExclamationTriangle} className={`text-xs ${selectedCycle === cycle ? 'text-white' : 'text-red-500'}`} />
                            )}
                            {!hasErrors && hasWarnings && (
                              <FontAwesomeIcon icon={faExclamationTriangle} className={`text-xs ${selectedCycle === cycle ? 'text-white' : 'text-yellow-500'}`} />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
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
                  {/* Generate with AI Button - Only for QR and DI sections */}
                  {selectedSection !== 'Verbal Reasoning' && (
                    <button
                      onClick={() => {
                        // Pre-populate modal with current UI filter values if set, otherwise use defaults
                        setGenerateCategories(categoryFilter ? [categoryFilter] : []);
                        const validDifficulties = ['easy', 'medium', 'hard'] as const;
                        const difficulty = validDifficulties.includes(difficultyFilter as typeof validDifficulties[number])
                          ? (difficultyFilter as 'easy' | 'medium' | 'hard')
                          : 'medium';
                        setGenerateDifficulty(difficulty);
                        setGenerateCount(3);
                        setShowGenerateModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faRobot} />
                      Generate with AI
                    </button>
                  )}

                  {/* Manual Insert Button */}
                  <button
                    onClick={() => setShowManualInsertModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Manual Insert
                  </button>

                  {/* Question Checker Button */}
                  <button
                    onClick={() => setShowQuestionChecker(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                    Duplicate Checker
                  </button>
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

                  {/* Category Filter */}
                  {availableCategories.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm bg-blue-50 border-blue-200"
                      >
                        <option value="">All Categories</option>
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {categoryFilter && (
                        <button
                          onClick={() => setCategoryFilter('')}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Clear category filter"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Usage Filter Toggle */}
                  <div className="flex items-center gap-1 bg-white border rounded-lg p-0.5">
                    <button
                      onClick={() => setUsageFilter('all')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        usageFilter === 'all'
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setUsageFilter('unused')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        usageFilter === 'unused'
                          ? 'bg-green-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Unused
                    </button>
                    <button
                      onClick={() => setUsageFilter('used')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        usageFilter === 'used'
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Used
                    </button>
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
                      const externalUsage = getQuestionUsage(question.id);
                      const internalUsage = isQuestionAllocatedInCurrentTemplate(question.id);
                      const isUsedElsewhere = externalUsage !== null;
                      const isUsedInOtherCycle = internalUsage !== null;
                      const isDisabled = isUsedElsewhere || isUsedInOtherCycle;

                      return (
                        <div
                          key={question.id}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isAllocated
                              ? 'border-green-500 bg-green-50'
                              : isUsedElsewhere
                              ? 'border-red-300 bg-red-50 opacity-60'
                              : isUsedInOtherCycle
                              ? 'border-orange-300 bg-orange-50 opacity-75'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => !isDisabled && toggleQuestionAllocation(question.id)}
                              disabled={isDisabled}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isAllocated
                                  ? 'bg-green-500 text-white'
                                  : isUsedElsewhere
                                  ? 'bg-red-400 text-white cursor-not-allowed'
                                  : isUsedInOtherCycle
                                  ? 'bg-orange-400 text-white cursor-not-allowed'
                                  : 'border-2 border-gray-300 hover:border-brand-green cursor-pointer'
                              }`}
                              title={
                                isUsedElsewhere
                                  ? `Used in ${externalUsage.materialType} (${externalUsage.cycle})`
                                  : isUsedInOtherCycle
                                  ? `Already allocated in ${internalUsage.cycle} cycle`
                                  : isAllocated
                                  ? 'Click to remove'
                                  : 'Click to add'
                              }
                            >
                              {isAllocated && <FontAwesomeIcon icon={faCheck} className="text-sm" />}
                              {(isUsedElsewhere || isUsedInOtherCycle) && !isAllocated && <FontAwesomeIcon icon={faMinus} className="text-sm" />}
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
                                {/* Categories */}
                                {question.question_data?.categories && question.question_data.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {question.question_data.categories.map((cat: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-200"
                                        title={`Category: ${cat}`}
                                      >
                                        {cat}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {isUsedElsewhere && (
                                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full" title={externalUsage.templateTitle}>
                                    Used in {externalUsage.materialType} ({externalUsage.cycle})
                                  </span>
                                )}
                                {isUsedInOtherCycle && !isUsedElsewhere && (
                                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                    In {internalUsage.cycle} cycle
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

                  {/* Progress - use total_questions as the target */}
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

                {/* Current Cycle Validation Details */}
                {currentCycleValidation && (currentCycleValidation.errors.length > 0 || currentCycleValidation.warnings.length > 0) && (
                  <div className={`rounded-xl p-4 border-2 ${
                    currentCycleValidation.errors.length > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <h4 className={`font-bold mb-2 text-sm flex items-center gap-2 ${
                      currentCycleValidation.errors.length > 0 ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      {selectedCycle} Issues
                    </h4>
                    {currentCycleValidation.errors.length > 0 && (
                      <ul className="space-y-1 text-xs text-red-600 mb-2">
                        {currentCycleValidation.errors.map((err, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>{err}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {currentCycleValidation.warnings.length > 0 && (
                      <ul className="space-y-1 text-xs text-yellow-700">
                        {currentCycleValidation.warnings.map((warn, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-yellow-500 mt-0.5">⚠</span>
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Current Cycle Complete Indicator */}
                {currentCycleValidation && currentCycleValidation.isComplete && currentCycleValidation.difficultyMatch && currentCycleValidation.warnings.length === 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="text-green-700 font-medium text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      {selectedCycle} cycle allocation complete!
                    </p>
                  </div>
                )}

                {/* Save Button */}
                <div className="space-y-2">
                  {hasUnsavedChanges && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                      You have unsaved changes. Save before switching to another material type.
                    </div>
                  )}
                  <button
                    onClick={saveAllocation}
                    disabled={saving}
                    className={`w-full py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
                      hasUnsavedChanges
                        ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse'
                        : 'bg-brand-green hover:bg-green-600'
                    }`}
                    title="Save allocations for all 3 cycles (Foundation, Development, Excellence) for this material"
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
                        {hasUnsavedChanges && <span className="text-xs ml-1">(unsaved)</span>}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Saves allocations for all 3 cycles of this material type
                  </p>
                </div>
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
                {(() => {
                  const externalUsage = getQuestionUsage(previewingQuestion.id);
                  const internalUsage = isQuestionAllocatedInCurrentTemplate(previewingQuestion.id);
                  const isUsedElsewhere = externalUsage !== null;
                  const isUsedInOtherCycle = internalUsage !== null;
                  const isDisabled = isUsedElsewhere || isUsedInOtherCycle;
                  const isAllocated = allocatedQuestionIds.has(previewingQuestion.id);

                  return (
                    <>
                      {!isAllocated && !isDisabled && (
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
                      {isAllocated && (
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
                      {isUsedElsewhere && (
                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                          Used in {externalUsage.materialType} ({externalUsage.cycle})
                        </span>
                      )}
                      {isUsedInOtherCycle && !isUsedElsewhere && (
                        <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm">
                          Already in {internalUsage.cycle} cycle
                        </span>
                      )}
                    </>
                  );
                })()}
                <button
                  onClick={() => {
                    setPreviewingQuestion(null);
                    setEditingCategories(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Category Editor Section */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Categories</span>
                {!editingCategories ? (
                  <button
                    onClick={handleStartEditingCategories}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategories(false);
                        setNewCategoryInput('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      disabled={savingCategories}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategories}
                      disabled={savingCategories}
                      className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                    >
                      {savingCategories ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                      ) : (
                        <FontAwesomeIcon icon={faSave} className="text-xs" />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>

              {!editingCategories ? (
                // Display mode
                <div className="flex flex-wrap gap-2">
                  {(previewingQuestion.question_data?.categories as string[] || []).length > 0 ? (
                    (previewingQuestion.question_data?.categories as string[]).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">No categories assigned</span>
                  )}
                </div>
              ) : (
                // Edit mode
                <div className="space-y-3">
                  {/* Current categories */}
                  <div className="flex flex-wrap gap-2">
                    {editedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                      >
                        {cat}
                        <button
                          onClick={() => handleRemoveCategory(cat)}
                          className="hover:text-red-600 ml-1"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </span>
                    ))}
                    {editedCategories.length === 0 && (
                      <span className="text-gray-400 text-sm italic">No categories</span>
                    )}
                  </div>

                  {/* Add new category */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      placeholder="Type new category..."
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryInput.trim()}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick add from existing categories */}
                  {availableCategories.filter(c => !editedCategories.includes(c)).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quick add:</p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {availableCategories
                          .filter(c => !editedCategories.includes(c))
                          .map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setEditedCategories(prev => [...prev, cat])}
                              className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                            >
                              + {cat}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {renderQuestionContent(previewingQuestion)}
            </div>
          </div>
        </div>
      )}

      {/* AI Question Generation Modal - Two Column Layout */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isGenerating && setShowGenerateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <FontAwesomeIcon icon={faRobot} className="text-2xl" />
                <div>
                  <h3 className="font-bold text-xl">Generate GMAT Questions</h3>
                  <p className="text-purple-100 text-sm">
                    {selectedSection} - {GMAT_STRUCTURE[selectedSection].topics.find(t => t.id === selectedTopicId)?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Categories */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categories
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        (click to select/deselect)
                      </span>
                    </label>
                    <div className="border rounded-lg bg-gray-50 p-3 max-h-64 overflow-y-auto">
                      {availableCategories.length > 0 ? (
                        <div className="space-y-2">
                          {availableCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setGenerateCategories(prev =>
                                  prev.includes(cat)
                                    ? prev.filter(c => c !== cat)
                                    : [...prev, cat]
                                );
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                generateCategories.includes(cat)
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={generateCategories.includes(cat) ? faCheck : faPlus}
                                className="w-4"
                              />
                              {cat}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No categories available</span>
                      )}
                    </div>
                    {generateCategories.length > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-purple-600">
                          {generateCategories.length} categor{generateCategories.length === 1 ? 'y' : 'ies'} selected
                        </p>
                        <button
                          onClick={() => setGenerateCategories([])}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-5">
                  {/* Difficulty Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setGenerateDifficulty(diff)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            generateDifficulty === diff
                              ? diff === 'easy'
                                ? 'bg-green-500 text-white'
                                : diff === 'medium'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} question{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Matching Questions Preview */}
                  <div className={`rounded-lg p-4 ${
                    generationMatchingQuestions.exactMatch > 0
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon
                        icon={faFilter}
                        className={generationMatchingQuestions.exactMatch > 0 ? 'text-blue-500' : 'text-amber-500'}
                      />
                      <span className="font-semibold text-gray-700">Example Questions for AI:</span>
                    </div>
                    <div className="text-sm">
                      {generationMatchingQuestions.exactMatch > 0 ? (
                        <div className="text-blue-700">
                          <p>
                            <span className="font-bold text-lg">{generationMatchingQuestions.exactMatch}</span> questions match your criteria
                          </p>
                          <div className="text-xs text-blue-600 mt-2 space-y-1">
                            <p>Section: <span className="font-medium">{selectedSection}</span> ({generationMatchingQuestions.sectionTopicTotal} total)</p>
                            <p>Difficulty: <span className="font-medium">{generateDifficulty}</span></p>
                            <p>Categories: <span className="font-medium">{generateCategories.length > 0 ? generateCategories.join(', ') : 'Any'}</span></p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-amber-700">
                          <p>
                            No exact matches. Will use <span className="font-bold">{generationMatchingQuestions.sectionTopicTotal}</span> questions from this section as examples.
                          </p>
                          <div className="text-xs text-amber-600 mt-2 space-y-1">
                            <p>Section: <span className="font-medium">{selectedSection}</span></p>
                            <p>Difficulty: <span className="font-medium">{generateDifficulty}</span></p>
                            <p>Categories: <span className="font-medium">{generateCategories.length > 0 ? generateCategories.join(', ') : 'Any'}</span></p>
                          </div>
                          <p className="mt-2 text-xs">Try selecting different categories or difficulty.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />
                      <span className="font-medium">Estimated Cost:</span>
                      <span className="font-bold text-green-600">
                        ~${estimateGenerationCost(generateCount).toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on average token usage. Actual cost may vary.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || poolQuestions.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMagic} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Question Validation Modal - Side-by-Side Layout */}
      {showValidationModal && generatedQuestions.length > 0 && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faRobot} className="text-2xl" />
                  <div>
                    <h3 className="font-bold text-xl">
                      Review Generated Question ({currentGeneratedIndex + 1}/{generatedQuestions.length})
                    </h3>
                    <p className="text-purple-100 text-sm">
                      Accepted: {acceptedCount} | Rejected: {rejectedCount}
                    </p>
                  </div>
                </div>
                {generationCost && (
                  <div className="bg-white/20 rounded-lg px-3 py-1.5">
                    <span className="text-sm">
                      Cost: ${generationCost.cost_usd.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content - Side by Side Layout */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Panel - Generated Question */}
              <div className="flex-1 flex flex-col border-r overflow-hidden">
                <div className="p-3 bg-purple-50 border-b flex-shrink-0">
                  <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMagic} />
                    Generated Question
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {editingGeneratedJson ? (
                    <div className="space-y-4 h-full flex flex-col">
                      <label className="block text-sm font-semibold text-gray-700">
                        Edit Question JSON
                      </label>
                      <textarea
                        value={generatedJsonEdit}
                        onChange={(e) => setGeneratedJsonEdit(e.target.value)}
                        className="flex-1 w-full font-mono text-sm p-4 border rounded-lg bg-gray-50 min-h-[300px]"
                        spellCheck={false}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingGeneratedJson(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(generatedJsonEdit);
                              setGeneratedQuestions(prev => {
                                const updated = [...prev];
                                updated[currentGeneratedIndex] = {
                                  ...updated[currentGeneratedIndex],
                                  question_data: parsed.question_data,
                                  answers: parsed.answers,
                                };
                                return updated;
                              });
                              setEditingGeneratedJson(false);
                            } catch (err) {
                              alert('Invalid JSON. Please check your syntax.');
                            }
                          }}
                          className="px-4 py-2 bg-brand-green text-white rounded-lg font-medium"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Question Preview */}
                      <div className="border rounded-xl p-4 bg-gray-50">
                        {renderGeneratedQuestionPreview(generatedQuestions[currentGeneratedIndex])}
                      </div>

                      {/* Correct Answer Display */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          <span className="font-semibold">Correct Answer:</span>
                          <code className="bg-green-100 px-2 py-1 rounded">
                            {JSON.stringify(generatedQuestions[currentGeneratedIndex].answers.correct_answer)}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Example Questions for Comparison */}
              <div className="w-96 flex flex-col bg-blue-50/50 overflow-hidden">
                <div className="p-3 bg-blue-100 border-b flex-shrink-0">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardList} />
                    Existing Questions ({exampleQuestionsUsed.length})
                  </h4>
                  <p className="text-xs text-blue-600 mt-1">
                    Compare to ensure the generated question is unique
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {exampleQuestionsUsed.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No existing questions to compare
                    </p>
                  ) : (
                    exampleQuestionsUsed.map((example, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            example.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            example.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {example.difficulty}
                          </span>
                          {example.question_data?.gmat_question_id && (
                            <span className="text-xs text-gray-400 ml-auto">
                              {String(example.question_data.gmat_question_id).includes('AI__') ? '🤖' : '📚'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                          <MathJaxRenderer>
                            {getQuestionText(example.question_data)}
                          </MathJaxRenderer>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => {
                  const currentQ = generatedQuestions[currentGeneratedIndex];
                  setGeneratedJsonEdit(JSON.stringify({
                    question_data: currentQ.question_data,
                    answers: currentQ.answers,
                  }, null, 2));
                  setEditingGeneratedJson(true);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit JSON
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleRejectQuestion}
                  className="px-5 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleAcceptQuestion}
                  className="px-5 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Accept & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Summary Modal */}
      {!showValidationModal && generatedQuestions.length === 0 && (acceptedCount > 0 || rejectedCount > 0) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setAcceptedCount(0);
            setRejectedCount(0);
            setGenerationCost(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">
                Generation Complete
              </h3>
              <div className="flex justify-center gap-6 my-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{acceptedCount}</div>
                  <div className="text-sm text-gray-500">Accepted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{rejectedCount}</div>
                  <div className="text-sm text-gray-500">Rejected</div>
                </div>
              </div>
              {generationCost && (
                <p className="text-gray-600">
                  Total cost: <span className="font-semibold">${generationCost.cost_usd.toFixed(4)}</span>
                </p>
              )}
              <button
                onClick={() => {
                  setAcceptedCount(0);
                  setRejectedCount(0);
                  setGenerationCost(null);
                }}
                className="mt-4 px-6 py-2 bg-brand-green text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Question Insert Modal */}
      {showManualInsertModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !savingManualQuestion && setShowManualInsertModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                  <div>
                    <h3 className="font-bold text-xl">Manual Question Insert</h3>
                    <p className="text-green-100 text-sm">Add a new question to the GMAT pool</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManualInsertModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <div className="space-y-4">
                  {/* Section Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                    <div className="flex gap-2">
                      {(Object.keys(GMAT_STRUCTURE) as SectionName[]).map(section => (
                        <button
                          key={section}
                          onClick={() => {
                            setManualQuestionSection(section);
                            if (section === 'Data Insights') {
                              setManualQuestionType('data_insights');
                            } else {
                              setManualQuestionType('multiple_choice');
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            manualQuestionSection === section
                              ? 'bg-brand-dark text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {GMAT_STRUCTURE[section].code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setManualQuestionType('multiple_choice')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          manualQuestionType === 'multiple_choice'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Multiple Choice
                      </button>
                      <button
                        onClick={() => setManualQuestionType('data_insights')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          manualQuestionType === 'data_insights'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Data Insights
                      </button>
                    </div>
                  </div>

                  {/* DI Type (only for Data Insights) */}
                  {manualQuestionType === 'data_insights' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">DI Type</label>
                      <div className="flex flex-wrap gap-2">
                        {(['DS', 'GI', 'TA', 'TPA', 'MSR'] as DIType[]).map(diType => (
                          <button
                            key={diType}
                            onClick={() => setManualQuestionDIType(diType)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              manualQuestionDIType === diType
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {diType}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Note: Use JSON mode for Data Insights questions - structures vary by type.
                      </p>
                    </div>
                  )}

                  {/* VR Type (only for Verbal Reasoning) */}
                  {manualQuestionSection === 'Verbal Reasoning' && manualQuestionType === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Verbal Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setManualQuestionVRType('critical_reasoning')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            manualQuestionVRType === 'critical_reasoning'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Critical Reasoning
                        </button>
                        <button
                          onClick={() => setManualQuestionVRType('reading_comprehension')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            manualQuestionVRType === 'reading_comprehension'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Reading Comprehension
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map(diff => (
                        <button
                          key={diff}
                          onClick={() => setManualQuestionDifficulty(diff)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            manualQuestionDifficulty === diff
                              ? diff === 'easy'
                                ? 'bg-green-500 text-white'
                                : diff === 'medium'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* JSON Mode Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">JSON Mode</span>
                    <button
                      onClick={() => setManualQuestionJsonMode(!manualQuestionJsonMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        manualQuestionJsonMode ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          manualQuestionJsonMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Form Fields or JSON Editor */}
                  {manualQuestionJsonMode ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Question Data JSON
                      </label>
                      <textarea
                        value={manualQuestionJson}
                        onChange={(e) => setManualQuestionJson(e.target.value)}
                        placeholder={manualQuestionType === 'data_insights' && manualQuestionDIType === 'DS' ? `{
  "di_type": "DS",
  "problem": "Your problem statement here...",
  "statement1": "Statement (1)...",
  "statement2": "Statement (2)...",
  "categories": ["Data Sufficiency"],
  "answer_choices": {
    "A": "Statement (1) ALONE is sufficient...",
    "B": "Statement (2) ALONE is sufficient...",
    "C": "BOTH statements TOGETHER are sufficient...",
    "D": "EACH statement ALONE is sufficient.",
    "E": "Statements (1) and (2) TOGETHER are NOT sufficient."
  },
  "correct_answer": "A",
  "answers": { "correct_answer": ["A"] }
}` : `{
  "question_text": "Your question here...",
  "options": {
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D",
    "e": "Option E"
  },
  "answers": { "correct_answer": "a" }
}`}
                        className="w-full h-64 font-mono text-sm p-4 border rounded-lg bg-gray-50"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Passage/Argument for Verbal Reasoning */}
                      {manualQuestionSection === 'Verbal Reasoning' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {manualQuestionVRType === 'critical_reasoning' ? 'Argument/Stimulus' : 'Passage'}
                            <span className="text-gray-400 font-normal ml-1">(optional)</span>
                          </label>
                          <textarea
                            value={manualQuestionPassage}
                            onChange={(e) => setManualQuestionPassage(e.target.value)}
                            placeholder={manualQuestionVRType === 'critical_reasoning'
                              ? "Enter the argument or stimulus that the question refers to..."
                              : "Enter the reading passage that the question refers to..."}
                            className="w-full h-32 p-3 border rounded-lg text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {manualQuestionVRType === 'critical_reasoning'
                              ? "The argument or scenario that the question asks about."
                              : "The reading passage that contains the information for answering the question."}
                          </p>
                        </div>
                      )}

                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Question Text
                        </label>
                        <textarea
                          value={manualQuestionText}
                          onChange={(e) => setManualQuestionText(e.target.value)}
                          placeholder={manualQuestionSection === 'Verbal Reasoning'
                            ? "Enter the question (e.g., 'Which of the following most weakens the argument above?')"
                            : "Enter the question text... (supports LaTeX with $...$)"}
                          className="w-full h-24 p-3 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Answer Options
                        </label>
                        <div className="space-y-2">
                          {['a', 'b', 'c', 'd', 'e'].map(opt => (
                            <div key={opt} className="flex items-center gap-2">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                manualQuestionCorrectAnswer === opt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {opt.toUpperCase()}
                              </span>
                              <input
                                type="text"
                                value={manualQuestionOptions[opt] || ''}
                                onChange={(e) => setManualQuestionOptions(prev => ({
                                  ...prev,
                                  [opt]: e.target.value
                                }))}
                                placeholder={`Option ${opt.toUpperCase()}`}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                              />
                              <button
                                onClick={() => setManualQuestionCorrectAnswer(opt)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  manualQuestionCorrectAnswer === opt
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {manualQuestionCorrectAnswer === opt ? 'Correct' : 'Set Correct'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Similarity Check */}
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faCopy} />
                      Similarity Check
                    </h4>
                    <p className="text-sm text-orange-700 mb-3">
                      Check if similar questions already exist in the pool before saving.
                    </p>
                    <button
                      onClick={async () => {
                        setCheckingSimilarity(true);
                        setSimilarQuestions([]);

                        const textToCheck = manualQuestionJsonMode
                          ? (() => {
                              try {
                                const parsed = JSON.parse(manualQuestionJson);
                                return parsed.question_text || parsed.problem || '';
                              } catch {
                                return '';
                              }
                            })()
                          : manualQuestionText;

                        if (!textToCheck.trim()) {
                          setCheckingSimilarity(false);
                          return;
                        }

                        // Check against all pool questions
                        const similar: Array<{ question: Question; similarity: number }> = [];
                        for (const q of poolQuestions) {
                          const existingText = q.question_data?.question_text ||
                                               q.question_data?.problem ||
                                               '';
                          if (!existingText) continue;

                          const similarity = calculateSimilarity(textToCheck, existingText);
                          if (similarity >= 0.5) {
                            similar.push({ question: q, similarity });
                          }
                        }

                        // Sort by similarity descending
                        similar.sort((a, b) => b.similarity - a.similarity);
                        setSimilarQuestions(similar.slice(0, 10)); // Show top 10
                        setCheckingSimilarity(false);
                      }}
                      disabled={checkingSimilarity}
                      className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {checkingSimilarity ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSearch} />
                          Check for Similar Questions
                        </>
                      )}
                    </button>
                  </div>

                  {/* Similar Questions Results */}
                  {similarQuestions.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        {similarQuestions.length} Similar Question{similarQuestions.length > 1 ? 's' : ''} Found
                      </h4>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {similarQuestions.map((item, idx) => (
                          <div key={item.question.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">
                                Q{item.question.question_number}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                item.similarity >= 0.8 ? 'bg-red-100 text-red-700' :
                                item.similarity >= 0.6 ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {Math.round(item.similarity * 100)}% similar
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {item.question.question_data?.question_text ||
                               item.question.question_data?.problem ||
                               'No text available'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {similarQuestions.length === 0 && !checkingSimilarity && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        Run similarity check to find potential duplicates
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => {
                  setShowManualInsertModal(false);
                  setManualQuestionText('');
                  setManualQuestionPassage('');
                  setManualQuestionJson('');
                  setManualQuestionOptions({ a: '', b: '', c: '', d: '', e: '' });
                  setSimilarQuestions([]);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveManualQuestion}
                disabled={savingManualQuestion}
                className="px-6 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingManualQuestion ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Question Checker Modal */}
      {showQuestionChecker && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !checkerRunning && setShowQuestionChecker(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCopy} className="text-2xl" />
                  <div>
                    <h3 className="font-bold text-xl">Duplicate Question Checker</h3>
                    <p className="text-orange-100 text-sm">Scan all questions for potential duplicates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuestionChecker(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Run Check Panel */}
              {!checkerRunning && duplicateGroups.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={faCopy} className="text-4xl text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    Ready to Scan for Duplicates
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This will compare all {poolQuestions.length} questions in the pool to find potential duplicates
                    (50%+ similarity in question text and options).
                  </p>
                  <button
                    onClick={runDuplicateCheck}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                    Start Duplicate Scan
                  </button>
                </div>
              )}

              {/* Progress */}
              {checkerRunning && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-orange-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-4">
                    Scanning Questions...
                  </h3>
                  <div className="w-64 mx-auto">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                        style={{ width: `${checkerProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{checkerProgress}% complete</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {!checkerRunning && duplicateGroups.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-brand-dark">
                      Found {duplicateGroups.length} Potential Duplicate Pair{duplicateGroups.length > 1 ? 's' : ''}
                    </h3>
                    <button
                      onClick={() => {
                        setDuplicateGroups([]);
                        setCheckerProgress(0);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear Results
                    </button>
                  </div>

                  {duplicateGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                          {Math.round(group.similarity * 100)}% Similar
                        </span>
                        <span className="text-sm text-gray-500">
                          {group.questions.length} questions
                        </span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {group.questions.map((question) => {
                          const questionAllocations = usedQuestionIds.get(question.id);
                          const isAllocated = questionAllocations && questionAllocations.length > 0;
                          return (
                          <div key={question.id} className={`bg-white p-4 rounded-lg border ${isAllocated ? 'border-green-300 ring-1 ring-green-200' : ''}`}>
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-brand-dark">Q{question.question_number}</span>
                                {isAllocated && (
                                  <span
                                    className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium cursor-help"
                                    title={`Allocated in: ${questionAllocations.map(a => `${a.templateTitle} (${a.cycle})`).join(', ')}`}
                                  >
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                    Allocated ({questionAllocations.length})
                                  </span>
                                )}
                                {question.difficulty && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[question.difficulty]?.bg} ${DIFFICULTY_COLORS[question.difficulty]?.text}`}>
                                    {question.difficulty}
                                  </span>
                                )}
                                {question.question_data?.di_type && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    {question.question_data.di_type}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">{question.section}</span>
                            </div>

                            {/* Question Content with MathJax */}
                            <div className="text-sm text-gray-700 mb-3 max-h-32 overflow-y-auto prose prose-sm">
                              <MathJaxRenderer>
                                {question.question_data?.question_text ||
                                 question.question_data?.problem ||
                                 question.question_data?.scenario ||
                                 'No text available'}
                              </MathJaxRenderer>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t">
                              <button
                                onClick={() => setPreviewingQuestion(question)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faEye} />
                                Preview
                              </button>
                              <button
                                onClick={() => markQuestionForReview(question.id)}
                                disabled={markingForReviewId === question.id}
                                className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {markingForReviewId === question.id ? (
                                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                  <FontAwesomeIcon icon={faFlag} />
                                )}
                                Review
                              </button>
                              <button
                                onClick={() => deleteQuestion(question.id)}
                                disabled={deletingQuestionId === question.id}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {deletingQuestionId === question.id ? (
                                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                  <FontAwesomeIcon icon={faTrash} />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        );})}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Duplicates Found */}
              {!checkerRunning && duplicateGroups.length === 0 && checkerProgress > 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    No Duplicates Found
                  </h3>
                  <p className="text-gray-600">
                    All questions in the pool appear to be unique.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </MathJaxProvider>
    </Layout>
  );
}
