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

export type PaymentMethod = 'credito' | 'pix' | 'dinheiro' | null

export const PAYMENT_METHODS: { value: string; label: string; icon: string; color: string; bg: string; text: string }[] = [
  { value: 'pix', label: 'PIX', icon: '\u26a1', color: '#bbf7d0', bg: 'bg-green-100', text: 'text-green-700' },
  { value: 'credito', label: 'Cr\u00e9dito', icon: '\U0001f4b3', color: '#bfdbfe', bg: 'bg-blue-100', text: 'text-blue-700' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '\U0001f4b5', color: '#fef08a', bg: 'bg-yellow-100', text: 'text-yellow-700' },
]

export type Transaction = {
  id: string
  amount: number
  description: string
  category_id: string
  category?: Category
  payment_method: PaymentMethod
  date: string
  created_at: string
}
