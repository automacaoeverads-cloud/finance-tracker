# Finance Tracker — Documentação

## ⚙️ Regras de Manutenção (para o agente)

> **SEMPRE que alterar schema ou campos relevantes do Finance Tracker:**
>
> 1. Atualizar `DOCS.md` (este arquivo) com o novo campo/tabela
> 2. **Atualizar `/data/.openclaw/workspace-finance/MEMORY.md`** — o agente finance precisa saber de toda mudança de schema para funcionar corretamente
> 3. Rodar o SQL no Supabase via Management API (não esperar Arthur fazer manualmente)
>
> Nunca fazer deploy de uma feature nova sem sincronizar o MEMORY.md do agente finance.

## 🌐 Links

| | URL |
|---|---|
| **Site (produção)** | https://finance-tracker-automacaoeverads-2129s-projects.vercel.app |
| **GitHub** | https://github.com/automacaoeverads-cloud/finance-tracker |
| **Supabase** | https://supabase.com/dashboard/project/wqaugqgixkostcscfnsq |

---

## 🏗️ Arquitetura

```
Frontend (Next.js 14)
    ↕ REST API
Banco de Dados (Supabase / Postgres)
    ↕ CI/CD
GitHub → Vercel (deploy automático)
```

### Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Estilo:** Tailwind CSS v3, paleta pastel azul (blue/slate)
- **Gráficos:** Recharts (pizza + área + barras)
- **Banco:** Supabase (Postgres gerenciado)
- **Deploy:** Vercel via GitHub (push → auto-deploy)
- **Ícones:** Lucide React

---

## 🗄️ Banco de Dados

### Tabela `categories`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único gerado automaticamente |
| `name` | text | Nome da categoria |
| `color` | text | Cor em hex (ex: `#b2f0e8`) |
| `icon` | text | Emoji do ícone |
| `created_at` | timestamptz | Data de criação |

### Tabela `transactions`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único gerado automaticamente |
| `amount` | numeric(10,2) | Valor do gasto (sempre > 0) |
| `description` | text | Descrição do gasto |
| `category_id` | uuid (FK) | Referência à categoria (nullable) |
| `date` | date | Data do gasto |
| `payment_method` | text | Forma de pagamento: `credito`, `pix_debito`, `dinheiro` (nullable) |
| `person` | text | Quem gastou (nullable) — vinculado à tabela `people` |
| `created_at` | timestamptz | Data de criação do registro |

### Tabela `people`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único gerado automaticamente |
| `name` | text NOT NULL | Nome da pessoa |
| `created_at` | timestamptz | Data de criação |

