import { useQuery } from '@tanstack/react-query'
import { dealsApi } from '../api/deals'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatCard from '../components/ui/StatCard'
import Badge, { stageBadgeVariant } from '../components/ui/Badge'
import { DollarSign, TrendingUp, Target } from 'lucide-react'

const COLORS = ['#4f8ef7', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#6b7280']

import { fmt } from '../utils/format'

export default function Fundraising() {
  const { data: deals = [] } = useQuery({ queryKey: ['deals'], queryFn: () => dealsApi.list() })
  const { data: stats } = useQuery({ queryKey: ['deals', 'stats'], queryFn: () => dealsApi.stats() })

  const chartData = stats ? Object.entries(stats.by_stage).map(([stage, count]) => ({ stage: stage.replace('_', ' '), count })) : []
  const wonDeals = deals.filter(d => d.stage === 'closed_won')
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
  const totalRaised = wonDeals.reduce((s, d) => s + (d.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Raised" value={fmt(totalRaised)} icon={DollarSign} color="green" />
        <StatCard label="Pipeline Value" value={fmt(stats?.total_value ?? 0)} icon={TrendingUp} color="blue" />
        <StatCard label="Active Deals" value={activeDeals.length} icon={Target} color="purple" />
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Deals by Stage</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={32}>
            <XAxis dataKey="stage" tick={{ fill: '#8b92a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b92a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1d26', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f1f3f9' }} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Active Pipeline</h2>
        <div className="space-y-2">
          {activeDeals.length === 0 ? <p className="text-text-muted text-sm text-center py-6">No active deals</p> : activeDeals.map(deal => (
            <div key={deal.id} className="flex items-center gap-4 py-2 border-b border-bg-border/50">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium text-sm truncate">{deal.title}</p>
                <p className="text-text-muted text-xs">{deal.startup?.name ?? '—'} · {deal.investor?.name ?? 'No investor'}</p>
              </div>
              <Badge variant={stageBadgeVariant(deal.stage)}>{deal.stage.replace('_', ' ')}</Badge>
              <span className="text-text-secondary text-sm w-20 text-right">{deal.amount ? fmt(deal.amount) : '—'}</span>
              <div className="flex items-center gap-2 w-24">
                <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent-blue rounded-full" style={{ width: `${deal.probability}%` }} />
                </div>
                <span className="text-text-muted text-xs">{deal.probability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
