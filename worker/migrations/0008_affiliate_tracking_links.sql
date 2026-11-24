ALTER TABLE affiliate_products ADD COLUMN affiliate_url TEXT;
ALTER TABLE affiliate_products ADD COLUMN affiliate_program_id TEXT;
CREATE INDEX IF NOT EXISTS idx_affiliate_products_program ON affiliate_products(affiliate_program_id);
