CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile TEXT NOT NULL CHECK (profile IN ('personal', 'business')),
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'credit', 'wallet', 'other')),
  external_id TEXT UNIQUE,
  current_balance NUMERIC(14, 2),
  status TEXT NOT NULL DEFAULT 'connected',
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile TEXT NOT NULL CHECK (profile IN ('personal', 'business')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  flow TEXT NOT NULL CHECK (flow IN ('income', 'expense', 'investment')),
  color TEXT NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'csv',
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  accounts_count INTEGER NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile TEXT NOT NULL CHECK (profile IN ('personal', 'business')),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  external_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('csv', 'banco_mcp', 'manual')),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  flow TEXT NOT NULL CHECK (flow IN ('income', 'expense', 'investment')),
  status TEXT NOT NULL DEFAULT 'posted',
  needs_review BOOLEAN NOT NULL DEFAULT TRUE,
  reviewed_at TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_profile ON accounts(profile);
CREATE INDEX IF NOT EXISTS idx_categories_profile_flow ON categories(profile, flow);
CREATE INDEX IF NOT EXISTS idx_transactions_profile_date ON transactions(profile, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_flow ON transactions(flow);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_review ON transactions(profile, needs_review) WHERE needs_review = true;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS accounts_set_updated_at ON accounts;
CREATE TRIGGER accounts_set_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS transactions_set_updated_at ON transactions;
CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read accounts" ON accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read imports" ON import_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read sync runs" ON sync_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read transactions" ON transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update transactions" ON transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO categories (profile, name, slug, flow, color) VALUES
('personal', 'Alimentacao', 'personal-alimentacao', 'expense', '#f97316'),
('personal', 'Moradia', 'personal-moradia', 'expense', '#0f766e'),
('personal', 'Transporte', 'personal-transporte', 'expense', '#2563eb'),
('personal', 'Saude', 'personal-saude', 'expense', '#16a34a'),
('personal', 'Lazer', 'personal-lazer', 'expense', '#9333ea'),
('personal', 'Assinaturas', 'personal-assinaturas', 'expense', '#64748b'),
('personal', 'Salario', 'personal-salario', 'income', '#059669'),
('personal', 'Rendimentos', 'personal-rendimentos', 'income', '#65a30d'),
('personal', 'Reserva', 'personal-reserva', 'investment', '#7c3aed'),
('business', 'Vendas', 'business-vendas', 'income', '#0891b2'),
('business', 'Ferramentas', 'business-ferramentas', 'expense', '#4f46e5'),
('business', 'Anuncios', 'business-anuncios', 'expense', '#dc2626'),
('business', 'Energia', 'business-energia', 'expense', '#ca8a04'),
('business', 'Impostos', 'business-impostos', 'expense', '#be123c'),
('business', 'Assinaturas', 'business-assinaturas', 'expense', '#64748b'),
('business', 'Taxas', 'business-taxas', 'expense', '#ea580c'),
('business', 'Reserva empresarial', 'business-reserva-empresarial', 'investment', '#7c3aed')
ON CONFLICT (slug) DO NOTHING;
