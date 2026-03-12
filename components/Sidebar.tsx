'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, Tag, PlusCircle, TrendingUp, X, BarChart2, Users, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: List },
  { href: '/lancamentos/novo', label: 'Novo Gasto', icon: PlusCircle },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/formas-pagamento', label: 'Pagamentos', icon: CreditCard },
  { href: '/pessoas', label: 'Pessoas', icon: Users },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const content = (
    <aside className="h-full w-[260px] bg-white flex flex-col border-r border-slate-100" style={{ boxShadow: '1px 0 0 0 #F1F5F9' }}>
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">Finance</h1>
            <p className="text-xs text-blue-400 font-semibold tracking-wide">TRACKER</p>
          </div>
        </div>
        {/* Close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Menu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                active
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
              )}>
                <Icon className="w-4 h-4" />
              </span>
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">FT</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Finance Tracker</p>
            <p className="text-[10px] text-slate-400">v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-[260px] z-30">
        {content}
      </div>

      {/* Mobile: drawer with overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative z-50 w-[260px] flex-shrink-0">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
