function MetricBlock({ label, value }) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="font-mono text-xl font-semibold tabular">{Math.round(value * 100)}%</span>
    </div>
  )
}

export default function OfflineModelMetrics({ metrics }) {
  if (!metrics) {
    return (
      <div className="bg-panel border border-line rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-sm text-muted">No offline metrics found — run model/train.py to generate them.</p>
      </div>
    )
  }

  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Offline Validation Metrics
        </h2>
        <p className="text-[11px] text-muted">
          Computed once on a held-out test split at training time ({metrics.test_samples.toLocaleString()}{' '}
          samples the model never saw during training) — not live production accuracy.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <MetricBlock label="Accuracy" value={metrics.accuracy} />
        <MetricBlock label="Precision" value={metrics.precision} />
        <MetricBlock label="Recall" value={metrics.recall} />
        <MetricBlock label="F1 Score" value={metrics.f1_score} />
      </div>

      <p className="text-[11px] text-muted border-t border-line pt-2">
        Trained on {metrics.train_samples.toLocaleString()} synthetic samples · last trained{' '}
        {new Date(metrics.trained_at).toLocaleDateString()}
      </p>
    </div>
  )
}
