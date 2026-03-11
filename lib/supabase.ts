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

export type Transaction = {
  id: string
  amount: number
  description: string
  category_id: string
  category?: Category
  date: string
  created_at: string
}
