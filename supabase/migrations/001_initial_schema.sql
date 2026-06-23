CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), external_id TEXT UNIQUE, source TEXT NOT NULL,
  profile TEXT NOT NULL CHECK (profile IN ('personal','business')), bank TEXT NOT NULL, bank_account_id TEXT,
  date DATE NOT NULL, description TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  flow TEXT NOT NULL CHECK (flow IN ('receita','despesa','investimento')), payment_method TEXT,
  status TEXT DEFAULT 'posted', category TEXT, subcategory TEXT, tipo TEXT,
  needs_review BOOLEAN DEFAULT false, reviewed_at TIMESTAMPTZ, notes TEXT, raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_profile ON transactions(profile);
CREATE INDEX IF NOT EXISTS idx_transactions_bank ON transactions(bank);
CREATE INDEX IF NOT EXISTS idx_transactions_review ON transactions(needs_review) WHERE needs_review = true;

CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bank TEXT NOT NULL, account_id TEXT NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(), last_tx_date DATE, new_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ok', error_msg TEXT
);
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE,
  flow TEXT NOT NULL, subcategory TEXT, color TEXT, icon TEXT
);
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO categories (name, slug, flow, color, icon) VALUES
('Alimentação','alimentacao','despesa','#f97316','🍞'),('Atípico','atipico','despesa','#ef4444','🚨'),
('Cuidados','cuidados','despesa','#ec4899','✂️'),('Cursos','cursos','despesa','#8b5cf6','💻'),
('Dentista','dentista','despesa','#06b6d4','🦷'),('Diversão','diversao','despesa','#f59e0b','🎲'),
('Energia','energia','despesa','#eab308','💡'),('Ferramentas','ferramentas','despesa','#64748b','🛠️'),
('Financiamento','financiamento','despesa','#475569','🏢'),('Internet','internet','despesa','#14b8a6','🌐'),
('Lanches','lanches','despesa','#fb923c','🍔'),('Multas','multas','despesa','#dc2626','📝'),
('Presentes','presentes','despesa','#db2777','🎁'),('Saúde','saude','despesa','#22c55e','💊'),
('Transporte','transporte','despesa','#3b82f6','🚕'),('Utilidades','utilidades','despesa','#94a3b8','🛒'),
('Vestimenta','vestimenta','despesa','#a855f7','👕'),('Cashback','cashback','receita','#10b981','💲'),
('Comissões','comissoes','receita','#059669','💸'),('FGTS','fgts','receita','#0d9488','🏦'),
('Férias','ferias','receita','#0891b2','🏖️'),('Incentivo','incentivo','receita','#16a34a','↗️'),
('Pró-labore','pro-labore','receita','#15803d','🪙'),('Rateios','rateios','receita','#0f766e','⚖️'),
('Rendimentos','rendimentos','receita','#65a30d','🏆'),('Salário','salario','receita','#22c55e','💰'),
('Saque','saque','receita','#84cc16','🎰'),('Serviços','servicos','receita','#14b8a6','🧾'),
('Vendas','vendas','receita','#06b6d4','💎'),('Conta conjunta','conta-conjunta','investimento','#8b5cf6','💞')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

