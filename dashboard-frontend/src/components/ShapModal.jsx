export default function ShapModal({ transaction, onClose }) {
  if (!transaction) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-line rounded-lg max-w-lg w-full p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Transaction Explanation</h3>
            <p className="text-muted text-xs font-mono">{transaction.transaction_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="Amount" value={`₹${transaction.amount.toLocaleString()}`} mono />
          <Detail label="City" value={transaction.location} />
          <Detail label="Device" value={transaction.device} />
          <Detail label="Merchant" value={transaction.merchant_category ?? '—'} />
          <Detail
            label="Prediction"
            value={transaction.prediction === 1 ? 'Fraud' : 'Safe'}
            accent={transaction.prediction === 1 ? 'text-signal-high' : 'text-signal-low'}
          />
          <Detail label="Probability" value={`${transaction.probability}%`} mono />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-1">Reason</p>
          <p className="text-sm">{transaction.reason}</p>
        </div>

        {transaction.shap_graph && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-2">SHAP Feature Impact</p>
            <img
              src={transaction.shap_graph}
              alt="SHAP explanation graph"
              className="w-full rounded border border-line bg-elevated"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value, accent = 'text-text', mono = false }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`${accent} ${mono ? 'font-mono tabular' : ''}`}>{value}</p>
    </div>
  )
}
