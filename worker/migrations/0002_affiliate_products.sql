CREATE TABLE IF NOT EXISTS affiliate_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  product_url TEXT,
  commission_rate REAL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'research',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliate_products_status ON affiliate_products(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_marketplace ON affiliate_products(marketplace);
