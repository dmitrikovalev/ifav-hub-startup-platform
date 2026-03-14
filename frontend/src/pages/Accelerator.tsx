import { Zap, ExternalLink } from 'lucide-react'
import Badge from '../components/ui/Badge'

const PROGRAMS = [
  { name: 'Y Combinator', batch: 'W25', deadline: 'Oct 2025', equity: '7%', funding: '$500K', stage: 'Pre-seed / Seed', status: 'open', url: 'https://www.ycombinator.com' },
  { name: 'Techstars', batch: '2025', deadline: 'Rolling', equity: '6%', funding: '$120K', stage: 'Seed', status: 'open', url: 'https://www.techstars.com' },
  { name: '500 Global', batch: 'S25', deadline: 'Mar 2025', equity: '5%', funding: '$150K', stage: 'Pre-seed', status: 'closed', url: 'https://500.co' },
  { name: 'Sequoia Arc', batch: 'Ongoing', deadline: 'Rolling', equity: 'Varies', funding: 'Varies', stage: 'Seed – Series A', status: 'open', url: 'https://arc.sequoiacap.com' },
  { name: 'a16z START', batch: '2025', deadline: 'Aug 2025', equity: '0%', funding: 'N/A', stage: 'Idea / MVP', status: 'open', url: 'https://a16z.com/start' },
]

export default function Accelerator() {
  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border-accent-blue/20">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={18} className="text-accent-yellow" />
          <h2 className="text-text-primary font-semibold">Accelerator Programs</h2>
        </div>
        <p className="text-text-secondary text-sm">Curated list of top accelerator programs. Apply to the ones that fit your stage and industry.</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-bg-border">
            <tr>{['Program', 'Batch', 'Deadline', 'Equity', 'Funding', 'Stage', 'Status', ''].map(h => (
              <th key={h} className="text-left text-text-muted font-medium px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {PROGRAMS.map(p => (
              <tr key={p.name} className="border-b border-bg-border/50 hover:bg-bg-hover/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-text-primary">{p.name}</td>
                <td className="px-4 py-3 text-text-secondary">{p.batch}</td>
                <td className="px-4 py-3 text-text-secondary">{p.deadline}</td>
                <td className="px-4 py-3 text-text-secondary">{p.equity}</td>
                <td className="px-4 py-3 text-accent-green font-medium">{p.funding}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{p.stage}</td>
                <td className="px-4 py-3"><Badge variant={p.status === 'open' ? 'green' : 'gray'}>{p.status}</Badge></td>
                <td className="px-4 py-3">
                  <a href={p.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-accent-blue/10 rounded-lg text-text-muted hover:text-accent-blue transition-colors inline-flex">
                    <ExternalLink size={13} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
