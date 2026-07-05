import Sparkline from './Sparkline'

function MetricBlock({ label, value, suffix = '%', trend, color }) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="font-mono text-lg font-semibold tabular" style={{ color }}>
        {value}
        {suffix}
      </span>
      <Sparkline data={trend} color={color} />
    </div>
  )
}

export default function LiveModelSignals({ metrics, txnsLastMinute }) {
  const trend = metrics?.avg_probability_trend ?? []

  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Live Model Signals
        </h2>
        <p className="text-[11px] text-muted">
          Computed from the live prediction stream — not accuracy/precision/recall, since those need
          verified fraud labels this pipeline doesn't have.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <MetricBlock
          label="Avg. Confidence"
          value={metrics?.avg_confidence ?? 0}
          trend={trend}
          color="#3B82F6"
        />
        <MetricBlock
          label="High-Confidence Rate"
          value={metrics?.high_confidence_rate ?? 0}
          trend={trend.map((v) => 100 - Math.abs(v - 50) * 2)}
          color="#22C55E"
        />
        <MetricBlock
          label="Fraud Positive Rate"
          value={metrics?.fraud_positive_rate ?? 0}
          trend={trend}
          color="#FF5470"
        />
        <MetricBlock
          label="Live Throughput"
          value={txnsLastMinute ?? 0}
          suffix=" txn/min"
          trend={trend.map((v) => v / 2)}
          color="#F5A623"
        />
      </div>
    </div>
  )
}
