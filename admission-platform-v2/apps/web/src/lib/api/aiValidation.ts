import { supabase } from '../supabase';

export interface ValidationJob {
  id: string;
  started_at: string;
  completed_at: string | null;
  paused_at: string | null;
  total_questions: number;
  processed_count: number;
  passed_count: number;
  flagged_count: number;
  failed_count: number;
  current_batch: any;
  error_log: any[];
  validated_questions?: any[];
  flag_statistics: Record<string, number>;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'stopped';
  logs: string[];
}

export interface StartValidationParams {
  test_type?: string;
  limit?: number;
}

export interface ValidationJobResponse {
  success: boolean;
  job_id?: string;
  total_questions?: number;
  job?: ValidationJob;
  error?: string;
}

/**
 * Start a new AI validation job (frontend-based batching)
 */
export async function startValidation(
  params: StartValidationParams = {}
): Promise<ValidationJobResponse> {
  try {
    const { test_type, limit } = params;
    const BATCH_SIZE = 5; // Process 5 questions concurrently

    // Build query for questions to validate (exclude PDF and open_ended)
    let query = supabase
      .from('2V_questions')
      .select('id', { count: 'exact' })
      .is('ai_validation', null)
      .neq('question_type', 'pdf')
      .neq('question_type', 'open_ended');

    if (test_type) {
      query = query.eq('test_type', test_type);
    }

    // Get total count of questions to validate
    const { count: totalQuestions, error: countError } = await query;

    if (countError) {
      throw new Error(`Failed to count questions: ${countError.message}`);
    }

    const actualTotal = limit && limit < totalQuestions! ? limit : totalQuestions!;

    if (actualTotal === 0) {
      return { success: false, error: 'No questions to validate' };
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('validation_jobs')
      .insert({
        total_questions: actualTotal,
        status: 'running',
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    console.log(`✅ Created job ${job.id} for ${actualTotal} questions`);

    // Start processing in background
    processValidationJob(job.id, test_type, limit).catch((error) => {
      console.error('❌ Job processing failed:', error);
    });

    return {
      success: true,
      job_id: job.id,
      total_questions: actualTotal,
    };
  } catch (error: any) {
    console.error('Failed to start validation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main processing loop for validation job (runs in background)
 */
async function processValidationJob(
  jobId: string,
  test_type?: string,
  limit?: number
): Promise<void> {
  const BATCH_SIZE = 5;

  console.log(`🔄 Processing validation job ${jobId}...`);

  try {
    while (true) {
      // Check job status
      const { data: job, error: jobError } = await supabase
        .from('validation_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        console.error('Failed to fetch job:', jobError);
        break;
      }

      // Check if job should stop
      if (job.status === 'paused') {
        console.log(`⏸️ Job ${jobId} is paused, waiting...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      if (job.status === 'stopped') {
        console.log(`⏹️ Job ${jobId} was stopped`);
        break;
      }

      // Check if all questions processed
      if (job.processed_count >= job.total_questions) {
        console.log(`✅ Job ${jobId} completed!`);
        await supabase
          .from('validation_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);
        break;
      }

      // Fetch next batch of questions to validate (with full data for display)
      // Exclude PDF and open_ended questions
      let query = supabase
        .from('2V_questions')
        .select('id, question_data, answers, test_type, question_number, question_type, section')
        .is('ai_validation', null)
        .neq('question_type', 'pdf')
        .neq('question_type', 'open_ended')
        .limit(BATCH_SIZE);

      if (test_type) {
        query = query.eq('test_type', test_type);
      }

      const { data: questions, error: questionsError } = await query;

      if (questionsError) {
        console.error('Failed to fetch questions:', questionsError);
        break;
      }

      if (!questions || questions.length === 0) {
        console.log('No more questions to validate');
        await supabase
          .from('validation_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);
        break;
      }

      // Update current batch
      const questionIds = questions.map((q) => q.id);
      await supabase
        .from('validation_jobs')
        .update({
          current_batch: {
            question_ids: questionIds,
            started_at: new Date().toISOString(),
          },
        })
        .eq('id', jobId);

      console.log(`📦 Processing batch of ${questions.length} questions...`);

      // Process batch concurrently by calling ai-validate-question directly
      const results = await Promise.allSettled(
        questions.map((question) =>
          validateQuestionDirect(question.id)
        )
      );

      // Count results
      let successCount = 0;
      let failedCount = 0;
      let verifiedCount = 0;
      let flaggedCount = 0;
      const errors: any[] = [];
      const validatedQuestions: any[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          const validation = result.value;
          const question = questions[index];

          // Track validated question details with full question data
          validatedQuestions.push({
            question_id: question.id,
            question_data: question.question_data,
            answers: question.answers,
            test_type: question.test_type,
            question_number: question.question_number,
            question_type: question.question_type,
            section: question.section,
            validation: validation,
            timestamp: new Date().toISOString(),
          });

          // Count based on flags
          if (validation?.flags?.includes('ai_verified_correct')) {
            verifiedCount++;
          } else if (validation?.flags && validation.flags.length > 0) {
            flaggedCount++;
          } else {
            // No flags at all - still count as verified
            verifiedCount++;
          }
        } else {
          failedCount++;
          errors.push({
            question_id: questions[index].id,
            error: result.reason?.message || 'Unknown error',
            error_code: 'VALIDATION_FAILED',
            attempt: 3,
            timestamp: new Date().toISOString(),
            will_retry: false,
          });
        }
      });

      // Update job progress with validated questions details
      const existingValidated = job.validated_questions || [];
      await supabase
        .from('validation_jobs')
        .update({
          processed_count: job.processed_count + questions.length,
          passed_count: job.passed_count + verifiedCount,
          flagged_count: job.flagged_count + flaggedCount,
          failed_count: job.failed_count + failedCount,
          error_log: [...(job.error_log || []), ...errors],
          validated_questions: [...existingValidated, ...validatedQuestions],
          current_batch: null,
        })
        .eq('id', jobId);

      console.log(
        `📊 Batch complete: ${successCount} success, ${failedCount} failed`
      );

      // Small delay before next batch
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error: any) {
    console.error('❌ Job processing error:', error);

    // Add to error log
    const errorEntry = {
      question_id: 'N/A',
      error: error.message || 'Unknown error',
      error_code: 'FATAL_ERROR',
      attempt: 1,
      timestamp: new Date().toISOString(),
      will_retry: false,
    };

    await supabase
      .from('validation_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_log: [errorEntry],
      })
      .eq('id', jobId);
  }
}

/**
 * Validate a single question by calling ai-validate-question function directly
 */
async function validateQuestionDirect(questionId: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('ai-validate-question', {
    body: { question_id: questionId },
  });

  if (error) {
    console.error(`❌ Validation failed for ${questionId}:`, error);
    throw new Error(error.message || 'Validation failed');
  }

  if (!data.success) {
    const errorMsg = data.error || 'Validation failed';
    console.error(`❌ Validation failed: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return data.validation;
}

/**
 * Pause a running validation job
 */
export async function pauseValidation(
  jobId: string
): Promise<ValidationJobResponse> {
  const { error } = await supabase
    .from('validation_jobs')
    .update({
      status: 'paused',
      paused_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('status', 'running');

  if (error) {
    console.error('Failed to pause validation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Resume a paused validation job
 */
export async function resumeValidation(
  jobId: string
): Promise<ValidationJobResponse> {
  const { error } = await supabase
    .from('validation_jobs')
    .update({
      status: 'running',
      paused_at: null,
    })
    .eq('id', jobId)
    .eq('status', 'paused');

  if (error) {
    console.error('Failed to resume validation:', error);
    return { success: false, error: error.message };
  }

  // Continue processing in background
  processValidationJob(jobId).catch((error) => {
    console.error('❌ Job processing failed:', error);
  });

  return { success: true };
}

/**
 * Stop a validation job
 */
export async function stopValidation(
  jobId: string
): Promise<ValidationJobResponse> {
  const { error } = await supabase
    .from('validation_jobs')
    .update({
      status: 'stopped',
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to stop validation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get validation job status
 */
export async function getValidationStatus(
  jobId: string
): Promise<ValidationJobResponse> {
  const { data: job, error } = await supabase
    .from('validation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Failed to get validation status:', error);
    return { success: false, error: error.message };
  }

  return { success: true, job };
}

/**
 * Get latest validation job
 */
export async function getLatestValidationJob(): Promise<ValidationJob | null> {
  const { data, error } = await supabase
    .from('validation_jobs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to get latest job:', error);
    return null;
  }

  return data;
}

/**
 * Get all validation jobs
 */
export async function getAllValidationJobs(): Promise<ValidationJob[]> {
  const { data, error } = await supabase
    .from('validation_jobs')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Failed to get validation jobs:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate flag statistics from questions
 */
export async function calculateFlagStatistics(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('2V_questions')
    .select('ai_validation')
    .not('ai_validation', 'is', null);

  if (error) {
    console.error('Failed to get flag statistics:', error);
    return {};
  }

  const stats: Record<string, number> = {};

  data?.forEach((question: any) => {
    const validation = question.ai_validation;
    if (validation?.flags) {
      validation.flags.forEach((flag: string) => {
        stats[flag] = (stats[flag] || 0) + 1;
      });
    }
  });

  return stats;
}

/**
 * Get all distinct test types from questions table
 */
export async function getTestTypes(): Promise<string[]> {
  const testTypes = new Set<string>();
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('2V_questions')
      .select('test_type')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Failed to get test types:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    data.forEach((question: any) => {
      if (question.test_type) {
        testTypes.add(question.test_type);
      }
    });

    // If we got less than pageSize, we've reached the end
    if (data.length < pageSize) {
      hasMore = false;
    }

    page++;
  }

  return Array.from(testTypes).sort();
}
