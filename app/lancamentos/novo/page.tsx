'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Category, PAYMENT_METHODS } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

export default function NovoLancamento() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    payment_method: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) return
    setLoading(true)
    const { error } = await supabase.from('transactions').insert({
      description: form.description,
      amount: parseFloat(form.amount),
      category_id: form.category_id || null,
      payment_method: form.payment_method || null,
      date: form.date,
    })
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm({ description: '', amount: '', category_id: '', payment_method: '', date: new Date().toISOString().split('T')[0] })
      }, 1500)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-teal-900">Novo Gasto</h2>
        <p className="text-sm text-gray-400 mt-1">Registre um novo lançamento</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-teal-50">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-teal-800 mb-2">Descrição *</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Almoço no restaurante"
              className="w-full px-4 py-3 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-teal-800 mb-2">Valor (R$) *</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="0,00"
                className="w-full px-4 py-3 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-teal-800 mb-2">Data *</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-teal-800 mb-2">Categoria</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30 text-gray-600"
              >
                <option value="">Sem categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-teal-800 mb-2">Forma de pagamento</label>
              <select
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30 text-gray-600"
              >
                <option value="">Não informado</option>
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm.value} value={pm.value}>{pm.icon} {pm.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/lancamentos')}
              className="flex-1 py-3 rounded-xl border border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {success ? (
                <><CheckCircle className="w-4 h-4" /> Salvo!</>
              ) : loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Salvar Gasto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
