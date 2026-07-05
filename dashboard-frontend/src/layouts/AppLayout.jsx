import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { usePolling } from '../hooks/usePolling'
import { isMockMode } from '../api/fetchData'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ShapModal from '../components/ShapModal'

export default function AppLayout() {
  const { data, error, isPaused, togglePause } = usePolling(2500)
  const [selectedTxn, setSelectedTxn] = useState(null)

  const alertCount = data?.alerts?.length ?? 0
  const systemHealthy = Object.values(data?.system_status ?? {}).every(
    (v) => v === 'Active' || v === 'Healthy'
  )

  return (
    <div className="min-h-screen bg-base flex">
      <Sidebar alertCount={alertCount} systemHealthy={systemHealthy} />

      <div className="flex-1 px-4 md:px-6 py-5 flex flex-col gap-4 max-w-[1700px]">
        <TopBar
          isPaused={isPaused}
          onTogglePause={togglePause}
          transactions={data?.recent_transactions}
          alertCount={alertCount}
          serverTime={data?.server_time}
        />

        {error && (
          <div className="bg-signal-high/10 border border-signal-high/40 text-signal-high text-sm rounded-lg px-4 py-2">
            {error} — retrying on next poll.
          </div>
        )}

        {isMockMode && (
          <span className="self-start text-[10px] uppercase tracking-wider text-muted bg-elevated border border-line px-2 py-0.5 rounded">
            Preview mode — mock data
          </span>
        )}

        {/* Pages read `data` and `setSelectedTxn` via useOutletContext() */}
        <Outlet context={{ data, selectedTxn, setSelectedTxn }} />

        <ShapModal transaction={selectedTxn} onClose={() => setSelectedTxn(null)} />
      </div>
    </div>
  )
}
