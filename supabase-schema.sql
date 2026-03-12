-- Finance Tracker - Schema Supabase
-- Cole isso no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/wqaugqgixkostcscfnsq/sql

-- Tabela de categorias
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null default '#b2f0e8',
  icon text not null default '🏷️',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de lançamentos
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  amount numeric(10,2) not null check (amount > 0),
  description text not null,
  category_id uuid references categories(id) on delete set null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists transactions_date_idx on transactions(date desc);
create index if not exists transactions_category_idx on transactions(category_id);

-- RLS: desabilitar para simplicidade (habilitar depois se necessário)
alter table categories disable row level security;
alter table transactions disable row level security;

-- Dados de exemplo (opcional, apague se não quiser)
insert into categories (name, color, icon) values
  ('Alimentação', '#b2f0e8', '🍽️'),
  ('Transporte', '#c8e6f5', '🚗'),
  ('Lazer', '#e8d5f5', '🎮'),
  ('Saúde', '#f5d5e8', '💊'),
  ('Moradia', '#f5f0c8', '🏠'),
  ('Vestuário', '#f5e0c8', '🛍️'),
  ('Educação', '#c8f5c8', '📚'),
  ('Outros', '#f5c8c8', '💡')
on conflict do nothing;

-- ============================================
-- MIGRATION v2 — Pessoas (2026-03-12)
-- ============================================

-- Adicionar coluna "Quem gastou" nas transações
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS person text;

-- Tabela de pessoas
CREATE TABLE IF NOT EXISTS people (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Desabilitar RLS (consistente com o resto do projeto)
ALTER TABLE people DISABLE ROW LEVEL SECURITY;

-- Índice para buscas por pessoa em transactions
CREATE INDEX IF NOT EXISTS transactions_person_idx ON transactions(person);

-- Pessoas iniciais
INSERT INTO people (name) VALUES
  ('Arthur'),
  ('Pedro'),
  ('Luana')
ON CONFLICT DO NOTHING;
