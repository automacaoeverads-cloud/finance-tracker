# Finance Tracker — Documentação

## 🌐 Links

| | URL |
|---|---|
| **Site (produção)** | https://finance-tracker-m6pozilt1-automacaoeverads-2129s-projects.vercel.app |
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
- **Estilo:** Tailwind CSS v3, paleta pastel verde-água
- **Gráficos:** Recharts (pizza + área)
- **Banco:** Supabase (Postgres gerenciado)
- **Deploy:** Vercel via Composio
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
| `created_at` | timestamptz | Data de criação do registro |

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

## 📁 Estrutura de Arquivos

```
finance-tracker/
├── app/
│   ├── layout.tsx              # Layout raiz (sidebar + main)
│   ├── globals.css             # Estilos globais + Tailwind
│   ├── page.tsx                # Dashboard (/)
│   ├── lancamentos/
│   │   ├── page.tsx            # Lista de lançamentos (/lancamentos)
│   │   └── novo/
│   │       └── page.tsx        # Formulário novo gasto (/lancamentos/novo)
│   ├── categorias/
│   │   └── page.tsx            # Gerenciar categorias (/categorias)
│   └── relatorios/
│       └── page.tsx            # Relatórios e gráficos (/relatorios)
├── components/
│   ├── Sidebar.tsx             # Navegação lateral
│   ├── StatCard.tsx            # Card de estatística
│   ├── TransactionTable.tsx    # Tabela de lançamentos
│   └── Charts.tsx              # Gráficos (pizza + área)
├── lib/
│   ├── supabase.ts             # Client Supabase + tipos
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

Configuradas no Vercel automaticamente. Para rodar local, criar `.env.local` com esses valores.

---

## 📄 Páginas

### Dashboard (`/`)
- Cards de estatística: gasto do mês, total geral, média por lançamento, nº de categorias
- Gráfico de pizza: distribuição por categoria do mês atual
- Gráfico de área: evolução mensal dos últimos 6 meses
- Tabela com os 5 últimos lançamentos

### Lançamentos (`/lancamentos`)
- Tabela completa de todos os gastos
- Filtros: busca por descrição, categoria, mês, valor mínimo/máximo
- Botão de excluir (aparece no hover)

### Novo Gasto (`/lancamentos/novo`)
- Campos: descrição, valor, data, categoria
- Feedback visual de sucesso após salvar

### Categorias (`/categorias`)
- Cards de todas as categorias
- Criar, editar e excluir categorias
- Seletor de cor (8 opções pastéis) e ícone (15 emojis)

### Relatórios (`/relatorios`)
- Seletor de mês
- Cards de resumo: total, quantidade, média
- Gráfico de pizza por categoria
- Gráfico de área dos últimos 12 meses
- Lista de categorias com barra de progresso e %
- Top 5 maiores gastos do mês

---

## 🔌 API Supabase (uso direto)

Base URL: `https://wqaugqgixkostcscfnsq.supabase.co/rest/v1`

Headers obrigatórios:
```
apikey: sb_publishable_sHmU6NkEDEkUkwRLVYv0hw_Xif3mLYY
Authorization: Bearer sb_publishable_sHmU6NkEDEkUkwRLVYv0hw_Xif3mLYY
Content-Type: application/json
```

### Listar categorias
```bash
GET /categories?select=*&order=name
```

### Listar lançamentos (com categoria)
```bash
GET /transactions?select=*,category:categories(*)&order=date.desc
```

### Inserir lançamento
```bash
POST /transactions
Body: { "amount": 45.00, "description": "Restaurante", "category_id": "uuid", "date": "2026-03-11" }
Header: Prefer: return=representation
```

### Deletar lançamento
```bash
DELETE /transactions?id=eq.<uuid>
```

---

## 🚀 Deploy

Deploy automático via Vercel ao fazer push na branch `main` do GitHub.

### Fazer update manual
```bash
cd finance-tracker
git add -A
git commit -m "feat: descrição"
git push origin main
```

Vercel detecta o push e faz o build automaticamente.

---

## 📱 Fase 2 — Integração WhatsApp (planejado)

Quando implementado, Arthur poderá enviar mensagens como:
- `"R$ 45 almoço"` → lançado em Alimentação
- `"45 uber"` → lançado em Transporte  
- `"gastos do mês"` → retorna resumo

Implementação: webhook no bot OpenClaw/Telegram, parser de mensagem, insert via Supabase API.

---

*Criado em: 2026-03-11 | Stack: Next.js 14 + Supabase + Vercel*
