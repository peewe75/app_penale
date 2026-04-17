import { createClient } from '@supabase/supabase-js';
import { env, hasSupabaseAdminConfig } from '@/lib/env';

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
