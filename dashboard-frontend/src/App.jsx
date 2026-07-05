import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LiveTransactionsPage from './pages/LiveTransactionsPage'
import FraudAlertsPage from './pages/FraudAlertsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import MLModelPerformancePage from './pages/MLModelPerformancePage'
import ExplainableAIPage from './pages/ExplainableAIPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<LiveTransactionsPage />} />
          <Route path="/alerts" element={<FraudAlertsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/model-performance" element={<MLModelPerformancePage />} />
          <Route path="/explainable-ai" element={<ExplainableAIPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
