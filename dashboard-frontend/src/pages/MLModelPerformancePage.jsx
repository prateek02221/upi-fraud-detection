import { useOutletContext } from 'react-router-dom'
import LiveModelSignals from '../components/LiveModelSignals'
import SystemStatus from '../components/SystemStatus'
import OfflineModelMetrics from '../components/OfflineModelMetrics'
import { Info } from 'lucide-react'

export default function MLModelPerformancePage() {
  const { data } = useOutletContext()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold">ML Model Performance</h1>
        <p className="text-sm text-muted">Offline validation metrics, live prediction signals, and pipeline health.</p>
      </div>

      <div className="bg-elevated border border-line rounded-lg p-4 flex gap-3">
        <Info size={18} className="text-muted flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted">
          Accuracy/Precision/Recall/F1 below are genuine — computed on a real held-out test split
          (<code className="text-text">model/train.py</code>), not fabricated. They're offline validation
          metrics though, not live production accuracy: this pipeline has no verified ground-truth labels
          for the real-time transaction stream, so "Live Model Signals" reports what it honestly can from
          that stream instead (confidence, throughput) rather than accuracy claims it can't back up.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OfflineModelMetrics metrics={data?.offline_model_metrics} />
        <LiveModelSignals metrics={data?.live_metrics} txnsLastMinute={data?.kpis?.txns_last_minute} />
      </div>

      <SystemStatus status={data?.system_status} />
    </div>
  )
}