### Tabela `payment_methods`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único gerado automaticamente |
| `name` | text NOT NULL UNIQUE | Nome da forma (ex: Nubank, Itaú, PIX) |
| `icon` | text NOT NULL | Emoji do ícone (default: 💳) |
| `color` | text NOT NULL | Cor em hex pastel (default: #BFDBFE) |
| `created_at` | timestamptz | Data de criação |

> **Atenção:** Tabelas `people` e `payment_methods` precisam ser criadas via SQL Editor. Ver seção "Setup Banco de Dados" abaixo.

### Categorias padrão criadas
| Ícone | Nome | Cor |
|---|---|---|
| 🍽️ | Alimentação | `#b2f0e8` (verde-água) |
| 🚗 | Transporte | `#c8e6f5` (azul claro) |
| 🎮 | Lazer | `#e8d5f5` (lilás) |
| 💊 | Saúde | `#f5d5e8` (rosa) |
| 🏠 | Moradia | `#f5f0c8` (amarelo) |
| 🛍️ | Vestuário | `#f5e0c8` (laranja) |
| 📚 | Educação | `#c8f5c8` (verde) |
| 💡 | Outros | `#f5c8c8` (vermelho claro) |

---

## 🗃️ Setup Banco de Dados (SQL Editor)

Rodar no Supabase SQL Editor para configurar as tabelas extras:

```sql
-- Adicionar coluna pessoa em transactions (se não existir)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS person text;

-- Criar tabela people
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Inserir pessoas iniciais
INSERT INTO people (name) VALUES ('Arthur'), ('Pedro'), ('Luana')
ON CONFLICT DO NOTHING;

-- Criar tabela payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '💳',
  color text NOT NULL DEFAULT '#BFDBFE',
  created_at timestamptz DEFAULT now()
);
```

> Após criar a tabela `payment_methods`, acesse `/formas-pagamento` no site para cadastrar as formas (Nubank, Itaú, PIX, etc.).

---

## 📁 Estrutura de Arquivos

```
finance-tracker/
├── app/
│   ├── layout.tsx              # Layout raiz (sidebar + main)
│   ├── globals.css             # Estilos globais + Tailwind
│   ├── page.tsx                # Dashboard (/) — com filtros de mês e pessoa
│   ├── lancamentos/
│   │   ├── page.tsx            # Lista de lançamentos (/lancamentos) — filtros avançados
│   │   ├── novo/
│   │   │   └── page.tsx        # Formulário novo gasto (/lancamentos/novo)
│   │   └── [id]/
│   │       └── editar/
│   │           └── page.tsx    # Formulário editar gasto
│   ├── categorias/
│   │   └── page.tsx            # Gerenciar categorias (/categorias)
│   ├── pessoas/
│   │   └── page.tsx            # Gerenciar pessoas (/pessoas)
│   └── relatorios/
│       └── page.tsx            # Relatórios e gráficos (/relatorios)
├── components/
│   ├── Sidebar.tsx             # Navegação lateral
│   ├── StatCard.tsx            # Card de estatística
│   ├── TransactionTable.tsx    # Tabela de lançamentos (com coluna Pessoa)
│   ├── PaymentBadge.tsx        # Badge de forma de pagamento
│   └── Charts.tsx              # Gráficos (pizza + área + barras)
├── lib/
│   ├── supabase.ts             # Client Supabase + tipos (Transaction, Category, Person)
│   └── utils.ts                # Formatação de moeda/data, cores
├── supabase-schema.sql         # SQL para criar as tabelas
├── .env.example                # Modelo de variáveis de ambiente
└── DOCS.md                     # Esta documentação
```

---

## 🔑 Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://wqaugqgixkostcscfnsq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sHmU6NkEDEkUkwRLVYv0hw_Xif3mLYY
```

---

## 📄 Páginas

### Dashboard (`/`)
- Barra de filtros: **mês** + **pessoa** (com botão "Limpar")
- Cards de estatística reativos ao filtro: gasto no período, total geral, média, nº de categorias
- Gráfico de pizza por categoria
- Gráfico de área: evolução mensal dos últimos 6 meses (respeita filtro de pessoa)
- Seção "Por Forma de Pagamento": cards com barras de progresso
- Seção "Gastos por Pessoa": só aparece quando não há filtro de pessoa; clicável para filtrar
- Tabela com os 5 últimos lançamentos do período filtrado

### Lançamentos (`/lancamentos`)
- Tabela completa com todas as colunas: Data, Descrição, Categoria, Pagamento, **Pessoa**, Valor
- Filtros: busca por descrição, categoria, pagamento, **pessoa**, mês, valor mín/máx
- Botão editar ✏️ e excluir 🗑️ no hover

### Novo Gasto (`/lancamentos/novo`)
- Campos: descrição, valor, data, categoria, forma de pagamento, **quem gastou**
- Select de pessoa carregado dinamicamente do Supabase

### Editar Gasto (`/lancamentos/[id]/editar`)
- Mesmos campos do formulário de novo gasto

### Categorias (`/categorias`)
- Criar, editar e excluir categorias
- Seletor de cor (pastéis) e ícone (emojis)

### Formas de Pagamento (`/formas-pagamento`)
- CRUD completo de formas de pagamento (Nubank, Itaú, PIX, dinheiro, cartões, etc.)
- Cada forma tem: nome, ícone (emoji) e cor (pastel)
- Preview em tempo real ao criar
- Os formulários de novo/editar gasto carregam as formas dinamicamente do banco
- Fallback para Crédito/Pix/Dinheiro se nenhuma forma estiver cadastrada

### Pessoas (`/pessoas`)
- Listar, adicionar e remover pessoas
- Avatar colorido por nome

### Relatórios (`/relatorios`)
- Seletor de mês
- Cards de resumo, gráficos, top 5 gastos

---

## 🔌 API Supabase (uso direto)

Base URL: `https://wqaugqgixkostcscfnsq.supabase.co/rest/v1`

Headers obrigatórios:
```
apikey: sb_publishable_sHmU6NkEDEkUkwRLVYv0hw_Xif3mLYY
Authorization: Bearer sb_publishable_sHmU6NkEDEkUkwRLVYv0hw_Xif3mLYY
Content-Type: application/json
```

### Listar lançamentos (com categoria)
```bash
GET /transactions?select=*,category:categories(*)&order=date.desc
```

### Inserir lançamento
```bash
POST /transactions
Body: { "amount": 45.00, "description": "Restaurante", "category_id": "uuid", "date": "2026-03-12", "payment_method": "pix_debito", "person": "Arthur" }
```

### Listar pessoas
```bash
GET /people?select=*&order=name
```

### Listar formas de pagamento
```bash
GET /payment_methods?select=*&order=name
```

---

## 🚀 Deploy

Push na branch `main` do GitHub → Vercel build automático.

### Fazer update manual via GitHub API (Composio)
Ver script `/tmp/github_push_single.mjs` ou `/tmp/github_push.mjs` no workspace.

---

## 🎨 Design System

- **Paleta:** azul pastel (blue-*) para acentos, slate-* para neutros
- **Background:** `#F8FAFC` / `#F1F5F9`
- **Cards:** `bg-white rounded-2xl border border-slate-100` + `box-shadow` leve
- **Inputs:** `rounded-xl border border-slate-200 focus:ring-blue-300 bg-slate-50/60`
- **Botões primários:** `bg-blue-500 hover:bg-blue-600 rounded-xl`
- **Cores de pessoa:** Arthur=#b2f0e8, Pedro=#c8e6f5, Luana=#f5d5e8 (definidas em `lib/supabase.ts`)

---

## 🔒 Segurança (atualizado 2026-03-15)

### Autenticação
- **Provider:** Supabase Auth (email/password)
- **Sessão:** armazenada em **cookies** via `@supabase/ssr` (não mais localStorage)
  - Isso permite verificação server-side no middleware

### Middleware (`middleware.ts`)
Proteção de rota server-side. Roda antes de cada request:
- Rota `/` → pública (landing + login)
- Rotas `/api/*` → passam direto (verificação interna por rota)
- `/api/setup-db` → retorna 404 em produção
- Todas as demais rotas (páginas) → verifica sessão via cookie; sem sessão → redirect para `/`

### Clientes Supabase
| Arquivo | Uso |
|---|---|
| `lib/supabase.ts` | Browser (Client Components) — `createBrowserClient` do `@supabase/ssr` |
| `lib/supabase-server.ts` | Server Components e Middleware — `createServerClient` do `@supabase/ssr` |

### RLS (Row Level Security)
Todas as tabelas têm RLS ativo e política `user_id = auth.uid()`:

| Tabela | RLS | Política |
|---|---|---|
| `transactions` | ✅ | `user_id = auth.uid()` |
| `categories` | ✅ | `user_id = auth.uid()` |
| `payment_methods` | ✅ | `user_id = auth.uid()` |
| `people` | ✅ | `user_id = auth.uid()` |

### Multi-usuário
- Cada usuário vê **somente seus próprios dados** — isolamento garantido pelo RLS
- Arthur: `user_id = 4a5c718d-074f-469a-8d54-086ed82a2210`

### Admin (`/admin`)
- Rota protegida pelo middleware (requer sessão)
- API `/api/admin/users` verifica adicionalmente se `user.email === 'automacao.everads@gmail.com'`
- Retorna apenas dados mínimos dos usuários (id, email, datas)

---

## 🚀 Como fazer deploy (regra obrigatória)

**SEMPRE usar o script de push via Composio** — nunca `git push` direto.

```js
// Script base: /data/.openclaw/workspace/finance-tracker/push_files.mjs
// Adaptar os arquivos no array `files` e rodar:
node push_files.mjs
```

Fluxo:
1. Editar arquivos localmente em `/data/.openclaw/workspace/finance-tracker/`
2. Atualizar `DOCS.md` + `/data/.openclaw/workspace-finance/MEMORY.md` com o que mudou
3. Rodar o script de push (Composio → GitHub)
4. Vercel faz build automático via webhook

---

*Atualizado em: 2026-03-15 | Stack: Next.js 14 + Supabase + Vercel + @supabase/ssr*
