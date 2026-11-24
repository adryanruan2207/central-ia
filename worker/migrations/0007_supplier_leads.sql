CREATE TABLE IF NOT EXISTS supplier_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  category TEXT NOT NULL,
  evidence TEXT,
  source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(website, category)
);
CREATE INDEX IF NOT EXISTS idx_supplier_leads_category ON supplier_leads(category);
CREATE INDEX IF NOT EXISTS idx_supplier_leads_verification ON supplier_leads(verification_status);
