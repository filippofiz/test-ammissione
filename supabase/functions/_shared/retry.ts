// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

export interface RetryContext {
  question_id: string;
  operation: string;
}

export interface RetryError {
  question_id: string;
  error: string;
  error_code: string;
  attempt: number;
  timestamp: string;
  will_retry: boolean;
}

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: RetryContext,
  onError?: (error: RetryError) => Promise<void>
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isLastAttempt = attempt === RETRY_CONFIG.maxAttempts;

      const retryError: RetryError = {
        question_id: context.question_id,
        error: lastError.message,
        error_code: getErrorCode(lastError),
        attempt,
        timestamp: new Date().toISOString(),
        will_retry: !isLastAttempt,
      };

      console.error(
        `❌ ${context.operation} failed for question ${context.question_id} (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}):`,
        lastError.message
      );

      // Call error callback if provided
      if (onError) {
        await onError(retryError);
      }

      if (isLastAttempt) {
        console.error(
          `🚫 Max retries reached for question ${context.question_id}, giving up`
        );
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        RETRY_CONFIG.initialDelay *
          Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Get error code from error object
 */
function getErrorCode(error: Error): string {
  if (error.message.includes('timeout')) return 'TIMEOUT';
  if (error.message.includes('429')) return 'RATE_LIMIT';
  if (error.message.includes('500')) return 'SERVER_ERROR';
  if (error.message.includes('network')) return 'NETWORK_ERROR';
  return 'UNKNOWN_ERROR';
}
