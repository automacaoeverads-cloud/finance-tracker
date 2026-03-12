import { PAYMENT_METHODS } from '@/lib/supabase'

interface Props {
  method: string | null
}

export default function PaymentBadge({ method }: Props) {
  if (!method) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">\u2014</span>
  const pm = PAYMENT_METHODS.find(p => p.value === method)
  if (!pm) return <span className="text-sm text-gray-400">{method}</span>
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${pm.bg} ${pm.text}`}>
      {pm.icon} {pm.label}
    </span>
  )
}
