import { Database, Cpu, HardDrive, Network, Bell } from 'lucide-react'

const ICONS = {
  data_stream: Database,
  ml_model: Cpu,
  database: HardDrive,
  api_gateway: Network,
}

const LABELS = {
  data_stream: 'Data Stream',
  ml_model: 'ML Model',
  database: 'Database',
  api_gateway: 'API Gateway',
}

function statusColor(status) {
  if (status === 'Active' || status === 'Healthy') return 'text-signal-low'
  if (status === 'Idle') return 'text-signal-medium'
  return 'text-signal-high'
}

export default function SystemStatus({ status }) {
  const entries = Object.entries(status ?? {})

  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
        Live System Status
      </h2>
      <div className="flex flex-wrap gap-4">
        {entries.map(([key, value]) => {
          const Icon = ICONS[key] ?? Bell
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
                <Icon size={15} className={statusColor(value)} />
              </span>
              <div className="leading-tight">
                <div className="text-xs">{LABELS[key] ?? key}</div>
                <div className={`text-[11px] font-medium ${statusColor(value)}`}>{value}</div>
              </div>
            </div>
          )
        })}
        {entries.length === 0 && <p className="text-sm text-muted">Waiting for status…</p>}
      </div>
    </div>
  )
}
