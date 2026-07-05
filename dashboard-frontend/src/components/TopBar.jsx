import { useLocation } from 'react-router-dom'
import { Menu, Bell, UserCircle2, Calendar, SlidersHorizontal, Pause, Play, Download } from 'lucide-react'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Live Transactions',
  '/alerts': 'Fraud Alerts',
  '/analytics': 'Analytics',
  '/model-performance': 'ML Model Performance',
  '/explainable-ai': 'Explainable AI',
}

function exportCsv(transactions) {
  if (!transactions?.length) return
  const headers = [
    'transaction_id',
    'amount',
    'location',
    'device',
    'prediction',
    'probability',
    'risk',
    'top_feature',
    'timestamp',
  ]
  const rows = transactions.map((t) => headers.map((h) => t[h]).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `upi-transactions-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TopBar({ isPaused, onTogglePause, transactions, alertCount, serverTime }) {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard'
  const timeLabel = serverTime
    ? new Date(serverTime).toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Menu size={18} className="text-muted lg:hidden" />
        <h1 className="font-display text-lg font-semibold">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
            isPaused
              ? 'border-line text-muted bg-elevated'
              : 'border-signal-low/40 text-signal-low bg-signal-low/10'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-muted' : 'bg-signal-low'}`} />
          {isPaused ? 'Paused' : 'Live Monitoring'}
        </span>

        <button className="relative text-muted hover:text-text" aria-label="Notifications">
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 text-[9px] font-semibold bg-signal-high text-white rounded-full w-4 h-4 flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-sm">
          <UserCircle2 size={22} className="text-muted" />
          <div className="leading-tight">
            <div className="text-xs font-medium">Admin</div>
            <div className="text-[10px] text-muted">Super Admin</div>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-line bg-elevated text-muted font-mono">
          <Calendar size={13} />
          {timeLabel}
        </span>

        <button
          onClick={onTogglePause}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line bg-elevated text-xs font-medium hover:border-signal-amber transition-colors"
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
          {isPaused ? 'Resume' : 'Pause All'}
        </button>
        <button
          onClick={() => exportCsv(transactions)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line bg-elevated text-xs font-medium hover:border-signal-amber transition-colors"
        >
          <Download size={12} /> Export
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line bg-elevated text-xs font-medium hover:border-signal-amber transition-colors">
          <SlidersHorizontal size={12} /> Filter
        </button>
      </div>
    </div>
  )
}
