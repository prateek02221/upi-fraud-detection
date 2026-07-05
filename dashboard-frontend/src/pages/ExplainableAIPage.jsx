import { useOutletContext } from 'react-router-dom'

const RISK_BADGE = {
  High: 'bg-signal-high/15 text-signal-high border-signal-high/40',
  Medium: 'bg-signal-medium/15 text-signal-medium border-signal-medium/40',
  Low: 'bg-signal-low/15 text-signal-low border-signal-low/40',
}

export default function ExplainableAIPage() {
  const { data, setSelectedTxn } = useOutletContext()
  const transactions = data?.recent_transactions ?? []

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold">Explainable AI</h1>
        <p className="text-sm text-muted">
          Every prediction below comes with a SHAP feature-impact graph — click a card to see the full
          breakdown of why the model made that call.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {transactions.map((t) => (
          <button
            key={t._id ?? t.transaction_id}
            onClick={() => setSelectedTxn(t)}
            className="text-left bg-panel border border-line rounded-lg p-4 flex flex-col gap-3 hover:border-signal-amber transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-semibold tabular">₹{t.amount.toLocaleString()}</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${RISK_BADGE[t.risk]}`}>
                {t.risk}
              </span>
            </div>
            <p className="text-xs text-muted">
              {t.location} · {t.device} · {t.probability}% confidence
            </p>
            {t.shap_graph && (
              <img
                src={t.shap_graph}
                alt="SHAP feature impact"
                className="w-full h-20 object-contain rounded border border-line bg-elevated"
              />
            )}
            <p className="text-xs text-signal-amber line-clamp-2">{t.reason}</p>
          </button>
        ))}

        {transactions.length === 0 && (
          <p className="text-sm text-muted col-span-full text-center py-8">
            No transactions yet — waiting for the live pipeline.
          </p>
        )}
      </div>
    </div>
  )
}
