import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { dealsApi } from '../api/deals'
import { startupsApi } from '../api/startups'
import { investorsApi } from '../api/investors'
import type { Deal, DealStage } from '../types'
import Modal from '../components/ui/Modal'
import Badge, { stageBadgeVariant } from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' },
]

import { fmt } from '../utils/format'

export default function DealFlow() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Deal | null>(null)
  const [form, setForm] = useState({ startup_id: '', investor_id: '', title: '', amount: '', stage: 'lead', probability: '50', notes: '' })

  const { data: deals = [], isLoading } = useQuery({ queryKey: ['deals'], queryFn: () => dealsApi.list() })
  const { data: startups } = useQuery({ queryKey: ['startups'], queryFn: () => startupsApi.list({ per_page: 100 }) })
  const { data: investors } = useQuery({ queryKey: ['investors'], queryFn: () => investorsApi.list({ per_page: 100 }) })

  const createMutation = useMutation({ mutationFn: (d: Partial<Deal>) => dealsApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); setModal(null) } })
  const updateMutation = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<Deal> }) => dealsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); setModal(null) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => dealsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }) })

  const handleStageChange = (deal: Deal, stage: DealStage) => updateMutation.mutate({ id: deal.id, d: { stage } })

  const handleSubmit = () => {
    const payload = { ...form, startup_id: Number(form.startup_id), investor_id: form.investor_id ? Number(form.investor_id) : undefined, amount: form.amount ? Number(form.amount) : undefined, probability: Number(form.probability) }
    if (modal === 'create') createMutation.mutate(payload)
    else if (modal === 'edit' && selected) updateMutation.mutate({ id: selected.id, d: payload })
  }

  const openEdit = (d: Deal) => {
    setSelected(d)
    setForm({ startup_id: String(d.startup_id), investor_id: String(d.investor_id ?? ''), title: d.title, amount: String(d.amount ?? ''), stage: d.stage, probability: String(d.probability), notes: d.notes ?? '' })
    setModal('edit')
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm({ startup_id: '', investor_id: '', title: '', amount: '', stage: 'lead', probability: '50', notes: '' }); setModal('create') }} className="btn-primary flex items-center gap-2"><Plus size={14} /> Add Deal</button>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map(({ key, label }) => {
          const colDeals = deals.filter(d => d.stage === key)
          return (
            <div key={key} className="w-56 shrink-0">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Badge variant={stageBadgeVariant(key)}>{label}</Badge>
                </div>
                <span className="text-text-muted text-xs">{colDeals.length}</span>
              </div>
              <div className="space-y-2">
                {colDeals.map(deal => (
                  <div key={deal.id} className="card text-sm hover:border-accent-blue/40 transition-colors">
                    <p className="font-medium text-text-primary mb-1 line-clamp-1">{deal.title}</p>
                    <p className="text-text-muted text-xs mb-2">{deal.startup?.name ?? '—'}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-accent-green text-xs font-medium">{fmt(deal.amount)}</span>
                      <span className="text-text-muted text-xs">{deal.probability}%</span>
                    </div>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {(() => {
                        const idx = STAGES.findIndex(s => s.key === key)
                        return <>
                          {idx > 0 && <button onClick={() => handleStageChange(deal, STAGES[idx - 1].key)} className="text-xs text-text-muted hover:text-accent-blue transition-colors">← {STAGES[idx - 1].label}</button>}
                          {idx < STAGES.length - 1 && <button onClick={() => handleStageChange(deal, STAGES[idx + 1].key)} className="text-xs text-text-muted hover:text-accent-blue transition-colors">→ {STAGES[idx + 1].label}</button>}
                        </>
                      })()}
                    </div>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(deal)} className="p-1 hover:bg-bg-hover rounded text-text-muted hover:text-text-primary transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => deleteMutation.mutate(deal.id)} className="p-1 hover:bg-accent-red/10 rounded text-text-muted hover:text-accent-red transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {colDeals.length === 0 && <div className="border border-dashed border-bg-border rounded-lg p-4 text-center text-text-muted text-xs">No deals</div>}
              </div>
            </div>
          )
        })}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Create Deal' : 'Edit Deal'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="label">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
            <div><label className="label">Startup</label>
              <select value={form.startup_id} onChange={e => setForm(f => ({ ...f, startup_id: e.target.value }))} className="input">
                <option value="">Select startup</option>
                {startups?.items.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div><label className="label">Investor (optional)</label>
              <select value={form.investor_id} onChange={e => setForm(f => ({ ...f, investor_id: e.target.value }))} className="input">
                <option value="">Select investor</option>
                {investors?.items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Amount ($)</label><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input" /></div>
              <div><label className="label">Stage</label>
                <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="input">
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select></div>
            </div>
            <div><label className="label">Probability ({form.probability}%)</label><input type="range" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} className="w-full" /></div>
            <div><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input resize-none" /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary">{modal === 'create' ? 'Create' : 'Save'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
