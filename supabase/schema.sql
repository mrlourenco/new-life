-- New Life — schema Fase 1
-- Corre isto no SQL Editor do teu projecto Supabase.
-- NOTA: se já correste uma versão anterior, faz DROP TABLE em cada tabela antes
-- de recriar, ou usa os comandos ALTER TABLE em baixo para corrigir a PK.

-- ── Tabelas de colecções (cada entidade = uma linha) ─────────────────────────
-- A PK é (user_id, id) para que o índice composto possa ser usado eficientemente
-- em queries que filtram por user_id.

create table if not exists workout_plans (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists workout_logs (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists workout_week_assignments (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists meal_templates (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists nutrition_logs (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists nutrition_plans (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists nutrition_week_assignments (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── Perfil (um registo por utilizador) ───────────────────────────────────────

create table if not exists profiles (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table workout_plans             enable row level security;
alter table workout_logs              enable row level security;
alter table workout_week_assignments  enable row level security;
alter table meal_templates            enable row level security;
alter table nutrition_logs            enable row level security;
alter table nutrition_plans           enable row level security;
alter table nutrition_week_assignments enable row level security;
alter table profiles                  enable row level security;

create policy "own" on workout_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on workout_week_assignments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on meal_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on nutrition_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on nutrition_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on nutrition_week_assignments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Migração (se já tinhas as tabelas com PK (id, user_id)) ─────────────────
-- Descomenta e corre se precisares de corrigir tabelas existentes:
--
-- alter table workout_plans drop constraint workout_plans_pkey;
-- alter table workout_plans add primary key (user_id, id);
-- (repete para cada tabela)
