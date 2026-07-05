import { Doughnut } from 'react-chartjs-2'
import '../chartSetup'

const COLORS = {
  'High (80-100)': '#EF4444',
  'Medium (50-79)': '#F59E0B',
  'Low (20-49)': '#3B82F6',
  'Very Low (0-19)': '#22C55E',
}

export default function RiskScoreDonut({ riskBuckets, totalFraud }) {
  const labels = Object.keys(riskBuckets ?? {})
  const values = Object.values(riskBuckets ?? {})
  const sum = values.reduce((a, b) => a + b, 0) || 1

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((l) => COLORS[l] ?? '#7C8BA8'),
        borderColor: '#141B29',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: { legend: { display: false } },
  }

  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted text-center">
        Fraud by Risk Score
      </h2>
      <div className="relative flex-1 min-h-[180px] flex items-center justify-center">
        <div className="w-full h-full max-w-[200px] mx-auto relative">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-mono text-2xl font-semibold tabular">{totalFraud?.toLocaleString() ?? 0}</span>
            <span className="text-[10px] text-muted">Total Fraud</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        {labels.map((label) => (
          <div key={label} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[label] }} />
              {label}
            </span>
            <span className="font-mono tabular text-muted">
              {(riskBuckets[label] ?? 0).toLocaleString()} ({((riskBuckets[label] / sum) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
