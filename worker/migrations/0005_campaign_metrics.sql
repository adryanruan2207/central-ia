CREATE TABLE IF NOT EXISTS campaign_metrics (
  id TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  spend REAL NOT NULL,
  conversions INTEGER NOT NULL,
  revenue REAL NOT NULL,
  ctr REAL NOT NULL,
  conversion_rate REAL NOT NULL,
  cpa REAL,
  roas REAL,
  roi REAL,
  ai_analysis TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_created ON campaign_metrics(created_at DESC);
