'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PAYMENT_METHODS, getPersonColor } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import TransactionTable from '@/components/TransactionTable'
import { CategoryPieChart, MonthlyAreaChart, PaymentBarChart } from '@/components/Charts'
import { TrendingDown, Wallet, Tag, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: cats }, { data: txns }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*, category:categories(*)').order('date', { ascending: false }).limit(100),
    ])
    setCategories(cats || [])
    setTransactions(txns || [])
    setLoading(false)
  }

  const thisMonthTxns = transactions.filter(t => t.date.startsWith(currentMonth))
  const totalMonth = thisMonthTxns.reduce((acc, t) => acc + t.amount, 0)
  const totalAll = transactions.reduce((acc, t) => acc + t.amount, 0)
  const avgMonth = totalMonth / (thisMonthTxns.length || 1)

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: thisMonthTxns.filter(t => t.category_id === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = transactions.filter(t => t.date.startsWith(key)).reduce((a, t) => a + t.amount, 0)
    return {
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d),
      total,
    }
  })

  // Dados por pessoa (mês atual)
  const allPeople = Array.from(new Set(thisMonthTxns.map(t => t.person).filter(Boolean))) as string[]
  const personData = allPeople.map(name => ({
    name,
    value: thisMonthTxns.filter(t => t.person === name).reduce((a, t) => a + t.amount, 0),
    color: getPersonColor(name),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const paymentData = PAYMENT_METHODS.map(pm => ({
    name: `${pm.icon} ${pm.label}`,
    value: thisMonthTxns.filter(t => t.payment_method === pm.value).reduce((a, t) => a + t.amount, 0),
    color: pm.color,
    icon: pm.icon,
  })).filter(d => d.value > 0)

  const recent = transactions.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-7 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">{formatMonth(currentMonth)}</p>
        </div>
        <Link
          href="/lancamentos/novo"
          className="hidden sm:flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          + Novo Gasto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Gasto este mês"
          value={formatCurrency(totalMonth)}
          subtitle={`${thisMonthTxns.length} lançamentos`}
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
          value={formatCurrency(avgMonth)}
          subtitle="este mês"
          icon={<Calendar className="w-5 h-5 text-pink-500" />}
          iconBg="bg-pink-100"
        />
        <StatCard
          title="Categorias"
          value={String(categories.length)}
          subtitle="ativas"
          icon={<Tag className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Por Categoria</h3>
          <p className="text-xs text-slate-400 mb-4">{formatMonth(currentMonth)}</p>
          {pieData.length > 0 ? (
            <CategoryPieChart data={pieData} />
          ) : (
            <p className="text-center text-slate-300 py-12 text-sm">Sem dados este mês</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Evolução Mensal</h3>
          <p className="text-xs text-slate-400 mb-4">Últimos 6 meses</p>
          <MonthlyAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Payment chart */}
      {paymentData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Por Forma de Pagamento</h3>
          <p className="text-xs text-slate-400 mb-5">{formatMonth(currentMonth)} — distribuição dos gastos</p>
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
                          width: `${totalMonth > 0 ? (pm.value / totalMonth) * 100 : 0}%`,
                          backgroundColor: pm.color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-9 text-right font-semibold">
                    {totalMonth > 0 ? ((pm.value / totalMonth) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Person breakdown */}
      {personData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-slate-700 mb-1">Gastos por Pessoa</h3>
          <p className="text-xs text-slate-400 mb-5">{formatMonth(currentMonth)} — quanto cada pessoa gastou</p>
          <div className="space-y-3">
            {personData.map(person => (
              <div key={person.name} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: person.color }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 font-medium truncate">{person.name}</span>
                    <span className="text-blue-600 font-bold ml-2">{formatCurrency(person.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalMonth > 0 ? (person.value / totalMonth) * 100 : 0}%`,
                        backgroundColor: person.color,
                        filter: 'brightness(0.85)'
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-9 text-right font-semibold">
                  {totalMonth > 0 ? ((person.value / totalMonth) * 100).toFixed(0) : 0}%
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
            <h3 className="font-semibold text-slate-700">Últimos Lançamentos</h3>
            <p className="text-xs text-slate-400 mt-0.5">5 mais recentes</p>
          </div>
          <Link
            href="/lancamentos"
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 font-semibold transition-colors"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <TransactionTable transactions={recent} />
      </div>
    </div>
  )
}
