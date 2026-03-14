import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Rocket, Users, GitPullRequest, DollarSign,
  Zap, Calendar, FileText, MessageSquare, Bot,
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/startups',     icon: Rocket,          label: 'Startups'     },
  { to: '/investors',    icon: Users,           label: 'Investors'    },
  { to: '/deal-flow',    icon: GitPullRequest,  label: 'Deal Flow'    },
  { to: '/fundraising',  icon: DollarSign,      label: 'Fundraising'  },
  { to: '/accelerator',  icon: Zap,             label: 'Accelerator'  },
  { to: '/events',       icon: Calendar,        label: 'Events'       },
  { to: '/documents',    icon: FileText,        label: 'Documents'    },
  { to: '/messages',     icon: MessageSquare,   label: 'Messages'     },
  { to: '/ai-assistant', icon: Bot,             label: 'AI Assistant' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 h-full flex flex-col bg-bg-secondary border-r border-bg-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-bg-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <Rocket size={16} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary text-sm">IFAVHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-bg-border">
        <p className="text-text-muted text-xs">Startup Ecosystem Platform</p>
        <p className="text-text-muted text-xs">v1.0.0 MVP</p>
      </div>
    </aside>
  )
}
