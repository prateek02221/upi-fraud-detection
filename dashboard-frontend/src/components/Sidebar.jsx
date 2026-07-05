import { NavLink } from 'react-router-dom'
import {
  ShieldCheck,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Sparkles,
} from 'lucide-react'

// Only routes with a real, wired-up page are listed. Reports, Users &
// Accounts, Settings, and System Logs were removed rather than shown
// disabled — this project has no report generation, auth/user management,
// settings, or audit-log backend to point them at.
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Activity, label: 'Live Transactions', path: '/transactions' },
  { icon: AlertTriangle, label: 'Fraud Alerts', path: '/alerts', badge: true },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Cpu, label: 'ML Model Performance', path: '/model-performance' },
  { icon: Sparkles, label: 'Explainable AI', path: '/explainable-ai' },
]

export default function Sidebar({ alertCount, systemHealthy }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-panel border-r border-line h-screen sticky top-0 px-3 py-4">
      <div className="flex items-center gap-2 px-2 pb-4">
        <ShieldCheck className="text-signal-amber" size={26} />
        <div>
          <div className="font-display font-semibold text-sm leading-tight">UPI Fraud Detection</div>
          <div className="text-[11px] text-muted leading-tight">Real-Time Dashboard</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => (
          <NavLink
            key={label}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                isActive
                  ? 'bg-elevated text-text border border-line'
                  : 'text-muted hover:bg-elevated/60 hover:text-text'
              }`
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {badge && alertCount > 0 && (
              <span className="text-[10px] font-semibold bg-signal-high/20 text-signal-high rounded-full px-1.5 py-0.5">
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-2 px-3 py-3 rounded-md bg-elevated border border-line flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            systemHealthy ? 'bg-signal-low' : 'bg-signal-medium'
          }`}
        />
        <div>
          <div className="text-xs font-medium">System Status</div>
          <div className="text-[11px] text-muted">
            {systemHealthy ? 'All systems operational' : 'Checking pipeline…'}
          </div>
        </div>
      </div>
    </aside>
  )
}
