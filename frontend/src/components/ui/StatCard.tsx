import { type LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; up: boolean }
  color?: 'blue' | 'purple' | 'green' | 'yellow'
}

const COLORS = {
  blue:   'text-accent-blue bg-accent-blue/10',
  purple: 'text-accent-purple bg-accent-purple/10',
  green:  'text-accent-green bg-accent-green/10',
  yellow: 'text-accent-yellow bg-accent-yellow/10',
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'blue' }: Props) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('p-2.5 rounded-lg shrink-0', COLORS[color])}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-secondary text-xs font-medium mb-1">{label}</p>
        <p className="text-text-primary text-2xl font-bold">{value}</p>
        {trend && (
          <p className={clsx('text-xs mt-1 font-medium', trend.up ? 'text-accent-green' : 'text-accent-red')}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
