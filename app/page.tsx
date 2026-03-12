'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PaymentMethodDB, getPersonColor, Person } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import TransactionTable from '@/components/TransactionTable'
import { CategoryPieChart, MonthlyAreaChart, PaymentBarChart, PaidStatusChart } from '@/components/Charts'
import { TrendingDown, Wallet, Clock, Calendar, ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDB[]>([])
  const [loading, setLoading] = useState(true)

  const todayMonth = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  const [filterMonth, setFilterMonth] = useState(todayMonth)
  const [filterPerson, setFilterPerson] = useState('')

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

  const hasFilters = filterMonth !== todayMonth || filterPerson !== ''

  // Aplica filtros
  const filtered = transactions.filter(t => {
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    if (filterPerson && t.person !== filterPerson) return false
    return true
  })

  const totalFiltered = filtered.reduce((acc, t) => acc + t.amount, 0)
  const totalAll = transactions.reduce((acc, t) => acc + t.amount, 0)
  const avgFiltered = totalFiltered / (filtered.length || 1)

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: filtered.filter(t => t.category_id === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const base = filterPerson
      ? transactions.filter(t => t.date.startsWith(key) && t.person === filterPerson)
      : transactions.filter(t => t.date.startsWith(key))
    return {
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d),
      total: base.reduce((a, t) => a + t.amount, 0),
    }
  })

  const allPeople = Array.from(new Set(filtered.map(t => t.person).filter(Boolean))) as string[]
  const personData = allPeople.map(name => ({
    name,
    value: filtered.filter(t => t.person === name).reduce((a, t) => a + t.amount, 0),
    color: getPersonColor(name),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const pmSource = paymentMethods.length > 0
    ? paymentMethods.map(pm => ({ key: pm.name, label: pm.name, icon: pm.icon, color: pm.color }))
    : [
        { key: 'credito', label: 'Crédito', icon: '💳', color: '#e8d5f5' },
        { key: 'pix_debito', label: 'Pix/Débito', icon: '⚡', color: '#b2f0e8' },
        { key: 'dinheiro', label: 'Dinheiro', icon: '💵', color: '#c8f5c8' },
      ]

  const paymentData = pmSource.map(pm => ({
    name: `${pm.icon} ${pm.label}`,
    value: filtered.filter(t => t.payment_method === pm.key).reduce((a, t) => a + t.amount, 0),
    color: pm.color,
    icon: pm.icon,
  })).filter(d => d.value > 0)

  const paidData = [
    {
      name: '✓ Pagos',
      value: filtered.filter(t => t.paid).length,
      amount: filtered.filter(t => t.paid).reduce((a, t) => a + t.amount, 0),
      color: '#6ee7b7',
    },
    {
      name: '⏳ Pendentes',
      value: filtered.filter(t => !t.paid).length,
      amount: filtered.filter(t => !t.paid).reduce((a, t) => a + t.amount, 0),
      color: '#fcd34d',
    },
  ]

  const recent = filtered.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            {filterPerson ? `${filterPerson} · ` : ''}{formatMonth(filterMonth)}
          </p>
        </div>
        <Link
          href="/lancamentos/novo"
          className="hidden sm:flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          + Novo Gasto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-wrap items-center gap-3"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
        </span>
        <span className="text-sm font-semibold text-slate-600 mr-1">Filtrar:</span>

        <input
          type="month"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-700"
        />

        <select
          value={filterPerson}
          onChange={e => setFilterPerson(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50/60 text-slate-600"
        >
          <option value="">Todas as pessoas</option>
          {people.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setFilterMonth(todayMonth); setFilterPerson('') }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={filterPerson ? `Gasto — ${filterPerson}` : 'Gasto no período'}
          value={formatCurrency(totalFiltered)}
          subtitle={`${filtered.length} lançamentos`}
          icon={<TrendingDown className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total geral"
          value={formatCurrency(totalAll)}
          subtitle={`${transactions.length} registros`}
          icon={<Wallet className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-100"
        />
        <StatCard
          title="Média por lançamento"
          value={formatCurrency(avgFiltered)}
          subtitle="no período"
          icon={<Calendar className="w-5 h-5 text-pink-500" />}
          iconBg="bg-pink-100"
        />
        <StatCard
          title="Valor Pendente"
          value={formatCurrency(filtered.filter(t => !t.paid).reduce((a, t) => a + t.amount, 0))}
          subtitle={`${filtered.filter(t => !t.paid).length} lançamento${filtered.filter(t => !t.paid).length !== 1 ? 's' : ''} a pagar`}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-100"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Por Categoria</h3>
          <p className="text-xs text-slate-400 mb-4">{formatMonth(filterMonth)}</p>
          {pieData.length > 0 ? (
            <CategoryPieChart data={pieData} />
          ) : (
            <p className="text-center text-slate-300 py-12 text-sm">Sem dados neste período</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Evolução Mensal</h3>
          <p className="text-xs text-slate-400 mb-4">Últimos 6 meses{filterPerson ? ` — ${filterPerson}` : ''}</p>
          <MonthlyAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Payment chart */}
      {paymentData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Por Forma de Pagamento</h3>
          <p className="text-xs text-slate-400 mb-5">{formatMonth(filterMonth)} — distribuição dos gastos</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
            <PaymentBarChart data={paymentData} />
            <div className="space-y-3">
              {paymentData.map(pm => (
                <div key={pm.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: pm.color + '40' }}>
                    {pm.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600 font-medium truncate">{pm.name.split(' ').slice(1).join(' ')}</span>
                      <span className="text-blue-600 font-bold ml-2">{formatCurrency(pm.value)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${totalFiltered > 0 ? (pm.value / totalFiltered) * 100 : 0}%`,
                          backgroundColor: pm.color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-9 text-right font-semibold">
                    {totalFiltered > 0 ? ((pm.value / totalFiltered) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status de Pagamento */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100" style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Status de Pagamento</h3>
        <p className="text-xs text-slate-400 mb-4">Pagas vs Pendentes no período</p>
        <PaidStatusChart data={paidData} />
        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(paidData[0].amount)}</p>
            <p className="text-xs text-slate-400">{paidData[0].value} pagas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-500">{formatCurrency(paidData[1].amount)}</p>
            <p className="text-xs text-slate-400">{paidData[1].value} pendentes</p>
          </div>
        </div>
      </div>

      {/* Person breakdown — só mostrar se NÃO estiver filtrado por pessoa */}
      {!filterPerson && personData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Gastos por Pessoa</h3>
          <p className="text-xs text-slate-400 mb-5">{formatMonth(filterMonth)} — quanto cada pessoa gastou</p>
          <div className="space-y-3">
            {personData.map(person => (
              <div key={person.name} className="flex items-center gap-3">
                <button
                  onClick={() => setFilterPerson(person.name)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: person.color }}
                  title={`Filtrar por ${person.name}`}
                >
                  {person.name.charAt(0).toUpperCase()}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <button
                      onClick={() => setFilterPerson(person.name)}
                      className="text-slate-600 font-medium truncate hover:text-blue-600 transition-colors"
                    >
                      {person.name}
                    </button>
                    <span className="text-blue-600 font-bold ml-2">{formatCurrency(person.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalFiltered > 0 ? (person.value / totalFiltered) * 100 : 0}%`,
                        backgroundColor: person.color,
                        filter: 'brightness(0.85)'
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-9 text-right font-semibold">
                  {totalFiltered > 0 ? ((person.value / totalFiltered) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-700">
              {filterPerson ? `Lançamentos — ${filterPerson}` : 'Últimos Lançamentos'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{recent.length} mais recentes do período</p>
          </div>
          <Link
            href="/lancamentos"
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 font-semibold transition-colors"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <TransactionTable transactions={recent} paymentMethods={paymentMethods} />
      </div>
    </div>
  )
}
