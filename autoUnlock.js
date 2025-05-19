// autoUnlock.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Given an array of studentTests, updates DB + cache so that
 * whenever a test is completed, the very next one (by unlock_order)
 * with unlock_mode="automatic" becomes "unlocked".
 */
export async function updateAutoUnlockStatus(studentTestsCache) {
  // 1) pick only automatic tests, in order
  const autoTests = studentTestsCache
    .filter(t => t.unlock_mode === 'automatic')
    .sort((a,b) => a.unlock_order - b.unlock_order);

  // 2) skip the first; for each pair, if prev.completed → unlock curr
  for (let i = 1; i < autoTests.length; i++) {
    const prev = autoTests[i - 1];
    const curr = autoTests[i];

    // never touch already-completed
    if (curr.status === 'completed') continue;

    if (prev.status === 'completed' && curr.status !== 'unlocked') {
      const { error } = await supabase
        .from('student_tests')
        .update({ status: 'unlocked' })
        .eq('id', curr.id);

      if (!error) curr.status = 'unlocked';
    }
  }
}