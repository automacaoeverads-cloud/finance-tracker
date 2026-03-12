import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  iconBg?: string
  trend?: { value: string; positive: boolean }
}

export default function StatCard({ title, value, subtitle, icon, iconBg = 'bg-blue-100', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all duration-200 group"
      style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              'text-xs mt-2 font-semibold inline-flex items-center gap-1',
              trend.positive ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                trend.positive ? 'bg-emerald-100' : 'bg-red-100'
              )}>
                {trend.positive ? '↑' : '↓'}
              </span>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
          iconBg
        )}>
          {icon}
        </div>
      </div>
    </div>
  )
}
