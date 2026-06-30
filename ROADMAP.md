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

## Fase 1 — Backend single-user com sync (~1-2 semanas) ✅

- [x] Projeto Supabase; schema Postgres espelhando `src/types/` (tabelas:
      `workout_plans`, `workout_logs`, `workout_week_assignments`,
      `meal_templates`, `nutrition_logs`, `nutrition_plans`,
      `nutrition_week_assignments`, `profiles`), todas com `user_id`
      e row-level security "só o dono" (`supabase/schema.sql`)
- [x] Auth opcional por magic link (+ Google OAuth) — sem login a app
      continua 100% local (`src/hooks/useAuth.ts`)
- [x] Sync offline-first simples: localStorage é a fonte de leitura; push/pull
      com last-write-wins por `updated_at`, incluindo propagação de deleções
      (`src/lib/sync.ts`)
- [x] Migração no primeiro login: `pullAll` seguido de `pushAll` do que
      ainda não existe no remoto
- [x] `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` como secrets do GitHub Actions;
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

### Análise de mercado (2026-06)

Quatro categorias de concorrência:

1. **Registo de treino (consumer)** — Strong, Hevy, JEFIT, FitNotes. Têm catálogo
   de exercícios com centenas de entradas (vídeo/imagem), analytics de 1RM/volume,
   integração com wearables, e no caso do Hevy um feed social. O protótipo tem o
   loop nuclear equivalente mas falha em três pontos: sem catálogo de exercícios
   (nome/músculo/equipamento são texto livre), sem analytics avançados
   (PRs, 1RM estimado, gráficos de progressão), sem componente social.
2. **Registo de nutrição (consumer)** — MyFitnessPal, Cronometer, Lose It!,
   MacroFactor. Base de alimentos do protótipo tem ~40-50 entradas curadas
   manualmente vs milhões + scanner de código de barras do MyFitnessPal, e sem
   ajuste automático de TDEE como o MacroFactor. Não é uma batalha vencível em
   profundidade de dados — compete em fricção (sem conta, sem anúncios, grátis).
3. **Combo treino+nutrição** — Fitbod (treino, nutrição fraca), Future/Ladder
   (coaching humano caro). Poucos apps fazem bem as duas coisas com vista
   semanal unificada e lista de compras gerada do plano nutricional — whitespace
   genuíno.
4. **Treinador→clientes (B2B2C)** — Trainerize, TrueCoach, Everfit. $19-27/mês
   em USD, sem localização pt-PT. Nicho mais defensável a prazo, maior risco de
   execução (problema de distribuição/vendas a PTs, não só de produto) — daí o
   gate da Fase 2.

Vantagens reais: localização pt-PT a sério (idioma + produtos/pratos
portugueses, vs traduções genéricas da MFP/Cronometer); combo treino+nutrição
estrutural; PTs pequenos em Portugal sem vontade de pagar em USD por
ferramenta em inglês.

Riscos reais: catálogo de exercícios e base de alimentos são ordens de
magnitude menores que os incumbentes, visível ao utilizador no primeiro uso;
sem App Store/Play Store, a aquisição depende de boca-a-boca ou do canal
B2B2C (PTs) que ainda não existe.

**Próximo passo de produto sugerido por esta análise:** base de alimentos
europeia via Open Food Facts (ataca a maior lacuna visível — nutrição — sem
exigir validação de mercado prévia, ao contrário da Fase 2).
