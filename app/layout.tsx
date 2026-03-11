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
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col md:ml-64">
            {/* Mobile header */}
            <header className="md:hidden sticky top-0 z-20 bg-white border-b border-teal-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-teal-800">Finance Tracker</span>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 p-4 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
