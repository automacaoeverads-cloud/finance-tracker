'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PAYMENT_METHODS } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { CategoryPieChart, MonthlyAreaChart, PaymentBarChart } from '@/components/Charts'
import PaymentBadge from '@/components/PaymentBadge'

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

  // Por forma de pagamento
  const paymentData = PAYMENT_METHODS.map(pm => ({
    name: `${pm.icon} ${pm.label}`,
    value: monthTxns.filter(t => t.payment_method === pm.value).reduce((a, t) => a + t.amount, 0),
    color: pm.color,
    icon: pm.icon,
  })).filter(d => d.value > 0)

  const top5 = [...monthTxns].sort((a, b) => b.amount - a.amount).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-teal-900">Relatórios</h2>
          <p className="text-sm text-gray-400 mt-1">Análise detalhada dos seus gastos</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-teal-100 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:bg-slate-800"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-teal-50 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total do mês</p>
          <p className="text-2xl font-bold text-teal-700">{formatCurrency(totalMonth)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-teal-50 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Lançamentos</p>
          <p className="text-2xl font-bold text-teal-700">{monthTxns.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-teal-50 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Média por gasto</p>
          <p className="text-2xl font-bold text-teal-700">{formatCurrency(totalMonth / (monthTxns.length || 1))}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-teal-50 dark:border-slate-800">
          <h3 className="font-semibold text-teal-900 mb-4">Por Categoria — {formatMonth(selectedMonth)}</h3>
          {pieData.length > 0 ? <CategoryPieChart data={pieData} /> : (
            <p className="text-center text-gray-400 py-16 text-sm">Sem dados para este mês</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-teal-50 dark:border-slate-800">
          <h3 className="font-semibold text-teal-900 mb-4">Evolução — Últimos 12 Meses</h3>
          <MonthlyAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Payment breakdown */}
      {paymentData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-teal-50 dark:border-slate-800">
          <h3 className="font-semibold text-teal-900 mb-4">Por Forma de Pagamento — {formatMonth(selectedMonth)}</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
            <PaymentBarChart data={paymentData} />
            <div className="space-y-4">
              {paymentData.sort((a, b) => b.value - a.value).map(pm => (
                <div key={pm.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: pm.color }}>
                    {pm.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 font-medium">{pm.name.split(' ').slice(1).join(' ')}</span>
                      <span className="text-teal-700 font-bold">{formatCurrency(pm.value)}</span>
                    </div>
                    <div className="h-2 bg-teal-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${totalMonth > 0 ? (pm.value / totalMonth) * 100 : 0}%`,
                          backgroundColor: pm.color,
                          filter: 'brightness(0.82)'
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-500 w-10 text-right">
                    {totalMonth > 0 ? ((pm.value / totalMonth) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category + Top5 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-teal-50 dark:border-slate-800">
          <h3 className="font-semibold text-teal-900 mb-4">Por Categoria</h3>
          {pieData.length > 0 ? (
            <div className="space-y-3">
              {pieData.sort((a, b) => b.value - a.value).map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                  <span className="text-sm font-semibold text-teal-700">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {totalMonth > 0 ? ((item.value / totalMonth) * 100).toFixed(0) : 0}%
                  </span>
                  <div className="w-20 h-2 bg-teal-50 rounded-full overflow-hidden">
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-teal-50 dark:border-slate-800">
          <h3 className="font-semibold text-teal-900 mb-4">Top 5 Maiores Gastos</h3>
          {top5.length > 0 ? (
            <div className="space-y-3">
              {top5.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: t.category.color + '80' }}>
                          {t.category.name}
                        </span>
                      )}
                      <PaymentBadge method={t.payment_method} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-teal-700 flex-shrink-0">{formatCurrency(t.amount)}</span>
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
