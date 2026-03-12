'use client'

import { Transaction, getPersonColor, PaymentMethodDB } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentBadge from '@/components/PaymentBadge'
import { Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'

interface Props {
  transactions: Transaction[]
  onDelete?: (id: string) => void
  showEditLink?: boolean
  paymentMethods?: PaymentMethodDB[]
}

export default function TransactionTable({ transactions, onDelete, showEditLink = false, paymentMethods }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-slate-500 font-semibold">Nenhum lançamento encontrado</p>
        <p className="text-sm text-slate-400 mt-1">Adicione seu primeiro gasto!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-2 md:mx-0">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
            <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Descrição</th>
            <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoria</th>
            <th className="hidden sm:table-cell text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pagamento</th>
            <th className="hidden lg:table-cell text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pessoa</th>
            <th className="text-right py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
            {(onDelete || showEditLink) && <th className="py-3 px-3 md:px-4"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="py-3.5 px-3 md:px-4 text-sm text-slate-400 whitespace-nowrap">{formatDate(t.date)}</td>
              <td className="py-3.5 px-3 md:px-4">
                <p className="text-sm font-medium text-slate-700">{t.description}</p>
                <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                  {t.category && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-slate-700"
                      style={{ backgroundColor: t.category.color + '80' }}
                    >
                      {t.category.icon} {t.category.name}
                    </span>
                  )}
                  <PaymentBadge method={t.payment_method} methods={paymentMethods} />
                  {t.person && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-slate-700"
                      style={{ backgroundColor: getPersonColor(t.person) }}
                    >
                      👤 {t.person}
                    </span>
                  )}
                </div>
              </td>
              <td className="hidden md:table-cell py-3.5 px-4">
                {t.category ? (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-slate-700"
                    style={{ backgroundColor: t.category.color + '80' }}
                  >
                    {t.category.icon} {t.category.name}
                  </span>
                ) : (
                  <span className="text-sm text-slate-300">—</span>
                )}
              </td>
              <td className="hidden sm:table-cell py-3.5 px-3 md:px-4">
                <PaymentBadge method={t.payment_method} methods={paymentMethods} />
              </td>
              <td className="hidden lg:table-cell py-3.5 px-3 md:px-4">
                {t.person ? (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-slate-700"
                    style={{ backgroundColor: getPersonColor(t.person) }}
                  >
                    {t.person}
                  </span>
                ) : (
                  <span className="text-sm text-slate-300">—</span>
                )}
              </td>
              <td className="py-3.5 px-3 md:px-4 text-right font-bold text-blue-600 whitespace-nowrap">{formatCurrency(t.amount)}</td>
              {(onDelete || showEditLink) && (
                <td className="py-3.5 px-3 md:px-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showEditLink && (
                      <Link
                        href={`/lancamentos/${t.id}/editar`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(t.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
