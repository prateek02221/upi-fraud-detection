import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import KpiCards from '../components/KpiCards'
import TransactionsOverviewChart from '../components/TransactionsOverviewChart'
import RiskScoreDonut from '../components/RiskScoreDonut'
import FraudAlerts from '../components/FraudAlerts'
import FraudPatterns from '../components/FraudPatterns'
import TimeHeatmap from '../components/TimeHeatmap'
import LiveModelSignals from '../components/LiveModelSignals'
import SystemStatus from '../components/SystemStatus'
import TransactionTable from '../components/TransactionTable'

export default function DashboardPage() {
  const { data, setSelectedTxn } = useOutletContext()
  const [filters, setFilters] = useState({ risk: 'All', device: 'All', city: 'All' })
  const [feedOpen, setFeedOpen] = useState(false)

  return (
    <>
      <KpiCards kpis={data?.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:auto-rows-[minmax(0,1fr)]">
        <div className="lg:col-span-5">
          <TransactionsOverviewChart series={data?.volume_series} />
        </div>
        <div className="lg:col-span-3">
          <RiskScoreDonut riskBuckets={data?.risk_score_buckets} totalFraud={data?.kpis?.fraud} />
        </div>
        <div className="lg:col-span-4 lg:row-span-2">
          <FraudAlerts alerts={data?.alerts} onSelectTxn={setSelectedTxn} />
        </div>

        <div className="lg:col-span-5">
          <FraudPatterns patterns={data?.fraud_patterns} />
        </div>
        <div className="lg:col-span-3">
          <TimeHeatmap data={data?.time_heatmap} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiveModelSignals metrics={data?.live_metrics} txnsLastMinute={data?.kpis?.txns_last_minute} />
        <SystemStatus status={data?.system_status} />
      </div>

      <TransactionTable
        transactions={data?.recent_transactions}
        filters={filters}
        onFilterChange={setFilters}
        onSelectTxn={setSelectedTxn}
        isOpen={feedOpen}
        onToggleOpen={() => setFeedOpen((o) => !o)}
      />
    </>
  )
}
