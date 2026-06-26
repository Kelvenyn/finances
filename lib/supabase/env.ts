export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel de ambiente ausente: ${name}`);
  return value;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
