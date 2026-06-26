CREATE OR REPLACE FUNCTION app_is_allowed_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' = 'kelvenyn@gmail.com';
END;
$$ LANGUAGE plpgsql STABLE;

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read accounts" ON accounts;
DROP POLICY IF EXISTS "Authenticated users can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can read imports" ON import_batches;
DROP POLICY IF EXISTS "Authenticated users can read sync runs" ON sync_runs;
DROP POLICY IF EXISTS "Authenticated users can read transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON transactions;

CREATE POLICY "Kelvenyn can read profiles" ON profiles FOR SELECT TO authenticated USING (app_is_allowed_user());
CREATE POLICY "Kelvenyn can read accounts" ON accounts FOR SELECT TO authenticated USING (app_is_allowed_user());
CREATE POLICY "Kelvenyn can read categories" ON categories FOR SELECT TO authenticated USING (app_is_allowed_user());
CREATE POLICY "Kelvenyn can read imports" ON import_batches FOR SELECT TO authenticated USING (app_is_allowed_user());
CREATE POLICY "Kelvenyn can read sync runs" ON sync_runs FOR SELECT TO authenticated USING (app_is_allowed_user());
CREATE POLICY "Kelvenyn can read transactions" ON transactions FOR SELECT TO authenticated USING (app_is_allowed_user());

CREATE POLICY "Kelvenyn can update transactions" ON transactions
FOR UPDATE TO authenticated
USING (app_is_allowed_user())
WITH CHECK (app_is_allowed_user());

CREATE OR REPLACE FUNCTION validate_transaction_links()
RETURNS TRIGGER AS $$
DECLARE
  linked_account_profile TEXT;
  linked_category_profile TEXT;
  linked_category_flow TEXT;
BEGIN
  IF NEW.account_id IS NOT NULL THEN
    SELECT profile INTO linked_account_profile FROM accounts WHERE id = NEW.account_id;
    IF linked_account_profile IS NULL OR linked_account_profile <> NEW.profile THEN
      RAISE EXCEPTION 'Transaction account profile mismatch';
    END IF;
  END IF;

  IF NEW.category_id IS NOT NULL THEN
    SELECT profile, flow INTO linked_category_profile, linked_category_flow FROM categories WHERE id = NEW.category_id;
    IF linked_category_profile IS NULL OR linked_category_profile <> NEW.profile OR linked_category_flow <> NEW.flow THEN
      RAISE EXCEPTION 'Transaction category profile or flow mismatch';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transactions_validate_links ON transactions;
CREATE TRIGGER transactions_validate_links
BEFORE INSERT OR UPDATE OF profile, account_id, category_id, flow ON transactions
FOR EACH ROW EXECUTE FUNCTION validate_transaction_links();
