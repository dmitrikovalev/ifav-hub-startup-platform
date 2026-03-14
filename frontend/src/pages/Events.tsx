import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Video, MapPin, Calendar } from 'lucide-react'
import { eventsApi } from '../api/events'
import type { Event } from '../types'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const EVENT_TYPES = ['meetup', 'demo_day', 'webinar', 'conference', 'workshop']

export default function Events() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Event | null>(null)
  const [form, setForm] = useState({ title: '', description: '', event_type: 'meetup', location: '', is_online: false, meeting_url: '', start_time: '', end_time: '', max_attendees: '' })

  const { data: events = [], isLoading } = useQuery({ queryKey: ['events'], queryFn: () => eventsApi.list() })

  const createMutation = useMutation({ mutationFn: (d: Partial<Event>) => eventsApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setModal(null) } })
  const updateMutation = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<Event> }) => eventsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setModal(null) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => eventsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) })

  const openCreate = () => { setForm({ title: '', description: '', event_type: 'meetup', location: '', is_online: false, meeting_url: '', start_time: '', end_time: '', max_attendees: '' }); setModal('create') }
  const openEdit = (ev: Event) => {
    setSelected(ev)
    setForm({ title: ev.title, description: ev.description ?? '', event_type: ev.event_type ?? 'meetup', location: ev.location ?? '', is_online: ev.is_online, meeting_url: ev.meeting_url ?? '', start_time: ev.start_time.slice(0, 16), end_time: ev.end_time?.slice(0, 16) ?? '', max_attendees: String(ev.max_attendees ?? '') })
    setModal('edit')
  }

  const handleSubmit = () => {
    const payload = { ...form, max_attendees: form.max_attendees ? Number(form.max_attendees) : undefined }
    if (modal === 'create') createMutation.mutate(payload)
    else if (modal === 'edit' && selected) updateMutation.mutate({ id: selected.id, d: payload })
  }

  const TYPE_VARIANT: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'gray'> = { demo_day: 'blue', meetup: 'green', webinar: 'purple', conference: 'yellow', workshop: 'gray' }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={14} /> Add Event</button>
      </div>

      {events.length === 0 ? (
        <EmptyState icon={Calendar} title="No events yet" description="Create events to network with founders and investors." action={<button onClick={openCreate} className="btn-primary">Create Event</button>} />
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="card flex items-start gap-4">
              <div className="shrink-0 text-center w-12">
                <p className="text-accent-blue font-bold text-lg leading-none">{new Date(ev.start_time).getDate()}</p>
                <p className="text-text-muted text-xs uppercase">{new Date(ev.start_time).toLocaleString('en', { month: 'short' })}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-text-primary">{ev.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={TYPE_VARIANT[ev.event_type ?? ''] ?? 'gray'}>{(ev.event_type ?? 'event').replace('_', ' ')}</Badge>
                    <button onClick={() => openEdit(ev)} className="p-1 hover:bg-bg-hover rounded text-text-muted hover:text-text-primary transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => deleteMutation.mutate(ev.id)} className="p-1 hover:bg-accent-red/10 rounded text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
                {ev.description && <p className="text-text-secondary text-sm mb-2 line-clamp-1">{ev.description}</p>}
                <div className="flex items-center gap-3 text-text-muted text-xs">
                  <span>{new Date(ev.start_time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                  {ev.is_online
                    ? <span className="flex items-center gap-1 text-accent-blue"><Video size={11} />Online{ev.meeting_url && <a href={ev.meeting_url} target="_blank" rel="noreferrer" className="underline ml-1">Join</a>}</span>
                    : ev.location && <span className="flex items-center gap-1"><MapPin size={11} />{ev.location}</span>}
                  {ev.max_attendees && <span>{ev.max_attendees} max</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Create Event' : 'Edit Event'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="label">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
            <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Type</label>
                <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className="input">
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select></div>
              <div><label className="label">Max Attendees</label><input type="number" value={form.max_attendees} onChange={e => setForm(f => ({ ...f, max_attendees: e.target.value }))} className="input" /></div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="online" checked={form.is_online} onChange={e => setForm(f => ({ ...f, is_online: e.target.checked }))} />
              <label htmlFor="online" className="text-text-secondary text-sm">Online event</label>
            </div>
            {form.is_online
              ? <div><label className="label">Meeting URL</label><input value={form.meeting_url} onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))} className="input" placeholder="https://..." /></div>
              : <div><label className="label">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input" /></div>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Start Time</label><input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="input" /></div>
              <div><label className="label">End Time</label><input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="input" /></div>
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
