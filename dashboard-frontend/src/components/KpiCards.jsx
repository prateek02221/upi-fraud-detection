import { CreditCard, ShieldCheck, AlertTriangle, ShieldAlert, IndianRupee } from 'lucide-react'

function Card({ icon, iconBg, label, value, trend, trendAccent }) {
  return (
    <div className="flex items-center gap-3 bg-panel border border-line rounded-lg px-4 py-3 flex-1 min-w-[200px]">
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-[11px] text-muted">{label}</span>
        <span className="font-mono text-xl font-semibold tabular leading-tight">{value}</span>
        {trend && <span className={`text-[11px] ${trendAccent}`}>{trend}</span>}
      </div>
    </div>
  )
}

export default function KpiCards({ kpis }) {
  if (!kpis) return null

  const amountAtRisk = Math.round(kpis.fraud * kpis.avg_probability * 4.2) // ₹ estimate from fraud volume × avg severity

  return (
    <div className="flex flex-wrap gap-3">
      <Card
        icon={<CreditCard size={18} color="#0B0F17" />}
        iconBg="#3B82F6"
        label="Total Transactions (Today)"
        value={kpis.total.toLocaleString()}
        trend="Live count"
        trendAccent="text-muted"
      />
      <Card
        icon={<ShieldCheck size={18} color="#0B0F17" />}
        iconBg="#22C55E"
        label="Legitimate Transactions"
        value={kpis.safe.toLocaleString()}
        trend={`${kpis.approval_rate}% of total`}
        trendAccent="text-accent-green"
      />
      <Card
        icon={<AlertTriangle size={18} color="#0B0F17" />}
        iconBg="#F59E0B"
        label="Fraudulent Transactions"
        value={kpis.fraud.toLocaleString()}
        trend={`${kpis.fraud_rate}% of total`}
        trendAccent="text-signal-medium"
      />
      <Card
        icon={<ShieldAlert size={18} color="#0B0F17" />}
        iconBg="#EF4444"
        label="High-Risk Alerts"
        value={kpis.high_risk.toLocaleString()}
        trend="Flagged this session"
        trendAccent="text-signal-high"
      />
      <Card
        icon={<IndianRupee size={18} color="#0B0F17" />}
        iconBg="#8B5CF6"
        label="Amount at Risk (est.)"
        value={`₹${amountAtRisk.toLocaleString()}`}
        trend="Based on flagged volume"
        trendAccent="text-muted"
      />
    </div>
  )
}
