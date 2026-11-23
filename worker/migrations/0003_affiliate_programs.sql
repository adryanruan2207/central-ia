CREATE TABLE IF NOT EXISTS affiliate_programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  signup_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'research',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_status ON affiliate_programs(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_region ON affiliate_programs(region);
INSERT OR IGNORE INTO affiliate_programs (id,name,region,category,signup_url,notes,status,created_at,updated_at) VALUES
('awin','Awin','Global / Europa / Américas','Rede de marcas e lojas','https://ui.awin.com/publisher-signup/en/awin/','Rede internacional; elegibilidade e aprovação variam por país e anunciante.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('cj-affiliate','CJ Affiliate','Global / Estados Unidos','Rede de marcas e lojas','https://signup.cj.com/member/signup/publisher/#/','Cadastro de publisher; marcas aprovam parceiros individualmente.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('impact','impact.com','Global','Marcas, varejo, tecnologia e criadores','https://app.impact.com/signup/none/create-new-mediapartner-account-flow.ihtml','Cadastro na rede; cada parceria pode exigir aprovação própria.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('rakuten','Rakuten Advertising','Global / Américas / Ásia','Rede de anunciantes','https://pubhelp.rakutenadvertising.com/','Portal de publishers e informações oficiais de cadastro; confirmar disponibilidade regional.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('partnerstack','PartnerStack','Global','Software B2B e SaaS','https://partnerstack.com/','Rede focada em parcerias de software; requisitos variam por programa.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('clickbank','ClickBank','Global','Produtos digitais','https://www.clickbank.com/','Marketplace de produtos digitais; verificar regras, países e pagamentos.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('digistore24','Digistore24','Global / Europa','Produtos digitais e serviços','https://www.digistore24.com/','Marketplace internacional; conferir cadastro, compliance e métodos de saque.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('ebay-partner','eBay Partner Network','Global / mercados eBay','Comércio eletrônico','https://partnernetwork.ebay.com/','Programa oficial de parceiros do eBay; elegibilidade depende do mercado.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('aliexpress-portals','AliExpress Portals','Global','Comércio eletrônico','https://portals.aliexpress.com/','Portal de afiliados; verificar aprovação, países e condições atuais.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('amazon-associates','Amazon Associados','Brasil e outros mercados Amazon','Comércio eletrônico','https://associados.amazon.com.br/','Há programas separados por país; cadastro e regras variam por marketplace.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('hotmart','Hotmart','Brasil / Global','Cursos e produtos digitais','https://hotmart.com/pt-br/afiliados','Marketplace de produtos digitais; produtor define regras e comissão.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('awin-tradedoubler','Tradedoubler','Europa / Global','Rede de marcas e lojas','https://publishers.tradedoubler.com/en/publishers/signup/','Rede internacional; validar cobertura e critérios por país.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('webgains','Webgains','Europa / Global','Rede de marcas e lojas','https://www.webgains.com/front/user/signup/','Rede internacional; disponibilidade varia por anunciante e país.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z'),
('partnerize','Partnerize','Global','Parcerias com marcas','https://partnerize.com/partners','Rede de parcerias; confirmar requisitos e elegibilidade no cadastro.','research','2026-11-23T00:00:00.000Z','2026-11-23T00:00:00.000Z');