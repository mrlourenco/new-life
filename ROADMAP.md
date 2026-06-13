# Roadmap — New Life

Visão: evoluir de protótipo local-first (modelar a funcionalidade) para um produto
treinador→clientes, mantendo o frontend estático no GitHub Pages e a app cliente
a funcionar offline.

## Fase 0 — Preparar o protótipo (sem backend) ✅

- [x] Camada de repositório única (`src/utils/storage.ts`) — todos os hooks passam
      por ela; migrar para um backend de sync passa a ser trocar um módulo
- [x] Timestamps `created_at`/`updated_at` em todas as entidades persistidas,
      carimbados centralmente nos stores (`stamp()`) — pré-requisito de sync
- [x] Export/import completo (treino + nutrição + perfil) em Perfil → Dados
      (`src/utils/backup.ts`) — backup hoje, veículo de migração no primeiro login

## Fase 1 — Backend single-user com sync (~1-2 semanas)

- [ ] Projeto Supabase; schema Postgres espelhando `src/types/` (tabelas:
      `workout_plans`, `workout_logs`, `meal_templates`, `nutrition_logs`,
      `nutrition_plans`, `week_assignments`, `profiles`), todas com `user_id`
      e row-level security "só o dono"
- [ ] Auth opcional por magic link — sem login a app continua 100% local
- [ ] Sync offline-first simples: localStorage é a fonte de leitura; push/pull
      com last-write-wins por `updated_at`
- [ ] Migração no primeiro login: upload do backup local
- [ ] `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` como secrets do GitHub Actions;
      deploy continua no GitHub Pages

Ganho imediato: dados sobrevivem ao browser e sincronizam entre dispositivos.

## Fase 2 — Modelo treinador→clientes (~3-6 semanas)

> ⚠️ Gate: validar antes com 3-5 PTs reais (o que usam, quanto pagam, o que falta).

- [ ] Tabela `trainer_clients` com convite por email/código e estado; é o cliente
      que autoriza (privacidade/GDPR)
- [ ] Políticas RLS: treinador lê dados dos clientes ativos e escreve planos
      atribuídos; cliente lê planos que lhe foram atribuídos
- [ ] Dashboard do treinador (rota `/coach`): lista de clientes, aderência semanal,
      evolução de cargas e peso, atribuição de planos de treino e nutrição
- [ ] Diferenciador a explorar: combinar treino+nutrição (alvos calóricos
      diferentes em dias de treino vs descanso, vista semanal unificada)

## Fase 3 — Produto vendável (só com utilizadores reais)

- [ ] Notificações push (PWA), mensagens treinador↔cliente
- [ ] Pagamentos (Stripe)
- [ ] Domínio próprio (mudar `base` do Vite para `/` + `start_url`/`scope` do
      manifest no mesmo commit em que o DNS ativa)

## Notas de contexto

- Mercado: incumbentes (Trainerize/TrueCoach/Everfit) cobram $19-27/mês de entrada
  e escalam por nº de clientes; nicho possível em ferramentas pt-PT com base de
  alimentos europeia (ex.: Open Food Facts) e combo treino+nutrição
- Posicionamento atual do protótipo: local-first, privado, sem conta — manter como
  modo "convidado" mesmo depois de existir backend
