import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Bot, Users, Globe } from 'lucide-react'
import { startupsApi } from '../api/startups'
import { aiApi } from '../api/ai'
import type { Startup, AIEvaluation, InvestorMatch } from '../types'
import Modal from '../components/ui/Modal'
import Badge, { stageBadgeVariant } from '../components/ui/Badge'
import ScoreRing from '../components/ui/ScoreRing'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const STAGES = ['idea', 'mvp', 'seed', 'series_a', 'series_b']
const INDUSTRIES = ['fintech', 'healthtech', 'edtech', 'saas', 'marketplace', 'deeptech', 'climate', 'other']

import { fmt } from '../utils/format'

interface FormData { name: string; description: string; industry: string; stage: string; funding_goal: string; team_size: string; location: string; website: string }
const EMPTY_FORM: FormData = { name: '', description: '', industry: '', stage: '', funding_goal: '', team_size: '', location: '', website: '' }

export default function Startups() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | 'ai' | 'match' | null>(null)
  const [selected, setSelected] = useState<Startup | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [aiResult, setAiResult] = useState<AIEvaluation | null>(null)
  const [matchResult, setMatchResult] = useState<InvestorMatch[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['startups', filterStage],
    queryFn: () => startupsApi.list({ stage: filterStage || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<Startup>) => startupsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['startups'] }); setModal(null) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: Partial<Startup> }) => startupsApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['startups'] }); setModal(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => startupsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['startups'] }),
  })

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (s: Startup) => {
    setSelected(s)
    setForm({ name: s.name, description: s.description ?? '', industry: s.industry ?? '', stage: s.stage ?? '', funding_goal: String(s.funding_goal ?? ''), team_size: String(s.team_size ?? ''), location: s.location ?? '', website: s.website ?? '' })
    setModal('edit')
  }

  const handleSubmit = () => {
    const payload = { ...form, funding_goal: form.funding_goal ? Number(form.funding_goal) : undefined, team_size: form.team_size ? Number(form.team_size) : undefined }
    if (modal === 'create') createMutation.mutate(payload)
    else if (modal === 'edit' && selected) updateMutation.mutate({ id: selected.id, d: payload })
  }

  const handleEvaluate = async (s: Startup) => {
    setSelected(s); setAiLoading(true); setModal('ai'); setAiResult(null)
    try { setAiResult(await aiApi.evaluate({ startup_id: s.id })) }
    finally { setAiLoading(false) }
  }

  const handleMatch = async (s: Startup) => {
    setSelected(s); setAiLoading(true); setModal('match'); setMatchResult([])
    try { const r = await aiApi.match(s.id); setMatchResult(r.matches) }
    finally { setAiLoading(false) }
  }

  const items = (data?.items ?? []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search startups..." className="input pl-8" />
        </div>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="input w-36">
          <option value="">All stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 ml-auto">
          <Plus size={14} /> Add Startup
        </button>
      </div>

      {/* Table */}
      {isLoading ? <LoadingSpinner /> : items.length === 0 ? (
        <EmptyState icon={Plus} title="No startups yet" description="Add your first startup to get started." action={<button onClick={openCreate} className="btn-primary">Add Startup</button>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-border">
              <tr>{['Name', 'Industry', 'Stage', 'Goal', 'Team', 'AI Score', ''].map(h => (
                <th key={h} className="text-left text-text-muted font-medium px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id} className="border-b border-bg-border/50 hover:bg-bg-hover/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{s.name}</div>
                    {s.website && <a href={s.website} target="_blank" rel="noreferrer" className="text-text-muted text-xs flex items-center gap-1 hover:text-accent-blue"><Globe size={10} />{s.website}</a>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{s.industry ?? '—'}</td>
                  <td className="px-4 py-3">{s.stage ? <Badge variant={stageBadgeVariant(s.stage)}>{s.stage}</Badge> : '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{fmt(s.funding_goal)}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.team_size ?? '—'}</td>
                  <td className="px-4 py-3">{s.ai_score != null ? <ScoreRing score={s.ai_score} size={40} /> : <span className="text-text-muted text-xs">N/A</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => handleEvaluate(s)} title="AI Evaluate" className="p-1.5 hover:bg-accent-purple/10 rounded-lg text-text-muted hover:text-accent-purple transition-colors"><Bot size={14} /></button>
                      <button onClick={() => handleMatch(s)} title="Find Investors" className="p-1.5 hover:bg-accent-blue/10 rounded-lg text-text-muted hover:text-accent-blue transition-colors"><Users size={14} /></button>
                      <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-bg-hover rounded-lg text-text-muted hover:text-text-primary transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteMutation.mutate(s.id)} className="p-1.5 hover:bg-accent-red/10 rounded-lg text-text-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Startup' : 'Edit Startup'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {(['name', 'description', 'industry', 'stage', 'funding_goal', 'team_size', 'location', 'website'] as const).map(field => (
              field === 'stage' ? (
                <div key={field}><label className="label capitalize">{field}</label>
                  <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="input">
                    <option value="">Select stage</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
              ) : field === 'industry' ? (
                <div key={field}><label className="label">Industry</label>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="input">
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select></div>
              ) : field === 'description' ? (
                <div key={field}><label className="label">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input resize-none" placeholder="Describe your startup..." /></div>
              ) : (
                <div key={field}><label className="label capitalize">{field.replace('_', ' ')}</label>
                  <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="input" type={['funding_goal', 'team_size'].includes(field) ? 'number' : 'text'} /></div>
              )
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
                {modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Evaluation Modal */}
      {modal === 'ai' && (
        <Modal title={`AI Evaluation — ${selected?.name}`} onClose={() => setModal(null)} size="lg">
          {aiLoading ? <LoadingSpinner text="Analyzing with Gemini..." /> : aiResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ScoreRing score={aiResult.score} size={72} />
                <div>
                  <p className="text-text-primary font-semibold text-lg">Score: {aiResult.score}/100</p>
                  <p className="text-text-secondary text-sm">{aiResult.business_model}</p>
                </div>
              </div>
              {[['Strengths', aiResult.strengths, 'text-accent-green'], ['Weaknesses', aiResult.weaknesses, 'text-accent-red'], ['Suggestions', aiResult.suggestions, 'text-accent-blue'], ['Risks', aiResult.risks, 'text-accent-yellow']] .map(([title, items, color]) => (
                <div key={String(title)}>
                  <h4 className={`text-sm font-semibold mb-2 ${color}`}>{String(title)}</h4>
                  <ul className="space-y-1">{(items as string[]).map((item, i) => <li key={i} className="text-text-secondary text-sm flex gap-2"><span className={String(color)}>•</span>{item}</li>)}</ul>
                </div>
              ))}
              <div><h4 className="text-sm font-semibold text-text-secondary mb-1">Market Size</h4><p className="text-text-secondary text-sm">{aiResult.market_size}</p></div>
              <div><h4 className="text-sm font-semibold text-text-secondary mb-1">Team Assessment</h4><p className="text-text-secondary text-sm">{aiResult.team_assessment}</p></div>
            </div>
          ) : <p className="text-text-muted text-center py-8">Failed to evaluate</p>}
        </Modal>
      )}

      {/* Investor Match Modal */}
      {modal === 'match' && (
        <Modal title={`Investor Matches — ${selected?.name}`} onClose={() => setModal(null)} size="lg">
          {aiLoading ? <LoadingSpinner text="Finding matching investors..." /> : matchResult.length > 0 ? (
            <div className="space-y-3">
              {matchResult.map(m => (
                <div key={m.investor_id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="font-medium text-text-primary">{m.investor_name}</p><p className="text-text-muted text-xs">{m.firm ?? 'Independent'}</p></div>
                    <Badge variant="blue">{Math.round(m.similarity_score * 100)}% match</Badge>
                  </div>
                  <p className="text-text-secondary text-sm">{m.explanation}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-text-muted text-center py-8">No matches found</p>}
        </Modal>
      )}
    </div>
  )
}
