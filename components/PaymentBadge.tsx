import { PAYMENT_METHODS } from '@/lib/supabase'

interface Props {
  method: string | null
}

export default function PaymentBadge({ method }: Props) {
  if (!method) return <span className="text-gray-300 text-sm">—</span>
  const pm = PAYMENT_METHODS.find(p => p.value === method)
  if (!pm) return <span className="text-sm text-gray-400">{method}</span>
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: pm.color + '90', color: '#134e4a' }}
    >
      {pm.icon} {pm.label}
    </span>
  )
}
