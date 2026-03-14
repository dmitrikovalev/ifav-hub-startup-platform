import { api } from './client'
import type { Deal, DealStats } from '../types'

export const dealsApi = {
  list: (params?: { startup_id?: number; stage?: string }) =>
    api.get<Deal[]>('/deals', { params }).then(r => r.data),

  stats: () => api.get<DealStats>('/deals/stats').then(r => r.data),

  get: (id: number) => api.get<Deal>(`/deals/${id}`).then(r => r.data),

  create: (data: Partial<Deal>) => api.post<Deal>('/deals', data).then(r => r.data),

  update: (id: number, data: Partial<Deal>) =>
    api.put<Deal>(`/deals/${id}`, data).then(r => r.data),

  delete: (id: number) => api.delete(`/deals/${id}`),
}
