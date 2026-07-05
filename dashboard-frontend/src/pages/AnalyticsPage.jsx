import { useOutletContext } from 'react-router-dom'
import TransactionsOverviewChart from '../components/TransactionsOverviewChart'
import RiskScoreDonut from '../components/RiskScoreDonut'
import FraudPatterns from '../components/FraudPatterns'
import TimeHeatmap from '../components/TimeHeatmap'

export default function AnalyticsPage() {
  const { data } = useOutletContext()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold">Analytics</h1>
        <p className="text-sm text-muted">Deeper view into transaction volume, risk distribution, and timing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-h-[320px]">
          <TransactionsOverviewChart series={data?.volume_series} />
        </div>
        <div className="min-h-[320px]">
          <RiskScoreDonut riskBuckets={data?.risk_score_buckets} totalFraud={data?.kpis?.fraud} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FraudPatterns patterns={data?.fraud_patterns} />
        <TimeHeatmap data={data?.time_heatmap} />
      </div>
    </div>
  )
}
