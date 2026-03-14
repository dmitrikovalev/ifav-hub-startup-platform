import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Startups from './pages/Startups'
import Investors from './pages/Investors'
import DealFlow from './pages/DealFlow'
import Fundraising from './pages/Fundraising'
import Accelerator from './pages/Accelerator'
import Events from './pages/Events'
import Documents from './pages/Documents'
import Messages from './pages/Messages'
import AIAssistant from './pages/AIAssistant'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="startups" element={<Startups />} />
          <Route path="investors" element={<Investors />} />
          <Route path="deal-flow" element={<DealFlow />} />
          <Route path="fundraising" element={<Fundraising />} />
          <Route path="accelerator" element={<Accelerator />} />
          <Route path="events" element={<Events />} />
          <Route path="documents" element={<Documents />} />
          <Route path="messages" element={<Messages />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
