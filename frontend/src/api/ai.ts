import { api } from './client'
import type { AIEvaluation, InvestorMatch, Document } from '../types'

export const aiApi = {
  evaluate: (payload: { text?: string; startup_id?: number }) =>
    api.post<AIEvaluation>('/ai/evaluate', payload).then(r => r.data),

  match: (startup_id: number, limit = 5) =>
    api.post<{ startup_id: number; matches: InvestorMatch[] }>('/ai/match', { startup_id, limit })
      .then(r => r.data),

  chat: (message: string, session_id: string) =>
    api.post<{ response: string; session_id: string }>('/ai/chat', { message, session_id })
      .then(r => r.data),

  uploadDocument: (startup_id: number, doc_type: string, file: File) => {
    const form = new FormData()
    form.append('startup_id', String(startup_id))
    form.append('doc_type', doc_type)
    form.append('file', file)
    return api.post<Document>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  getDocument: (id: number) => api.get<Document>(`/documents/${id}`).then(r => r.data),

  deleteDocument: (id: number) => api.delete(`/documents/${id}`),

  listDocuments: (startup_id?: number) =>
    api.get<Document[]>('/documents', { params: { startup_id } }).then(r => r.data),
}
