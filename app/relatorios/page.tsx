'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { CategoryPieChart, MonthlyAreaChart } from '@/components/Charts'

export default function Relatorios() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*, category:categories(*)').order('date', { ascending: false }),
    ]).then(([{ data: cats }, { data: txns }]) => {
      setCategories(cats || [])
      setTransactions(txns || [])
    })
  }, [])

  const monthTxns = transactions.filter(t => t.date.startsWith(selectedMonth))
  const totalMonth = monthTxns.reduce((acc, t) => acc + t.amount, 0)

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: monthTxns.filter(t => t.category_id === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = transactions.filter(t => t.date.startsWith(key)).reduce((a, t) => a + t.amount, 0)
    return {
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d),
      total,
    }
  })

  // Top 5 gastos do mês
  const top5 = [...monthTxns].sort((a, b) => b.amount - a.amount).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-teal-900">Relatórios</h2>
          <p className="text-sm text-gray-400 mt-1">Análise detalhada dos seus gastos</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total do mês</p>
          <p className="text-2xl font-bold text-teal-700">{formatCurrency(totalMonth)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Lançamentos</p>
          <p className="text-2xl font-bold text-teal-700">{monthTxns.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Média por gasto</p>
          <p className="text-2xl font-bold text-teal-700">{formatCurrency(totalMonth / (monthTxns.length || 1))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-4">Distribuição por Categoria — {formatMonth(selectedMonth)}</h3>
          {pieData.length > 0 ? <CategoryPieChart data={pieData} /> : (
            <p className="text-center text-gray-400 py-16 text-sm">Sem dados para este mês</p>
          )}
        </div>

        {/* Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-4">Evolução — Últimos 12 Meses</h3>
          <MonthlyAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-4">Por Categoria</h3>
          {pieData.length > 0 ? (
            <div className="space-y-3">
              {pieData.sort((a, b) => b.value - a.value).map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                  <span className="text-sm font-semibold text-teal-700">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {totalMonth > 0 ? ((item.value / totalMonth) * 100).toFixed(0) : 0}%
                  </span>
                  <div className="w-24 h-2 bg-teal-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${totalMonth > 0 ? (item.value / totalMonth) * 100 : 0}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">Sem dados</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
          <h3 className="font-semibold text-teal-900 mb-4">Top 5 Maiores Gastos</h3>
          {top5.length > 0 ? (
            <div className="space-y-3">
              {top5.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 flex-1 truncate">{t.description}</span>
                  {t.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: t.category.color + '80' }}>
                      {t.category.name}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-teal-700 flex-shrink-0">{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  )
}
