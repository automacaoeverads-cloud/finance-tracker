'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PaymentMethodDB, Person } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import TransactionTable from '@/components/TransactionTable'
import { Search, SlidersHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'

export default function Lancamentos() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterMinValue, setFilterMinValue] = useState('')
  const [filterMaxValue, setFilterMaxValue] = useState('')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterPaid, setFilterPaid] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: cats }, { data: txns }, { data: ppl }, { data: pms }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*, category:categories(*)').order('date', { ascending: false }),
      supabase.from('people').select('*').order('name'),
      supabase.from('payment_methods').select('*').order('name'),
    ])
    setCategories(cats || [])
    setTransactions(txns || [])
    setPeople(ppl || [])
    setPaymentMethods(pms || [])
    setLoading(false)
  }

  async function handleTogglePaid(id: string, paid: boolean) {
    await supabase.from('transactions').update({ paid }).eq('id', id)
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, paid } : t))
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
    if (filterPerson && t.person !== filterPerson) return false
    if (filterPaid === 'paid' && !t.paid) return false
    if (filterPaid === 'pending' && t.paid) return false
    return true
  })

  const total = filtered.reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lançamentos</h1>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            <span className="text-slate-600 font-semibold">{filtered.length}</span> registros ·{' '}
            <span className="text-blue-600 font-semibold">{formatCurrency(total)}</span>
          </p>
        </div>
        <Link
          href="/lancamentos/novo"
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Gasto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
          </span>
          <span className="text-sm font-semibold text-slate-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-3">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar descrição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-600"
          >
            <option value="">Todas categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-600"
          >
            <option value="">Todos pagamentos</option>
            {paymentMethods.length > 0
              ? paymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.icon} {pm.name}</option>)
              : <><option value="Crédito">💳 Crédito</option><option value="Pix / Débito">⚡ Pix/Débito</option><option value="Dinheiro">💵 Dinheiro</option></>
            }
          </select>
          <select
            value={filterPerson}
            onChange={e => setFilterPerson(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-600"
          >
            <option value="">Todas as pessoas</option>
            {people.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterPaid}
            onChange={e => setFilterPaid(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-600"
          >
            <option value="">Todos os status</option>
            <option value="paid">✓ Pagos</option>
            <option value="pending">⏳ Pendentes</option>
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-600"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="R$ min"
              value={filterMinValue}
              onChange={e => setFilterMinValue(e.target.value)}
              className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60"
            />
            <input
              type="number"
              placeholder="R$ max"
              value={filterMaxValue}
              onChange={e => setFilterMaxValue(e.target.value)}
              className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <TransactionTable transactions={filtered} onDelete={handleDelete} showEditLink paymentMethods={paymentMethods} onTogglePaid={handleTogglePaid} />
        )}
      </div>
    </div>
  )
}
