export interface User {
  id: number
  email: string
  full_name: string | null
  role: string
  is_active: boolean
}

export interface Startup {
  id: number
  name: string
  description: string | null
  industry: string | null
  stage: string | null
  funding_goal: number | null
  current_funding: number | null
  team_size: number | null
  location: string | null
  website: string | null
  logo_url: string | null
  pitch_deck_url: string | null
  ai_score: number | null
  ai_evaluation: AIEvaluation | null
  created_at: string
  updated_at: string | null
}

export interface Investor {
  id: number
  name: string
  firm: string | null
  bio: string | null
  investment_focus: string | null
  industries: string[] | null
  stages: string[] | null
  min_investment: number | null
  max_investment: number | null
  portfolio_count: number | null
  location: string | null
  linkedin_url: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null
}

export interface Deal {
  id: number
  startup_id: number
  investor_id: number | null
  title: string
  amount: number | null
  stage: DealStage
  probability: number
  expected_close: string | null
  notes: string | null
  startup: { id: number; name: string; industry: string | null } | null
  investor: { id: number; name: string; firm: string | null } | null
  created_at: string
  updated_at: string | null
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

export interface DealStats {
  total: number
  by_stage: Record<DealStage, number>
  total_value: number
}

export interface Event {
  id: number
  title: string
  description: string | null
  event_type: string | null
  location: string | null
  is_online: boolean
  meeting_url: string | null
  start_time: string
  end_time: string | null
  max_attendees: number | null
  created_at: string
}

export interface Document {
  id: number
  startup_id: number
  filename: string
  file_url: string
  doc_type: string
  ai_analysis: AIEvaluation | null
  status: 'pending' | 'analyzing' | 'done' | 'failed'
  created_at: string
}

export interface AIEvaluation {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  market_size: string
  business_model: string
  team_assessment: string
  risks: string[]
}

export interface InvestorMatch {
  investor_id: number
  investor_name: string
  firm: string | null
  similarity_score: number
  explanation: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
