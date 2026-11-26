# CENTRAL IA — Cloudflare Worker

Backend da CENTRAL IA, executado em Cloudflare Workers com banco D1, Workers AI e rotinas agendadas.

## Infraestrutura esperada

- Worker: `central-ia-worker`
- D1: `central-ia-db`, binding `DB`
- Workers AI: binding `AI`
- Cron: `* * * * *` (auditoria de saúde e processamento gradual de rotinas)
- Frontend: GitHub Pages (repositório raiz)

O arquivo `wrangler.toml` contém o nome do Worker, o binding D1, o binding AI e o gatilho cron. Não altere o ID do banco sem confirmar o ambiente correto.

## Secrets e variáveis

Configure no painel Cloudflare em **Workers & Pages → central-ia-worker → Settings → Variables and Secrets**. Nunca grave valores secretos no GitHub, frontend, logs ou mensagens.

- `SENHA_DO_APLICATIVO` (ou `APP_PASSWORD`): senha de acesso ao painel.
- `SESSION_SECRET`: segredo forte para assinar sessões.
- `TAVILY_API_KEY`: habilita pesquisa web e descoberta de fornecedores.
- `AWIN_API_TOKEN` e `AWIN_PUBLISHER_ID`: habilitam consultas de transações Awin após a conta Publisher estar aprovada e o token autorizado.
- `API_TOKEN`: token Bearer para rotas administrativas legadas, quando aplicável.

O binding `DB` deve apontar para o banco D1 configurado no `wrangler.toml`; o binding `AI` deve estar habilitado para geração de conteúdo e análises com IA.

## Capacidades implementadas

- Login por senha e sessão assinada pelo Worker.
- Chat com IA e histórico persistido.
- Auditoria de saúde de banco, tabelas, filas, Workers AI e pesquisa web.
- Descoberta de candidatos de produtos no catálogo público do Mercado Livre; itens descobertos ficam em pesquisa e não são automaticamente elegíveis para afiliados.
- Pesquisa de possíveis fornecedores, quando Tavily está configurado; leads permanecem não verificados até validação.
- Triagem de produtos e programas, preparação de kits de campanha e roteiros.
- Fila e histórico de publicações em estado interno.
- Integração Awin para status, grupos de comissão, links rastreáveis e transações, condicionada às credenciais.
- Rotinas de recuperação de tarefas com limite de tentativas e notificações de falhas.

## Rotas principais

As rotas privadas exigem sessão/autorização conforme o handler. Consulte `src/index.js` para métodos HTTP, payloads e regras exatas.

- Saúde e autenticação: `GET /health`, `POST /auth/login`, `GET /auth/session`
- Chat: `POST /ai/chat`, `GET /chat/history`
- Automação: `GET /automation/status`, `POST /automation/test-tavily`
- Afiliados: `/affiliates/products`, `/affiliates/programs`, `/affiliates/shortlist/analyze`, `/affiliates/campaign-readiness`, `/affiliates/campaign-kit`, `/affiliates/campaign-kits`
- Fornecedores: `/affiliates/suppliers`, `/affiliates/supplier-leads`
- Marketing: `/marketing/video-script`, `/marketing/campaign-plan`, `/marketing/competitor-analysis`, `/marketing/campaign-metrics`
- Publicações: `/publications`
- Awin: `/integrations/awin/status`, `/integrations/awin/commission-groups`, `/integrations/awin/tracking-link`, `/integrations/awin/transactions`, `/integrations/awin/summary`
- Desenvolvimento assistido: rotas `/developer/*` com planejamento, auditoria e preparação/validação de propostas; não aplicar alterações de produção sem revisão.

## Limites operacionais e comerciais

- Criar um rascunho não publica conteúdo. TikTok, Instagram, YouTube e demais redes ainda exigem integrações oficiais, OAuth, permissões e eventuais aprovações.
- Descobrir um produto não confirma comissão, disponibilidade, elegibilidade, estoque ou direito de divulgação.
- Leads de fornecedores são pistas de pesquisa, não fornecedores aprovados.
- Estimativas de comissão não são lucro líquido, previsão de conversão ou receita recebida.
- A CENTRAL IA não aceita termos legais, não compra mídia, não realiza compras e não executa operações financeiras.
- A automação cron do Worker continua ativa independentemente do ChatGPT, mas depende da disponibilidade dos serviços e das credenciais configuradas.

## Banco de dados e deploy

As migrations em `migrations/` documentam a estrutura D1. Não execute migrations automaticamente em um deploy comum: confirme primeiro se o banco remoto já recebeu cada migration para evitar alterações duplicadas ou perda de dados.

O deploy é feito pelo workflow GitHub Actions. Após alterações, confira os workflows de testes, validação isolada, deploy do Worker e publicação do Pages em **Actions**. Um commit enviado não significa que o deploy terminou; confirme o resultado dos workflows.
