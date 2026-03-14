import { api } from './client'
import type { Investor, PaginatedResponse } from '../types'

export const investorsApi = {
  list: (params?: { page?: number; per_page?: number; industry?: string; stage?: string }) =>
    api.get<PaginatedResponse<Investor>>('/investors', { params }).then(r => r.data),

  get: (id: number) => api.get<Investor>(`/investors/${id}`).then(r => r.data),

  create: (data: Partial<Investor>) => api.post<Investor>('/investors', data).then(r => r.data),

  update: (id: number, data: Partial<Investor>) =>
    api.put<Investor>(`/investors/${id}`, data).then(r => r.data),

  delete: (id: number) => api.delete(`/investors/${id}`),

  search: (q: string) =>
    api.get<PaginatedResponse<Investor>>('/investors/search', { params: { q } }).then(r => r.data),
}
