import { useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'

interface Message { id: number; text: string; from: 'me' | 'them'; time: string }
interface Conversation { id: number; name: string; role: string; last: string; messages: Message[] }

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Alex Chen', role: 'Investor · Sequoia', last: 'Looking forward to the demo!', messages: [
    { id: 1, text: 'Hi! I saw your pitch deck and it looks promising.', from: 'them', time: '10:00' },
    { id: 2, text: 'Thank you! When would you be available for a call?', from: 'me', time: '10:05' },
    { id: 3, text: 'Looking forward to the demo!', from: 'them', time: '10:10' },
  ]},
  { id: 2, name: 'Sarah Kim', role: 'Founder · HealthAI', last: 'Can we explore a partnership?', messages: [
    { id: 1, text: "I saw you're building in the fintech space.", from: 'them', time: '09:00' },
    { id: 2, text: 'Yes! Our product focuses on SME lending.', from: 'me', time: '09:15' },
    { id: 3, text: 'Can we explore a partnership?', from: 'them', time: '09:20' },
  ]},
]

export default function Messages() {
  const [conversations] = useState(DEMO_CONVERSATIONS)
  const [active, setActive] = useState<Conversation>(DEMO_CONVERSATIONS[0])
  const [input, setInput] = useState('')
  const [localMsgs, setLocalMsgs] = useState<Record<number, Message[]>>({})

  const messages = [...active.messages, ...(localMsgs[active.id] ?? [])]

  const send = () => {
    if (!input.trim()) return
    const msg: Message = { id: Date.now(), text: input.trim(), from: 'me', time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }
    setLocalMsgs(m => ({ ...m, [active.id]: [...(m[active.id] ?? []), msg] }))
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Conversation list */}
      <div className="w-64 shrink-0 card p-0 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-bg-border">
          <p className="text-text-primary font-semibold text-sm flex items-center gap-2"><MessageSquare size={14} />Messages</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <button key={c.id} onClick={() => setActive(c)} className={`w-full text-left px-4 py-3 border-b border-bg-border/50 hover:bg-bg-hover transition-colors ${active.id === c.id ? 'bg-accent-blue/10' : ''}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{c.name[0]}</span>
                </div>
                <p className="text-text-primary text-sm font-medium truncate">{c.name}</p>
              </div>
              <p className="text-text-muted text-xs truncate pl-9">{c.last}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 card p-0 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-bg-border shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <span className="text-white text-sm font-bold">{active.name[0]}</span>
          </div>
          <div><p className="text-text-primary font-medium text-sm">{active.name}</p><p className="text-text-muted text-xs">{active.role}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${msg.from === 'me' ? 'bg-accent-blue text-white rounded-br-sm' : 'bg-bg-card border border-bg-border text-text-primary rounded-bl-sm'}`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-0.5 ${msg.from === 'me' ? 'text-blue-200' : 'text-text-muted'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-bg-border flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={`Message ${active.name}...`} className="input flex-1" />
          <button onClick={send} className="btn-primary h-9 w-9 flex items-center justify-center p-0"><Send size={14} /></button>
        </div>
      </div>
    </div>
  )
}
