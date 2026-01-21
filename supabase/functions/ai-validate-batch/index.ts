import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { withRetry, RetryError } from "../_shared/retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 5; // Process 5 questions concurrently

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("🚀 AI Validate Batch function called");

  try {
    const body = await req.json();
    const { action, job_id, test_type, limit } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Route to appropriate handler based on action
    switch (action) {
      case "start":
        return await handleStart(supabase, test_type, limit);
      case "pause":
        return await handlePause(supabase, job_id);
      case "resume":
        return await handleResume(supabase, job_id);
      case "stop":
        return await handleStop(supabase, job_id);
      case "status":
        return await handleStatus(supabase, job_id);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("❌ Batch validation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Start a new validation job
 */
async function handleStart(
  supabase: any,
  test_type?: string,
  limit?: number
) {
  console.log("▶️ Starting new validation job...");

  // Build query for questions
  let query = supabase.from("2V_questions").select("id", { count: "exact" });

  if (test_type) {
    query = query.eq("test_type", test_type);
  }

  // Get total count
  const { count: totalQuestions, error: countError } = await query;

  if (countError) {
    throw new Error(`Failed to count questions: ${countError.message}`);
  }

  const actualTotal = limit && limit < totalQuestions! ? limit : totalQuestions!;

  // Create job record
  const { data: job, error: jobError } = await supabase
    .from("validation_jobs")
    .insert({
      total_questions: actualTotal,
      status: "running",
    })
    .select()
    .single();

  if (jobError) {
    throw new Error(`Failed to create job: ${jobError.message}`);
  }

  console.log(`✅ Created job ${job.id} for ${actualTotal} questions`);

  // Start processing in background (spawn async task)
  processValidationJob(job.id, test_type, limit).catch((error) => {
    console.error("❌ Job processing failed:", error);
  });

  return new Response(
    JSON.stringify({
      success: true,
      job_id: job.id,
      total_questions: actualTotal,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Pause a running job
 */
async function handlePause(supabase: any, job_id: string) {
  console.log(`⏸️ Pausing job ${job_id}...`);

  const { error } = await supabase
    .from("validation_jobs")
    .update({
      status: "paused",
      paused_at: new Date().toISOString(),
    })
    .eq("id", job_id)
    .eq("status", "running");

  if (error) {
    throw new Error(`Failed to pause job: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Resume a paused job
 */
async function handleResume(supabase: any, job_id: string) {
  console.log(`▶️ Resuming job ${job_id}...`);

  const { error } = await supabase
    .from("validation_jobs")
    .update({
      status: "running",
      paused_at: null,
    })
    .eq("id", job_id)
    .eq("status", "paused");

  if (error) {
    throw new Error(`Failed to resume job: ${error.message}`);
  }

  // Continue processing
  processValidationJob(job_id).catch((error) => {
    console.error("❌ Job processing failed:", error);
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Stop a job
 */
async function handleStop(supabase: any, job_id: string) {
  console.log(`⏹️ Stopping job ${job_id}...`);

  const { error } = await supabase
    .from("validation_jobs")
    .update({
      status: "stopped",
      completed_at: new Date().toISOString(),
    })
    .eq("id", job_id);

  if (error) {
    throw new Error(`Failed to stop job: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Get job status
 */
async function handleStatus(supabase: any, job_id: string) {
  const { data: job, error } = await supabase
    .from("validation_jobs")
    .select("*")
    .eq("id", job_id)
    .single();

  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true, job }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Main processing loop for validation job
 */
async function processValidationJob(
  jobId: string,
  test_type?: string,
  limit?: number
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`🔄 Processing validation job ${jobId}...`);

  // Helper to add log entry (non-blocking, won't crash if logs column doesn't exist)
  const addLog = async (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);

    try {
      const { data } = await supabase
        .from('validation_jobs')
        .select('logs')
        .eq('id', jobId)
        .single();

      if (data && 'logs' in data) {
        // Logs column exists, update it
        const currentLogs = data.logs || [];
        await supabase.from('validation_jobs')
          .update({ logs: [...currentLogs, logEntry] })
          .eq('id', jobId);
      }
    } catch (error) {
      // Silently fail if logs column doesn't exist - don't break validation
      console.error('Failed to add log (column might not exist):', error);
    }
  };

  try {
    await addLog('🚀 Starting validation job');

    while (true) {
      // Check job status
      const { data: job, error: jobError } = await supabase
        .from("validation_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        console.error("Failed to fetch job:", jobError);
        break;
      }

      // Check if job should stop
      if (job.status === "paused") {
        console.log(`⏸️ Job ${jobId} is paused, waiting...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      if (job.status === "stopped") {
        console.log(`⏹️ Job ${jobId} was stopped`);
        break;
      }

      // Check if all questions processed
      if (job.processed_count >= job.total_questions) {
        console.log(`✅ Job ${jobId} completed!`);
        await supabase
          .from("validation_jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);
        break;
      }

      // Fetch next batch of questions to validate
      let query = supabase
        .from("2V_questions")
        .select("id")
        .is("ai_validation", null)
        .limit(BATCH_SIZE);

      if (test_type) {
        query = query.eq("test_type", test_type);
      }

      const { data: questions, error: questionsError } = await query;

      if (questionsError) {
        console.error("Failed to fetch questions:", questionsError);
        break;
      }

      if (!questions || questions.length === 0) {
        console.log("No more questions to validate");
        await supabase
          .from("validation_jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);
        break;
      }

      // Update current batch
      const questionIds = questions.map((q) => q.id);
      await supabase
        .from("validation_jobs")
        .update({
          current_batch: {
            question_ids: questionIds,
            started_at: new Date().toISOString(),
          },
        })
        .eq("id", jobId);

      console.log(`📦 Processing batch of ${questions.length} questions...`);
      await addLog(`📦 Processing batch of ${questions.length} questions`);

      // Process batch concurrently
      const results = await Promise.allSettled(
        questions.map((question) =>
          validateQuestion(question.id, supabase)
        )
      );

      // Count results
      let successCount = 0;
      let failedCount = 0;
      let verifiedCount = 0;
      let flaggedCount = 0;
      const errors: any[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
          const validation = result.value;
          if (validation?.flags?.includes("ai_verified_correct")) {
            verifiedCount++;
          } else if (validation?.flags?.length > 0) {
            flaggedCount++;
          }
        } else {
          failedCount++;
          errors.push({
            question_id: questions[index].id,
            error: result.reason?.message || "Unknown error",
            error_code: "VALIDATION_FAILED",
            attempt: 3,
            timestamp: new Date().toISOString(),
            will_retry: false,
          });
        }
      });

      // Update job progress
      const currentStats = job.flag_statistics || {};
      await supabase
        .from("validation_jobs")
        .update({
          processed_count: job.processed_count + questions.length,
          passed_count: job.passed_count + verifiedCount,
          flagged_count: job.flagged_count + flaggedCount,
          failed_count: job.failed_count + failedCount,
          error_log: [...(job.error_log || []), ...errors],
          current_batch: null,
        })
        .eq("id", jobId);

      console.log(
        `📊 Batch complete: ${successCount} success, ${failedCount} failed`
      );
      await addLog(`✅ Batch complete: ${successCount} success, ${failedCount} failed, ${verifiedCount} verified`);

      // Small delay before next batch
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("❌ Job processing error:", error);
    await addLog(`❌ Fatal error: ${error.message}`);

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
      .from("validation_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_log: [errorEntry],
      })
      .eq("id", jobId);
  }
}

/**
 * Validate a single question by calling the validate function
 */
async function validateQuestion(
  questionId: string,
  supabase: any
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const response = await withRetry(
    async () => {
      // Use raw fetch instead of Supabase client to ensure proper authorization
      const url = `${supabaseUrl}/functions/v1/ai-validate-question`;

      const httpResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ question_id: questionId }),
      });

      if (!httpResponse.ok) {
        const errorText = await httpResponse.text();
        console.error(`❌ HTTP ${httpResponse.status}: ${errorText}`);
        throw new Error(`HTTP ${httpResponse.status}: ${errorText}`);
      }

      const data = await httpResponse.json();

      console.log(`📋 Response for ${questionId}:`, {
        success: data.success,
        hasValidation: !!data.validation,
        error: data.error
      });

      if (!data.success) {
        const errorMsg = data.error || "Validation failed";
        console.error(`❌ Validation failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      return data.validation;
    },
    { question_id: questionId, operation: "Validate Question" }
  );

  return response;
}
