'use client'

import './globals.css'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider, useAuth } from '@/lib/auth'
import { TrendingUp, Menu, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, BarChart2, ShieldCheck, Users } from 'lucide-react'

type AuthTab = 'landing' | 'login' | 'register'

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn, signUp } = useAuth()
  const [tab, setTab] = useState<AuthTab>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: err } = await signIn(email, password)
    setSubmitting(false)
    if (err) setError('Email ou senha incorretos.')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setSubmitting(true)
    const { error: err } = await signUp(email, password)
    setSubmitting(false)
    if (err) setError(err)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    )
  }

  // ── LANDING PAGE ──────────────────────────────────────────────
  if (!user && tab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Nav */}
        <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Finance Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/30"
            >
              Criar conta
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-900/50">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Controle seus gastos<br />
              <span className="text-emerald-400">com clareza</span>
            </h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Dashboard financeiro pessoal. Registre, categorize e acompanhe todos os seus gastos em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => { setTab('register'); setError('') }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-colors shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Criar conta grátis
              </button>
              <button
                onClick={() => { setTab('login'); setError('') }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-base transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Já tenho conta
              </button>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: BarChart2, title: 'Dashboard completo', desc: 'Gráficos e análises dos seus gastos por categoria e período' },
                { icon: ShieldCheck, title: 'Dados privados', desc: 'Cada usuário vê apenas seus próprios lançamentos' },
                { icon: Users, title: 'Multi-pessoa', desc: 'Controle gastos por pessoa com filtros e relatórios' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <p className="font-semibold text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── LOGIN / REGISTER FORM ──────────────────────────────────────
  if (!user && (tab === 'login' || tab === 'register')) {
    const isLogin = tab === 'login'
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-green-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-900/50">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Finance Tracker</h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-900 rounded-xl p-1 mb-6 border border-slate-800">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                !isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Card */}
          <div className="bg-slate-900 rounded-2xl p-7 border border-slate-800 shadow-2xl">
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-rose-400 bg-rose-900/20 border border-rose-800/50 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 mt-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isLogin ? 'Entrar' : 'Criar conta'}
              </button>
            </form>
          </div>

          <button
            onClick={() => setTab('landing')}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-400 mt-4 transition-colors"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  // ── AUTHENTICATED APP ──────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-slate-950 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-[260px]">
        <header className="md:hidden sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">Finance Tracker</span>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Finance Tracker</title>
        <meta name="description" content="Controle seus gastos de forma simples e bonita" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
