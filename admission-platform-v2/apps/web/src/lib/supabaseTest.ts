/**
 * Test Supabase Client
 * Used ONLY for Test Runner - uses _test tables in same database
 * This keeps test data separate from production data
 */

/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Same database, but we'll use _test tables
export const supabaseTest = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to convert table name to test table name
 * Example: "2V_profiles" → "2V_profiles_test"
 */
export function getTestTableName(tableName: string): string {
  return `${tableName}_test`;
}

/**
 * Wrapper around supabase.from() that automatically uses test tables
 */
export function fromTest(tableName: string): ReturnType<SupabaseClient['from']> {
  return supabaseTest.from(getTestTableName(tableName));
}

/**
 * Cleanup all test data
 */
export async function cleanupTestData() {
  const { error } = await supabaseTest.rpc('cleanup_test_tables');
  if (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
  console.log('✅ Test data cleaned up successfully');
}
