# New Life — Treino & Nutrição

App mobile-first de registo de treinos e nutrição. SPA em React 19 + TypeScript + Vite + Tailwind 4, sem backend — todos os dados ficam em `localStorage` no dispositivo. Instalável como PWA (funciona offline depois da primeira visita).

## Funcionalidades

**Treino**
- Planos de treino com sessões mapeadas a dias da semana — criados na app, importados por JSON ou gerados por LLM (prompt incluído)
- Treino ativo: registo de peso/reps por série, timer de descanso com som, histórico do exercício na sessão anterior
- Histórico com estatísticas (volume, duração, séries completadas)

**Nutrição**
- Registo diário de refeições por categoria, com biblioteca de alimentos e receitas reutilizáveis
- Planos semanais com overrides por dia e lista de compras gerada automaticamente
- Evolução semanal/mensal de calorias face ao objetivo

**Perfil**
- Objetivos de macros (com equivalentes calóricos), registo de peso, início de semana configurável

## Desenvolvimento

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm test          # testes (vitest)
npm run lint      # eslint
npm run build     # build de produção (inclui typecheck)
```

## Estrutura

```
src/
  pages/        páginas por tab (Treino, Nutrição, Perfil)
  components/   componentes de UI (workout/, nutrition/)
  hooks/        stores em localStorage (useStore, useNutritionStore, …)
  utils/        cálculos de macros, datas, validação, formatação
  types/        tipos partilhados
  data/         base de alimentos predefinidos
```

## Deploy

Publicado em GitHub Pages com `base: '/new-life/'`. O workflow em `.github/workflows/deploy.yml` corre em cada push para `main` que altere `workout-tracker/**`.
