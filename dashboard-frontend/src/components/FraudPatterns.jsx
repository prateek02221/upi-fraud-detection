import { Repeat, Clock, DollarSign, TrendingUp } from 'lucide-react'

const ICONS = {
  'High Amount': DollarSign,
  'Unusual Time': Clock,
  'Amount-Driven Prediction': TrendingUp,
  'Time-Driven Prediction': Repeat,
}

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E']

export default function FraudPatterns({ patterns }) {
  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
        Top Fraud Signals
      </h2>
      <p className="text-[11px] text-muted -mt-2">
        Derived from the live SHAP explanation stream (amount/time features only).
      </p>
      <div className="flex flex-col gap-3">
        {(patterns ?? []).map((p, i) => {
          const Icon = ICONS[p.label] ?? TrendingUp
          return (
            <div key={p.label} className="flex items-center gap-3">
              <Icon size={14} className="text-muted flex-shrink-0" />
              <span className="text-xs w-44 flex-shrink-0 truncate">{p.label}</span>
              <div className="flex-1 h-2 rounded-full bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                />
              </div>
              <span className="font-mono text-xs tabular w-12 text-right">{p.percent}%</span>
            </div>
          )
        })}
        {(!patterns || patterns.length === 0) && (
          <p className="text-sm text-muted py-4 text-center">No fraud signals yet.</p>
        )}
      </div>
    </div>
  )
}
