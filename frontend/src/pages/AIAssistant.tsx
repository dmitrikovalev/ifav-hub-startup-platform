import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Zap } from 'lucide-react'
import { aiApi } from '../api/ai'
import type { ChatMessage } from '../types'

const SESSION_ID = `session_${Date.now()}`

const QUICK_ACTIONS = [
  'What makes a great pitch deck?',
  'How do I find the right investors for my startup?',
  'Explain the difference between seed and Series A funding.',
  'What are common term sheet red flags?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your AI startup advisor. Ask me about fundraising, pitch decks, investor matching, or any ecosystem-related questions.", timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text = input) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg, timestamp: new Date() }])
    setLoading(true)
    try {
      const res = await aiApi.chat(msg, SESSION_ID)
      setMessages(m => [...m, { role: 'assistant', content: res.response, timestamp: new Date() }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="card mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <p className="text-text-primary font-semibold text-sm">AI Startup Advisor</p>
          <p className="text-text-muted text-xs">Powered by Gemini 2.5 Flash Lite</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-text-muted text-xs">Online</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_ACTIONS.map(q => (
          <button key={q} onClick={() => sendMessage(q)} className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-bg-border hover:border-accent-blue/40 rounded-lg text-text-secondary hover:text-text-primary text-xs transition-colors">
            <Zap size={11} className="text-accent-yellow" />
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent-blue text-white rounded-br-sm' : 'bg-bg-card border border-bg-border text-text-primary rounded-bl-sm'}`}>
              {msg.content.split('\n').map((line, j) => <p key={j}>{line}</p>)}
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-text-muted'}`}>
                {msg.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-bg-hover border border-bg-border flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-text-secondary" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-bg-card border border-bg-border rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask about fundraising, pitch decks, investors..."
          rows={2}
          className="input resize-none flex-1"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary h-10 w-10 flex items-center justify-center p-0 shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
