'use client'

import { Transaction } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentBadge from '@/components/PaymentBadge'
import { Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'

interface Props {
  transactions: Transaction[]
  onDelete?: (id: string) => void
}

export default function TransactionTable({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Nenhum lançamento encontrado</p>
        <p className="text-sm mt-1">Adicione seu primeiro gasto!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-2 md:mx-0">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-teal-100">
            <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
            <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</th>
            <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</th>
            <th className="hidden sm:table-cell text-left py-3 px-3 md:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pagamento</th>
            <th className="text-right py-3 px-3 md:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
            {onDelete && <th className="py-3 px-3 md:px-4"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-50">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-teal-50/30 transition-colors group">
              <td className="py-3 px-3 md:px-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(t.date)}</td>
              <td className="py-3 px-3 md:px-4">
                <p className="text-sm font-medium text-gray-700">{t.description}</p>
                <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                  {t.category && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: t.category.color + '80', color: '#134e4a' }}
                    >
                      {t.category.icon} {t.category.name}
                    </span>
                  )}
                  <PaymentBadge method={t.payment_method} />
                </div>
              </td>
              <td className="hidden md:table-cell py-3 px-4">
                {t.category ? (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: t.category.color + '80', color: '#134e4a' }}
                  >
                    {t.category.icon} {t.category.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </td>
              <td className="hidden sm:table-cell py-3 px-3 md:px-4">
                <PaymentBadge method={t.payment_method} />
              </td>
              <td className="py-3 px-3 md:px-4 text-right font-semibold text-teal-700 whitespace-nowrap">{formatCurrency(t.amount)}</td>
              {onDelete && (
                <td className="py-3 px-3 md:px-4">
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/lancamentos/${t.id}/editar`}
                      className="text-teal-400 hover:text-teal-600 p-2 md:p-1 rounded min-w-[44px] md:min-w-0 flex items-center justify-center"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="text-red-400 hover:text-red-600 p-2 md:p-1 rounded min-w-[44px] md:min-w-0 flex items-center justify-center"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
