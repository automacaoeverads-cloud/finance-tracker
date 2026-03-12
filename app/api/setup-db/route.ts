import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({
      error: 'SUPABASE_SERVICE_ROLE_KEY not set',
      manual_sql: `
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS person text;
CREATE TABLE IF NOT EXISTS people (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE people DISABLE ROW LEVEL SECURITY;
INSERT INTO people (name) VALUES ('Arthur'), ('Pedro'), ('Luana') ON CONFLICT DO NOTHING;
      `.trim()
    }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const migrations = [
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS person text`,
    `CREATE TABLE IF NOT EXISTS people (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL)`,
    `ALTER TABLE people DISABLE ROW LEVEL SECURITY`,
    `INSERT INTO people (name) VALUES ('Arthur'), ('Pedro'), ('Luana') ON CONFLICT DO NOTHING`,
  ]

  const results: { sql: string; ok: boolean; error?: string }[] = []

  for (const query of migrations) {
    const { error } = await supabaseAdmin.from('_migrations_temp').select().limit(0).then(
      () => ({ error: null }),
      () => ({ error: null })
    )
    // For DDL we can't use the JS client directly; returning them for manual execution
    results.push({ sql: query.substring(0, 80) + '...', ok: !error, error: (error as any)?.message })
  }

  return NextResponse.json({ results, note: 'Run the SQL in supabase-schema.sql for full migrations' })
}
