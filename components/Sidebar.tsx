'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, Tag, PlusCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: List },
  { href: '/lancamentos/novo', label: 'Novo Gasto', icon: PlusCircle },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/relatorios', label: 'Relatórios', icon: TrendingUp },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-teal-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-teal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-teal-800 text-lg leading-tight">Finance</h1>
            <p className="text-xs text-teal-500 font-medium">Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium',
                active
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600'
              )}
            >
              <Icon className={cn('w-5 h-5', active ? 'text-teal-500' : 'text-gray-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-teal-100">
        <p className="text-xs text-gray-400 text-center">Finance Tracker ✦</p>
      </div>
    </aside>
  )
}
