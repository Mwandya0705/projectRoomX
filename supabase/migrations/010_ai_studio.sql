-- AI Studio: Credits & Jobs tables
-- Run this in your Supabase SQL Editor

-- 1. Credits wallet per user
CREATE TABLE IF NOT EXISTS ai_credits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance     INTEGER NOT NULL DEFAULT 500,
  total_earned INTEGER NOT NULL DEFAULT 500,
  total_spent  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Credit transactions ledger
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL, -- positive = credit, negative = debit
  type        VARCHAR(50) NOT NULL, -- 'purchase' | 'debit' | 'refund' | 'bonus'
  description TEXT,
  job_id      UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI generation jobs
CREATE TABLE IF NOT EXISTS ai_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_type        VARCHAR(20) NOT NULL,   -- 'image' | 'video'
  status          VARCHAR(20) NOT NULL DEFAULT 'queued', -- queued | processing | completed | failed
  prompt          TEXT NOT NULL,
  enhanced_prompt TEXT,
  style           VARCHAR(50),
  uploaded_image_url TEXT,
  result_url      TEXT,
  credit_cost     INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_ai_credits_user_id ON ai_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_credit_transactions_user_id ON ai_credit_transactions(user_id);

-- 5. RLS Policies
ALTER TABLE ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credits" ON ai_credits FOR SELECT USING (true);
CREATE POLICY "Users can read own jobs" ON ai_jobs FOR SELECT USING (true);
CREATE POLICY "Users can read own transactions" ON ai_credit_transactions FOR SELECT USING (true);

-- 6. Auto-updated_at trigger for ai_jobs
CREATE OR REPLACE FUNCTION update_ai_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_jobs_updated_at
  BEFORE UPDATE ON ai_jobs
  FOR EACH ROW EXECUTE FUNCTION update_ai_jobs_updated_at();
