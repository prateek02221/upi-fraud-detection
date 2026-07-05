import { useOutletContext } from 'react-router-dom'
import LiveModelSignals from '../components/LiveModelSignals'
import SystemStatus from '../components/SystemStatus'
import { AlertCircle } from 'lucide-react'

export default function MLModelPerformancePage() {
  const { data } = useOutletContext()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold">ML Model Performance</h1>
        <p className="text-sm text-muted">Live signals from the prediction stream, and pipeline health.</p>
      </div>

      <div className="bg-signal-medium/10 border border-signal-medium/30 rounded-lg p-4 flex gap-3">
        <AlertCircle size={18} className="text-signal-medium flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-signal-medium">No Accuracy / Precision / Recall / F1 here — on purpose</p>
          <p className="text-muted mt-1">
            Those metrics need verified ground-truth fraud labels to compute. This model
            (<code className="text-text">model/train.py</code>) is trained on 4 hardcoded example rows with no
            held-out test set, so there's no real validation data to report. What's shown below is honestly
            computed from the live prediction stream itself instead.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiveModelSignals metrics={data?.live_metrics} txnsLastMinute={data?.kpis?.txns_last_minute} />
        <SystemStatus status={data?.system_status} />
      </div>
    </div>
  )
}
