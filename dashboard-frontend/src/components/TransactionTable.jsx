import { ChevronDown, ChevronUp } from 'lucide-react'

const RISK_BADGE = {
  High: 'bg-signal-high/15 text-signal-high border-signal-high/40',
  Medium: 'bg-signal-medium/15 text-signal-medium border-signal-medium/40',
  Low: 'bg-signal-low/15 text-signal-low border-signal-low/40',
}

export default function TransactionTable({
  transactions,
  filters,
  onFilterChange,
  onSelectTxn,
  isOpen,
  onToggleOpen,
}) {
  const filtered = (transactions ?? []).filter((t) => {
    if (filters.risk !== 'All' && t.risk !== filters.risk) return false
    if (filters.device !== 'All' && t.device !== filters.device) return false
    if (filters.city !== 'All' && t.location !== filters.city) return false
    return true
  })

  return (
    <div className="bg-panel border border-line rounded-lg flex flex-col">
      <button
        onClick={onToggleOpen}
        className="flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-muted hover:text-text transition-colors"
      >
        Live Transaction Feed
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <FilterSelect
              value={filters.risk}
              onChange={(v) => onFilterChange({ ...filters, risk: v })}
              options={['All', 'High', 'Medium', 'Low']}
              label="Risk"
            />
            <FilterSelect
              value={filters.device}
              onChange={(v) => onFilterChange({ ...filters, device: v })}
              options={['All', 'Android', 'iOS']}
              label="Device"
            />
            <FilterSelect
              value={filters.city}
              onChange={(v) => onFilterChange({ ...filters, city: v })}
              options={['All', 'Delhi', 'Mumbai', 'Kolkata']}
              label="City"
            />
          </div>

          <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-panel">
                <tr className="text-left text-muted border-b border-line uppercase text-xs tracking-wider">
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Prediction</th>
                  <th className="py-2 pr-4">Probability</th>
                  <th className="py-2 pr-4">Risk</th>
                  <th className="py-2 pr-4">Top Feature</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t._id ?? t.transaction_id}
                    onClick={() => onSelectTxn(t)}
                    className="border-b border-line/50 hover:bg-elevated cursor-pointer transition-colors"
                  >
                    <td className="py-2 pr-4 font-mono tabular">₹{t.amount.toLocaleString()}</td>
                    <td className="py-2 pr-4">{t.location}</td>
                    <td className="py-2 pr-4">{t.device}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          t.prediction === 1
                            ? 'text-signal-high font-medium'
                            : 'text-signal-low font-medium'
                        }
                      >
                        {t.prediction === 1 ? 'Fraud' : 'Safe'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-mono tabular">{t.probability}%</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded border text-xs font-medium ${RISK_BADGE[t.risk]}`}>
                        {t.risk}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-signal-amber">{t.top_feature}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted">
                      No transactions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-elevated border border-line rounded px-2 py-1 text-text text-xs focus:outline-none focus:ring-1 focus:ring-signal-amber"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}
