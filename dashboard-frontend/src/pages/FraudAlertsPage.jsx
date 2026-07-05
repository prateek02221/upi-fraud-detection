import { useOutletContext } from 'react-router-dom'
import FraudAlerts from '../components/FraudAlerts'

export default function FraudAlertsPage() {
  const { data, setSelectedTxn } = useOutletContext()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold">Fraud Alerts</h1>
        <p className="text-sm text-muted">
          Live feed of flagged transactions (most recent {data?.alerts?.length ?? 0}, high/medium/low risk).
          Click any alert for the full SHAP explanation.
        </p>
      </div>
      <div className="max-w-2xl">
        <FraudAlerts alerts={data?.alerts} onSelectTxn={setSelectedTxn} />
      </div>
    </div>
  )
}
