import { useQuery } from '@tanstack/react-query'
import { Rocket, Users, GitPullRequest, ArrowRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { startupsApi } from '../api/startups'
import { investorsApi } from '../api/investors'
import { dealsApi } from '../api/deals'
import StatCard from '../components/ui/StatCard'
import Badge, { stageBadgeVariant } from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

import { fmt } from '../utils/format'

export default function Dashboard() {
  const { data: startups } = useQuery({ queryKey: ['startups'], queryFn: () => startupsApi.list() })
  const { data: investors } = useQuery({ queryKey: ['investors'], queryFn: () => investorsApi.list() })
  const { data: deals, isLoading: dealsLoading } = useQuery({ queryKey: ['deals'], queryFn: () => dealsApi.list() })
  const { data: stats } = useQuery({ queryKey: ['deals', 'stats'], queryFn: () => dealsApi.stats() })

  const recentDeals = deals?.slice(0, 6) ?? []

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Startups"
          value={startups?.total ?? '—'}
          icon={Rocket}
          color="blue"
          trend={{ value: 'this month', up: true }}
        />
        <StatCard
          label="Investors"
          value={investors?.total ?? '—'}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Deals in Pipeline"
          value={stats?.total ?? '—'}
          icon={GitPullRequest}
          color="green"
          trend={{ value: fmt(stats?.total_value ?? null) + ' total value', up: true }}
        />
      </div>

      {/* Deal Pipeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary">Deal Pipeline</h2>
          </div>
          <Link to="/deal-flow" className="flex items-center gap-1 text-accent-blue text-xs hover:underline font-medium">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {dealsLoading ? (
          <LoadingSpinner text="Loading deals..." />
        ) : recentDeals.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">No deals yet. <Link to="/deal-flow" className="text-accent-blue hover:underline">Create your first deal →</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {['Startup', 'Investor', 'Stage', 'Amount', 'Probability'].map(h => (
                  <th key={h} className="text-left text-text-muted font-medium pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDeals.map(deal => (
                <tr key={deal.id} className="border-b border-bg-border/50 hover:bg-bg-hover/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-text-primary">{deal.startup?.name ?? '—'}</td>
                  <td className="py-3 pr-4 text-text-secondary">{deal.investor?.name ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={stageBadgeVariant(deal.stage)}>{deal.stage.replace('_', ' ')}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{fmt(deal.amount)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-blue rounded-full"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <span className="text-text-muted text-xs w-8 text-right">{deal.probability}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stage Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(stats.by_stage).map(([stage, count]) => (
            <div key={stage} className="card flex items-center justify-between">
              <Badge variant={stageBadgeVariant(stage)}>{stage.replace('_', ' ')}</Badge>
              <span className="text-text-primary font-semibold">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
