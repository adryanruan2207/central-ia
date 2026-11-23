CREATE TABLE IF NOT EXISTS publication_queue (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  affiliate_url TEXT,
  scheduled_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'needs_connection', 'published', 'failed', 'paused')),
  external_post_id TEXT,
  published_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_publication_queue_status_schedule
ON publication_queue(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_publication_queue_created
ON publication_queue(created_at DESC);