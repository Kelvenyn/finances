import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="login-page">
        <section className="login-copy">
          <span className="brand-mark">F</span>
          <h2>Finance Core esta pronto para conectar.</h2>
          <p>Configure as variaveis do Supabase para ativar login, dados e sincronizacao.</p>
        </section>
        <section className="login-card">
          <div>
            <span className="eyebrow">Configuracao</span>
            <h1>Falta criar o `.env.local`.</h1>
            <p>Use `.env.example` como guia e preencha Supabase, Banco MCP e segredo de sync. Depois reinicie o servidor local.</p>
          </div>
          <div className="setup-list">
            <code>NEXT_PUBLIC_SUPABASE_URL</code>
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            <code>SUPABASE_SERVICE_ROLE_KEY</code>
            <code>BANCO_MCP_API_KEY</code>
            <code>SYNC_SECRET</code>
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) redirect("/");

  return (
    <main className="login-page">
      <section className="login-copy">
        <span className="brand-mark">F</span>
        <h2>Financas com separacao clara.</h2>
        <p>Pessoal de um lado, empresa do outro, com dados importados do CSV e sincronizados pelo Banco MCP.</p>
      </section>
      <LoginForm />
    </main>
  );
}
