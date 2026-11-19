# CENTRAL IA — serviço de nuvem (primeira etapa)

Este Worker cria a base de API, persistência de tarefas e um gatilho agendado. Ele **ainda não conecta um modelo de IA nem executa tarefas de negócio**.

## Preparar no Cloudflare
1. Crie um banco D1 chamado `central-ia-db`.
2. Execute `migrations/0001_init.sql` no console SQL do D1.
3. Copie o UUID do banco e substitua `SUBSTITUA_PELO_ID_DO_D1` em `wrangler.toml`.
4. Crie um Worker chamado `central-ia-worker` e publique o conteúdo de `src/index.js`, ou faça deploy com Wrangler.
5. Em Settings → Variables and Secrets, adicione `API_TOKEN` como Secret com um token longo e aleatório. Não coloque esse token no GitHub nem no site.
6. Configure o binding D1 com variável `DB`, apontando para `central-ia-db`.
7. Configure o Cron Trigger `*/15 * * * *` (a cada 15 minutos).

## Rotas
- `GET /health`: status público, sem dados privados.
- `GET /tasks`: lista tarefas (Bearer token).
- `POST /tasks`: registra tarefa (Bearer token), JSON: `{"title":"Pesquisar oportunidades","task_type":"research"}`.

## Limites de segurança
Esta etapa apenas registra tarefas. Não há execução autônoma de ações externas, IA, publicações, compras ou operações financeiras. Essas funções só serão adicionadas com autenticação, limites, logs e aprovações explícitas.
