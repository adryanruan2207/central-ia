CREATE TABLE IF NOT EXISTS commerce_accounts (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  business_model TEXT NOT NULL CHECK (business_model IN ('affiliate','seller','dropshipping')),
  region TEXT NOT NULL,
  account_label TEXT,
  connection_status TEXT NOT NULL DEFAULT 'not_started' CHECK (connection_status IN ('not_started','needs_authorization','connected','error','paused')),
  approval_status TEXT NOT NULL DEFAULT 'unknown' CHECK (approval_status IN ('unknown','pending','approved','rejected')),
  capabilities_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(platform_id, business_model, region)
);
CREATE INDEX IF NOT EXISTS idx_commerce_accounts_model_status
  ON commerce_accounts(business_model, connection_status, approval_status);
CREATE INDEX IF NOT EXISTS idx_commerce_accounts_platform
  ON commerce_accounts(platform_id);
