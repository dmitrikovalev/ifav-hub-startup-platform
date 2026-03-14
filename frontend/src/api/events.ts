import { api } from './client'
import type { Event } from '../types'

export const eventsApi = {
  list: () => api.get<Event[]>('/events').then(r => r.data),

  upcoming: (limit = 5) =>
    api.get<Event[]>('/events/upcoming', { params: { limit } }).then(r => r.data),

  get: (id: number) => api.get<Event>(`/events/${id}`).then(r => r.data),

  create: (data: Partial<Event>) => api.post<Event>('/events', data).then(r => r.data),

  update: (id: number, data: Partial<Event>) =>
    api.put<Event>(`/events/${id}`, data).then(r => r.data),

  delete: (id: number) => api.delete(`/events/${id}`),
}
