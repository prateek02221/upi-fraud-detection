import { AlertTriangle } from 'lucide-react'

const RISK_BADGE = {
  High: 'bg-signal-high/15 text-signal-high border-signal-high/40',
  Medium: 'bg-signal-medium/15 text-signal-medium border-signal-medium/40',
  Low: 'bg-signal-low/15 text-signal-low border-signal-low/40',
}

function timeAgo(iso) {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function FraudAlerts({ alerts, onSelectTxn }) {
  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Recent Fraud Alerts
        </h2>
        <span className="text-xs text-signal-amber cursor-default">View All</span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px]">
        {(alerts ?? []).length === 0 && (
          <p className="text-sm text-muted py-6 text-center">No fraud alerts yet.</p>
        )}
        {(alerts ?? []).map((a) => (
          <button
            key={a.transaction_id}
            onClick={() => onSelectTxn?.(a)}
            className="flex items-start gap-3 p-2.5 rounded-md hover:bg-elevated text-left transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-signal-high/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={15} className="text-signal-high" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">
                  {a.reason?.split(',')[0] || 'Flagged Transaction'}
                </span>
                <span className="text-[10px] text-muted flex-shrink-0">{timeAgo(a.timestamp)}</span>
              </div>
              <p className="text-xs text-muted truncate">
                {a.location} · {a.device} · Txn {a.transaction_id}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs tabular text-signal-high">
                  ₹{a.amount?.toLocaleString()}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${RISK_BADGE[a.risk]}`}>
                  {a.risk}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
