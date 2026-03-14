import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, Trash2, RefreshCw } from 'lucide-react'
import { aiApi } from '../api/ai'
import { startupsApi } from '../api/startups'
import type { Document } from '../types'
import Modal from '../components/ui/Modal'
import Badge, { stageBadgeVariant } from '../components/ui/Badge'
import ScoreRing from '../components/ui/ScoreRing'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Documents() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [startupId, setStartupId] = useState('')
  const [docType, setDocType] = useState('pitch_deck')
  const [uploading, setUploading] = useState(false)
  const [viewDoc, setViewDoc] = useState<Document | null>(null)

  const { data: docs = [], isLoading } = useQuery({ queryKey: ['documents'], queryFn: () => aiApi.listDocuments() })
  const { data: startups } = useQuery({ queryKey: ['startups'], queryFn: () => startupsApi.list({ per_page: 100 }) })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => aiApi.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })

  const pollDocument = async (id: number) => {
    try {
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 3000))
        const doc = await aiApi.getDocument(id)
        qc.setQueryData(['documents'], (old: Document[] = []) => old.map(d => d.id === id ? doc : d))
        if (doc.status === 'done' || doc.status === 'failed') break
      }
    } catch { /* polling can fail silently; user can refresh */ }
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !startupId) return
    setUploading(true)
    try {
      const doc = await aiApi.uploadDocument(Number(startupId), docType, file)
      qc.setQueryData(['documents'], (old: Document[] = []) => [doc, ...old])
      pollDocument(doc.id)
      if (fileRef.current) fileRef.current.value = ''
    } finally { setUploading(false) }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {/* Upload Card */}
      <div className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Upload size={15} />Upload Pitch Deck</h2>
        <div className="flex gap-3 flex-wrap">
          <select value={startupId} onChange={e => setStartupId(e.target.value)} className="input w-48">
            <option value="">Select startup</option>
            {startups?.items.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={docType} onChange={e => setDocType(e.target.value)} className="input w-40">
            <option value="pitch_deck">Pitch Deck</option>
            <option value="financial_model">Financial Model</option>
            <option value="term_sheet">Term Sheet</option>
          </select>
          <label className="btn-secondary cursor-pointer flex items-center gap-2">
            <FileText size={14} />
            {fileRef.current?.files?.[0]?.name ?? 'Choose PDF'}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" />
          </label>
          <button onClick={handleUpload} disabled={uploading || !startupId} className="btn-primary flex items-center gap-2">
            {uploading ? <><RefreshCw size={14} className="animate-spin" />Uploading...</> : <><Upload size={14} />Analyze</>}
          </button>
        </div>
      </div>

      {/* Document List */}
      {docs.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Upload a pitch deck PDF to analyze it with AI." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-border">
              <tr>{['File', 'Type', 'Status', 'AI Score', 'Date', ''].map(h => (
                <th key={h} className="text-left text-text-muted font-medium px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="border-b border-bg-border/50 hover:bg-bg-hover/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-text-muted" />
                      <span className="text-text-primary font-medium">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{doc.doc_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Badge variant={stageBadgeVariant(doc.status)}>{doc.status}</Badge>
                      {doc.status === 'analyzing' && <RefreshCw size={12} className="text-accent-yellow animate-spin" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {doc.ai_analysis ? <ScoreRing score={doc.ai_analysis.score} size={36} /> : <span className="text-text-muted text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {doc.status === 'done' && <button onClick={() => setViewDoc(doc)} className="p-1.5 hover:bg-bg-hover rounded text-text-muted hover:text-text-primary transition-colors text-xs">View</button>}
                      <button onClick={() => deleteMutation.mutate(doc.id)} className="p-1.5 hover:bg-accent-red/10 rounded text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewDoc?.ai_analysis && (
        <Modal title={`Analysis — ${viewDoc.filename}`} onClose={() => setViewDoc(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={viewDoc.ai_analysis.score} size={72} />
              <div>
                <p className="text-text-primary font-semibold text-lg">Score: {viewDoc.ai_analysis.score}/100</p>
                <p className="text-text-secondary text-sm">{viewDoc.ai_analysis.business_model}</p>
              </div>
            </div>
            {[['Strengths', viewDoc.ai_analysis.strengths, 'text-accent-green'], ['Weaknesses', viewDoc.ai_analysis.weaknesses, 'text-accent-red'], ['Suggestions', viewDoc.ai_analysis.suggestions, 'text-accent-blue'], ['Risks', viewDoc.ai_analysis.risks, 'text-accent-yellow']].map(([title, items, color]) => (
              <div key={String(title)}>
                <h4 className={`text-sm font-semibold mb-2 ${color}`}>{String(title)}</h4>
                <ul className="space-y-1">{(items as string[]).map((item, i) => <li key={i} className="text-text-secondary text-sm flex gap-2"><span className={String(color)}>•</span>{item}</li>)}</ul>
              </div>
            ))}
            <div><h4 className="text-sm font-semibold text-text-secondary mb-1">Market Size</h4><p className="text-text-secondary text-sm">{viewDoc.ai_analysis.market_size}</p></div>
            <div><h4 className="text-sm font-semibold text-text-secondary mb-1">Team Assessment</h4><p className="text-text-secondary text-sm">{viewDoc.ai_analysis.team_assessment}</p></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
