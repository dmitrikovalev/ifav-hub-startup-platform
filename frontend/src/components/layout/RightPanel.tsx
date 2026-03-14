import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Plus, Check, Trash2, Video, MapPin } from 'lucide-react'
import { eventsApi } from '../../api/events'
import type { Event } from '../../types'
import clsx from 'clsx'

interface Task { id: number; text: string; done: boolean }

const EVENT_TYPE_COLOR: Record<string, string> = {
  demo_day:   'text-accent-blue',
  meetup:     'text-accent-green',
  webinar:    'text-accent-purple',
  conference: 'text-accent-yellow',
}

function formatEventDate(dt: string) {
  const d = new Date(dt)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RightPanel() {
  const { data: events = [] } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsApi.upcoming(5),
  })

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Review pitch deck', done: false },
    { id: 2, text: 'Schedule investor call', done: false },
    { id: 3, text: 'Update deal pipeline', done: true },
  ])
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks(t => [...t, { id: Date.now(), text: newTask.trim(), done: false }])
    setNewTask('')
  }

  const toggleTask = (id: number) =>
    setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))

  const deleteTask = (id: number) =>
    setTasks(t => t.filter(task => task.id !== id))

  return (
    <aside className="w-72 shrink-0 h-full flex flex-col bg-bg-secondary border-l border-bg-border">

      {/* Upcoming Events */}
      <div className="flex-1 flex flex-col overflow-hidden border-b border-bg-border">
        <div className="h-16 flex items-center px-4 border-b border-bg-border shrink-0">
          <Calendar size={15} className="text-accent-blue mr-2" />
          <span className="text-sm font-semibold text-text-primary">Upcoming Events</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {events.length === 0 && (
            <p className="text-text-muted text-xs text-center py-6">No upcoming events</p>
          )}
          {events.map((ev: Event) => (
            <div key={ev.id} className="p-3 rounded-lg bg-bg-card border border-bg-border hover:border-accent-blue/30 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-text-primary text-sm font-medium leading-snug line-clamp-2">{ev.title}</span>
                <span className={clsx('text-xs shrink-0 font-medium capitalize', EVENT_TYPE_COLOR[ev.event_type ?? ''] ?? 'text-text-secondary')}>
                  {(ev.event_type ?? 'event').replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-xs">
                <span>{formatEventDate(ev.start_time)}</span>
                {ev.is_online
                  ? <span className="flex items-center gap-1"><Video size={11} /> Online</span>
                  : ev.location && <span className="flex items-center gap-1 truncate"><MapPin size={11} />{ev.location}</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-col" style={{ minHeight: '220px', maxHeight: '320px' }}>
        <div className="h-12 flex items-center px-4 border-b border-bg-border shrink-0">
          <Check size={15} className="text-accent-green mr-2" />
          <span className="text-sm font-semibold text-text-primary">Tasks</span>
          <span className="ml-auto text-xs text-text-muted">{tasks.filter(t => !t.done).length} left</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 group py-1">
              <button
                onClick={() => toggleTask(task.id)}
                className={clsx(
                  'w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors',
                  task.done
                    ? 'bg-accent-green border-accent-green'
                    : 'border-bg-border hover:border-accent-green',
                )}
              >
                {task.done && <Check size={10} className="text-white" />}
              </button>
              <span className={clsx('text-sm flex-1', task.done ? 'line-through text-text-muted' : 'text-text-primary')}>
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-bg-border">
          <div className="flex gap-2">
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add task..."
              className="input text-xs py-1.5"
            />
            <button onClick={addTask} className="shrink-0 p-1.5 bg-bg-hover hover:bg-bg-border rounded-lg transition-colors">
              <Plus size={14} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
