import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Linkedin, Users } from 'lucide-react'
import { investorsApi } from '../api/investors'
import type { Investor } from '../types'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const STAGES = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth']
const INDUSTRIES = ['fintech', 'healthtech', 'edtech', 'saas', 'marketplace', 'deeptech', 'climate', 'other']

import { fmt } from '../utils/format'

interface FormData { name: string; firm: string; bio: string; investment_focus: string; industries: string[]; stages: string[]; min_investment: string; max_investment: string; location: string; linkedin_url: string }
const EMPTY: FormData = { name: '', firm: '', bio: '', investment_focus: '', industries: [], stages: [], min_investment: '', max_investment: '', location: '', linkedin_url: '' }

export default function Investors() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Investor | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)

  const { data, isLoading } = useQuery({ queryKey: ['investors'], queryFn: () => investorsApi.list() })

  const createMutation = useMutation({ mutationFn: (d: Partial<Investor>) => investorsApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['investors'] }); setModal(null) } })
  const updateMutation = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<Investor> }) => investorsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['investors'] }); setModal(null) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => investorsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['investors'] }) })

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (inv: Investor) => {
    setSelected(inv)
    setForm({ name: inv.name, firm: inv.firm ?? '', bio: inv.bio ?? '', investment_focus: inv.investment_focus ?? '', industries: inv.industries ?? [], stages: inv.stages ?? [], min_investment: String(inv.min_investment ?? ''), max_investment: String(inv.max_investment ?? ''), location: inv.location ?? '', linkedin_url: inv.linkedin_url ?? '' })
    setModal('edit')
  }

  const toggleArr = (field: 'industries' | 'stages', val: string) =>
    setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }))

  const handleSubmit = () => {
    const payload = { ...form, min_investment: form.min_investment ? Number(form.min_investment) : undefined, max_investment: form.max_investment ? Number(form.max_investment) : undefined }
    if (modal === 'create') createMutation.mutate(payload)
    else if (modal === 'edit' && selected) updateMutation.mutate({ id: selected.id, d: payload })
  }

  const items = (data?.items ?? []).filter(inv => inv.name.toLowerCase().includes(search.toLowerCase()) || (inv.firm ?? '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search investors..." className="input pl-8" />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 ml-auto"><Plus size={14} /> Add Investor</button>
      </div>

      {isLoading ? <LoadingSpinner /> : items.length === 0 ? (
        <EmptyState icon={Users} title="No investors yet" description="Add investor profiles to enable AI matching." action={<button onClick={openCreate} className="btn-primary">Add Investor</button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map(inv => (
            <div key={inv.id} className="card hover:border-accent-blue/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-text-primary">{inv.name}</p>
                  <p className="text-text-muted text-xs">{inv.firm ?? 'Independent Investor'}</p>
                </div>
                <div className="flex gap-1">
                  {inv.linkedin_url && <a href={inv.linkedin_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-accent-blue/10 rounded-lg text-text-muted hover:text-accent-blue transition-colors"><Linkedin size={14} /></a>}
                  <button onClick={() => openEdit(inv)} className="p-1.5 hover:bg-bg-hover rounded-lg text-text-muted hover:text-text-primary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => deleteMutation.mutate(inv.id)} className="p-1.5 hover:bg-accent-red/10 rounded-lg text-text-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              {inv.investment_focus && <p className="text-text-secondary text-sm mb-3 line-clamp-2">{inv.investment_focus}</p>}
              <div className="flex flex-wrap gap-1 mb-2">
                {(inv.industries ?? []).map(i => <Badge key={i} variant="blue">{i}</Badge>)}
                {(inv.stages ?? []).map(s => <Badge key={s} variant="purple">{s}</Badge>)}
              </div>
              {(inv.min_investment || inv.max_investment) && (
                <p className="text-text-muted text-xs">{fmt(inv.min_investment)} – {fmt(inv.max_investment)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Investor' : 'Edit Investor'} onClose={() => setModal(null)} size="lg">
          <div className="space-y-3">
            {(['name', 'firm', 'location', 'linkedin_url'] as const).map(f => (
              <div key={f}><label className="label capitalize">{f.replace('_', ' ')}</label><input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className="input" /></div>
            ))}
            <div><label className="label">Investment Focus</label><textarea value={form.investment_focus} onChange={e => setForm(f => ({ ...f, investment_focus: e.target.value }))} rows={2} className="input resize-none" placeholder="Describe investment thesis..." /></div>
            <div><label className="label">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} className="input resize-none" /></div>
            <div><label className="label">Industries</label><div className="flex flex-wrap gap-2">{INDUSTRIES.map(i => <button key={i} type="button" onClick={() => toggleArr('industries', i)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${form.industries.includes(i) ? 'bg-accent-blue/20 text-accent-blue' : 'bg-bg-hover text-text-secondary hover:text-text-primary'}`}>{i}</button>)}</div></div>
            <div><label className="label">Preferred Stages</label><div className="flex flex-wrap gap-2">{STAGES.map(s => <button key={s} type="button" onClick={() => toggleArr('stages', s)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${form.stages.includes(s) ? 'bg-accent-purple/20 text-accent-purple' : 'bg-bg-hover text-text-secondary hover:text-text-primary'}`}>{s}</button>)}</div></div>
            <div className="grid grid-cols-2 gap-3">
              {(['min_investment', 'max_investment'] as const).map(f => (
                <div key={f}><label className="label capitalize">{f.replace('_', ' ')}</label><input type="number" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className="input" placeholder="$" /></div>
              ))}
            </div>
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
