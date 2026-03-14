import clsx from 'clsx'

type Variant = 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'gray'

interface Props {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const VARIANTS: Record<Variant, string> = {
  blue:   'bg-accent-blue/10 text-accent-blue',
  purple: 'bg-accent-purple/10 text-accent-purple',
  green:  'bg-accent-green/10 text-accent-green',
  yellow: 'bg-accent-yellow/10 text-accent-yellow',
  red:    'bg-accent-red/10 text-accent-red',
  gray:   'bg-bg-hover text-text-secondary',
}

const STAGE_VARIANTS: Record<string, Variant> = {
  idea:        'gray',
  mvp:         'yellow',
  seed:        'blue',
  series_a:    'purple',
  series_b:    'green',
  lead:        'gray',
  qualified:   'blue',
  proposal:    'yellow',
  negotiation: 'purple',
  closed_won:  'green',
  closed_lost: 'red',
  pending:     'gray',
  analyzing:   'yellow',
  done:        'green',
  failed:      'red',
}

export function stageBadgeVariant(stage: string): Variant {
  return STAGE_VARIANTS[stage] ?? 'gray'
}

export default function Badge({ children, variant = 'gray', className }: Props) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize', VARIANTS[variant], className)}>
      {children}
    </span>
  )
}
