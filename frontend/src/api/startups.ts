import { api } from './client'
import type { Startup, PaginatedResponse } from '../types'

export const startupsApi = {
  list: (params?: { page?: number; per_page?: number; industry?: string; stage?: string }) =>
    api.get<PaginatedResponse<Startup>>('/startups', { params }).then(r => r.data),

  get: (id: number) => api.get<Startup>(`/startups/${id}`).then(r => r.data),

  create: (data: Partial<Startup>) => api.post<Startup>('/startups', data).then(r => r.data),

  update: (id: number, data: Partial<Startup>) =>
    api.put<Startup>(`/startups/${id}`, data).then(r => r.data),

  delete: (id: number) => api.delete(`/startups/${id}`),

  search: (q: string) =>
    api.get<PaginatedResponse<Startup>>('/startups/search', { params: { q } }).then(r => r.data),
}
