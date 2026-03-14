import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'
import { Bell, LogOut, User } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/':             'Dashboard',
  '/startups':     'Startups',
  '/investors':    'Investors',
  '/deal-flow':    'Deal Flow',
  '/fundraising':  'Fundraising',
  '/accelerator':  'Accelerator',
  '/events':       'Events',
  '/documents':    'Documents',
  '/messages':     'Messages',
  '/ai-assistant': 'AI Assistant',
}

function Header() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Platform'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  }

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-bg-border bg-bg-secondary">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary">
          <Bell size={16} />
        </button>
        <button className="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary">
          <User size={16} />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-accent-red/10 transition-colors text-text-secondary hover:text-accent-red"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <RightPanel />
    </div>
  )
}
