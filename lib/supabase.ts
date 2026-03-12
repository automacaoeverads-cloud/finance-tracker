import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Category = {
  id: string
  name: string
  color: string
  icon: string
  created_at: string
}

export type PaymentMethodDB = {
  id: string
  name: string
  icon: string
  color: string
  created_at: string
}

// Fallback hardcoded (para compatibilidade com dados antigos)
export const PAYMENT_METHODS_FALLBACK: { value: string; label: string; icon: string; color: string }[] = [
  { value: 'credito', label: 'Crédito', icon: '💳', color: '#e8d5f5' },
  { value: 'pix_debito', label: 'Pix / Débito', icon: '⚡', color: '#b2f0e8' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵', color: '#c8f5c8' },
]

// Compat alias
export const PAYMENT_METHODS = PAYMENT_METHODS_FALLBACK

export type Person = {
  id: string
  name: string
  created_at: string
}

export const PERSON_COLORS: Record<string, string> = {
  Arthur: '#b2f0e8',
  Pedro: '#c8e6f5',
  Luana: '#f5d5e8',
}

export function getPersonColor(name: string | null | undefined): string {
  if (!name) return '#e5e7eb'
  return PERSON_COLORS[name] || '#e8d5f5'
}

export type Transaction = {
  id: string
  amount: number
  description: string
  category_id: string
  category?: Category
  payment_method: string | null
  date: string
  created_at: string
  person?: string | null
}
