CREATE TABLE IF NOT EXISTS system_health_checks (
 id TEXT PRIMARY KEY,
 checked_at TEXT NOT NULL,
 status TEXT NOT NULL,
 details TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_system_health_checked_at ON system_health_checks(checked_at DESC);
