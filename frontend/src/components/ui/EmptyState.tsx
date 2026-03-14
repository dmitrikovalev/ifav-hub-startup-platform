import { type LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-xl bg-bg-card border border-bg-border flex items-center justify-center">
        <Icon size={22} className="text-text-muted" />
      </div>
      <p className="text-text-primary font-medium">{title}</p>
      {description && <p className="text-text-muted text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
