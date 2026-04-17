const fallbackAppUrl = 'http://localhost:3000';
const fallbackBcsAppUrl = 'https://ultrabot.space';

function normalizeUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const env = {
  appUrl:
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeUrl(process.env.VERCEL_URL) ??
    fallbackAppUrl,
  bcsAppUrl: normalizeUrl(process.env.NEXT_PUBLIC_BCS_APP_URL) ?? fallbackBcsAppUrl,
  clerkPublishableKey:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.VITE_CLERK_PUBLISHABLE_KEY ??
    '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? '',
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    '',
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  deepgramApiKey: process.env.DEEPGRAM_API_KEY ?? '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterModel: process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-sonnet',
};

export function hasClerkServerConfig() {
  return Boolean(env.clerkSecretKey);
}

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasDeepgramConfig() {
  return Boolean(env.deepgramApiKey);
}

export function hasOpenRouterConfig() {
  return Boolean(env.openRouterApiKey);
}
