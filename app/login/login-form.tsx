"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Nao foi possivel entrar. Confira e-mail e senha.");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div>
        <span className="eyebrow">Finance Core</span>
        <h1>Entre no seu painel financeiro.</h1>
        <p>Use o login criado no Supabase para acessar seus dados pessoais e empresariais.</p>
      </div>

      <label>
        E-mail
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>

      <label>
        Senha
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
