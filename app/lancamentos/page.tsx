'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PAYMENT_METHODS } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import TransactionTable from '@/components/TransactionTable'
import { Search, Filter, Plus } from 'lucide-react'
import Link from 'next/link'

export default function Lancamentos() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterMinValue, setFilterMinValue] = useState('')
  const [filterMaxValue, setFilterMaxValue] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: cats }, { data: txns }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*, category:categories(*)').order('date', { ascending: false }),
    ])
    setCategories(cats || [])
    setTransactions(txns || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este lançamento?')) return
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const filtered = transactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && t.category_id !== filterCategory) return false
    if (filterPayment && t.payment_method !== filterPayment) return false
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    if (filterMinValue && t.amount < parseFloat(filterMinValue)) return false
    if (filterMaxValue && t.amount > parseFloat(filterMaxValue)) return false
    return true
  })

  const total = filtered.reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-teal-900">Lançamentos</h2>
          <p className="text-sm text-gray-400 mt-1">{filtered.length} registros · {formatCurrency(total)}</p>
        </div>
        <Link
          href="/lancamentos/novo"
          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Gasto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-teal-800">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar descrição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30 text-gray-600"
          >
            <option value="">Todas categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30 text-gray-600"
          >
            <option value="">Todos pagamentos</option>
            {PAYMENT_METHODS.map(pm => (
              <option key={pm.value} value={pm.value}>{pm.icon} {pm.label}</option>
            ))}
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30 text-gray-600"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="R$ min"
              value={filterMinValue}
              onChange={e => setFilterMinValue(e.target.value)}
              className="w-1/2 px-3 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
            />
            <input
              type="number"
              placeholder="R$ max"
              value={filterMaxValue}
              onChange={e => setFilterMaxValue(e.target.value)}
              className="w-1/2 px-3 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          <TransactionTable transactions={filtered} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}
