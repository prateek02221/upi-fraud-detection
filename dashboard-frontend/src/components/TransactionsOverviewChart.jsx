import { Line } from 'react-chartjs-2'
import '../chartSetup'
import { CHART_TEXT_COLOR, CHART_GRID_COLOR } from '../chartSetup'

export default function TransactionsOverviewChart({ series }) {
  const data = {
    labels: series?.map((s) => s.minute) ?? [],
    datasets: [
      {
        label: 'Total Transactions',
        data: series?.map((s) => s.count) ?? [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        pointRadius: 2,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Legitimate',
        data: series?.map((s) => s.legitimate) ?? [],
        borderColor: '#22C55E',
        pointRadius: 2,
        tension: 0.35,
        fill: false,
      },
      {
        label: 'Fraudulent',
        data: series?.map((s) => s.fraud) ?? [],
        borderColor: '#FF5470',
        pointRadius: 2,
        tension: 0.35,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: CHART_TEXT_COLOR, font: { family: 'Inter', size: 11 }, boxWidth: 10 },
      },
    },
    scales: {
      x: {
        ticks: { color: CHART_TEXT_COLOR, font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: CHART_GRID_COLOR },
      },
      y: {
        ticks: { color: CHART_TEXT_COLOR, font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: CHART_GRID_COLOR },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Transactions Overview
        </h2>
        <span className="text-xs text-muted border border-line rounded px-2 py-1 bg-elevated">
          Last 15 min
        </span>
      </div>
      <div className="flex-1 min-h-[220px]">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
