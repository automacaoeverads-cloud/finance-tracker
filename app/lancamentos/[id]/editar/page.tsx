'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, Category, PAYMENT_METHODS } from '@/lib/supabase'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditarLancamento() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [success, setSuccess] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    payment_method: '',
    date: '',
  })

  useEffect(() => {
    async function loadData() {
      const [{ data: cats }, { data: txn, error }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('transactions').select('*, category:categories(*)').eq('id', id).single(),
      ])
      setCategories(cats || [])
      if (error || !txn) {
        setNotFound(true)
      } else {
        setForm({
          description: txn.description,
          amount: String(txn.amount),
          category_id: txn.category_id || '',
          payment_method: txn.payment_method || '',
          date: txn.date,
        })
      }
      setLoadingData(false)
    }
    if (id) loadData()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) return
    setLoading(true)
    const { error } = await supabase.from('transactions').update({
      description: form.description,
      amount: parseFloat(form.amount),
      category_id: form.category_id || null,
      payment_method: form.payment_method || null,
      date: form.date,
    }).eq('id', id)
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/lancamentos')
      }, 1000)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-gray-400 text-lg">Lan\u00e7amento n\u00e3o encontrado.</p>
        <Link href="/lancamentos" className="mt-4 inline-flex items-center gap-2 text-teal-500 hover:text-teal-700 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar para lan\u00e7amentos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/lancamentos" className="text-teal-500 hover:text-teal-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-teal-900">Editar Gasto</h2>
          <p className="text-sm text-gray-400 mt-1">Atualize as informa\u00e7\u00f5es do lan\u00e7amento</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-teal-50">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-teal-800 mb-2">Descri\u00e7\u00e3o *</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Almo\u00e7o no restaurante"
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
                <option value="">N\u00e3o informado</option>
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
                'Salvar Altera\u00e7\u00f5es'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
