'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PAYMENT_METHODS } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import TransactionTable from '@/components/TransactionTable'
import { CategoryPieChart, MonthlyAreaChart, PaymentBarChart } from '@/components/Charts'
import { TrendingDown, Wallet, Tag, Calendar } from 'lucide-react'

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

  // Dados para pizza por categoria
  const pieData = categories.map(cat => ({
    name: cat.name,
    value: thisMonthTxns.filter(t => t.category_id === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  // Dados para gráfico mensal
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

  // Dados por forma de pagamento (mês atual)
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
        <div className="w-8 h-8 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-teal-900">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1">{formatMonth(currentMonth)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Gasto este mês"
          value={formatCurrency(totalMonth)}
          subtitle={`${thisMonthTxns.length} lançamentos`}
          icon={<TrendingDown className="w-5 h-5 text-teal-600" />}
          color="bg-teal-100"
        />
        <StatCard
          title="Total geral"
          value={formatCurrency(totalAll)}
          subtitle={`${transactions.length} registros`}
          icon={<Wallet className="w-5 h-5 text-purple-500" />}
          color="bg-pastel-purple"
        />
        <StatCard
          title="Média por lançamento"
          value={formatCurrency(avgMonth)}
          subtitle="este mês"
          icon={<Calendar className="w-5 h-5 text-pink-500" />}
          color="bg-pastel-pink"
        />
        <StatCard
          title="Categorias"
          value={String(categories.length)}
          subtitle="ativas"
          icon={<Tag className="w-5 h-5 text-blue-500" />}
          color="bg-pastel-blue"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-4">Por Categoria — {formatMonth(currentMonth)}</h3>
          {pieData.length > 0 ? (
            <CategoryPieChart data={pieData} />
          ) : (
            <p className="text-center text-gray-400 py-12 text-sm">Sem dados este mês</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-4">Evolução Mensal</h3>
          <MonthlyAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Payment chart */}
      {paymentData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-1">Por Forma de Pagamento — {formatMonth(currentMonth)}</h3>
          <p className="text-xs text-gray-400 mb-4">Distribuição dos gastos por método usado</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
            <PaymentBarChart data={paymentData} />
            <div className="space-y-3">
              {paymentData.map(pm => (
                <div key={pm.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: pm.color }}>
                    {pm.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{pm.name.split(' ').slice(1).join(' ')}</span>
                      <span className="text-teal-700 font-semibold">{formatCurrency(pm.value)}</span>
                    </div>
                    <div className="h-1.5 bg-teal-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${totalMonth > 0 ? (pm.value / totalMonth) * 100 : 0}%`,
                          backgroundColor: pm.color,
                          filter: 'brightness(0.85)'
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {totalMonth > 0 ? ((pm.value / totalMonth) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-teal-900">Últimos Lançamentos</h3>
          <a href="/lancamentos" className="text-sm text-teal-500 hover:text-teal-700 font-medium">
            Ver todos →
          </a>
        </div>
        <TransactionTable transactions={recent} />
      </div>
    </div>
  )
}
