'use client'

import './globals.css'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { TrendingUp, Menu } from 'lucide-react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="pt-BR">
      <head>
        <title>Finance Tracker</title>
        <meta name="description" content="Controle seus gastos de forma simples e bonita" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="flex min-h-screen" style={{ backgroundColor: '#F4F6FB' }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col md:ml-[260px]">
            {/* Mobile header */}
            <header className="md:hidden sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-base">Finance Tracker</span>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 p-5 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
