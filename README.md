# CENTRAL IA

Painel em português para pesquisa de oportunidades de afiliados, preparação de campanhas, análise de mercado e automações controladas.

## Estado atual

A aplicação possui uma interface web e um backend Cloudflare Worker com banco D1. O Worker executa verificações de saúde por cron e mantém rotinas internas de pesquisa, seleção e preparação de conteúdo quando os serviços e dados necessários estão disponíveis.

### Afiliados e conteúdo
- Cadastro e análise de produtos e programas de afiliados.
- Verificação de requisitos mínimos antes de considerar uma campanha pronta: programa aprovado, links HTTPS e comissão positiva dentro de 0% a 100%.
- Priorização interna de oportunidades com base nos dados disponíveis. Estimativas não são lucro líquido nem previsão de vendas.
- Geração de kits e roteiros de campanha com IA, incluindo variações criativas e chamadas para ação.
- Preparação automática de até nove rascunhos diários distribuídos entre TikTok, Instagram Reels e YouTube Shorts, quando existem produtos elegíveis e Workers AI disponível.
- Histórico de campanhas e fila interna de publicações.

## Limites importantes

- **Rascunho não é publicação.** As integrações OAuth/APIs das redes sociais ainda precisam ser configuradas e autorizadas; o sistema não publica automaticamente nas contas neste estado.
- A aprovação de um programa de afiliados, a geração de links rastreáveis e a confirmação de taxas dependem das plataformas parceiras. A CENTRAL IA não deve inventar comissões nem aceitar termos legais em nome do usuário.
- Comissão estimada por venda não representa lucro líquido. Custos, impostos, devoluções, cancelamentos, atribuição e pagamento efetivo precisam ser considerados.
- O cron do Cloudflare executa rotinas agendadas; isso não significa que o ChatGPT trabalhe continuamente em segundo plano.
- Trading é informativo e não executa operações financeiras.

## Infraestrutura

- Frontend: GitHub Pages.
- Backend: Cloudflare Workers.
- Banco: Cloudflare D1.
- IA: Cloudflare Workers AI.
- Pesquisa web: integração Tavily, quando a chave estiver configurada e válida.

## Configuração segura

Não coloque senhas, tokens ou chaves no código-fonte, em commits ou neste README. Configure credenciais como secrets no painel do Cloudflare Worker. Integrações externas devem ser ativadas somente após autorização explícita e configuração segura.

## Verificações

O repositório executa testes de segurança, validação isolada e workflows de publicação do frontend e backend. Consulte a aba **Actions** do GitHub para conferir o resultado de cada execução.
