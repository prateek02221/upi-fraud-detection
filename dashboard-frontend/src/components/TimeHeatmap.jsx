const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// Python's date.weekday(): Monday=0 ... Sunday=6 — matches DAYS order above.

function cellColor(intensity) {
  // intensity 0-1 → blue (low) through yellow to red (high), like the reference heatmap.
  if (intensity <= 0) return '#1B2436'
  if (intensity < 0.25) return '#3B82F6'
  if (intensity < 0.5) return '#22C55E'
  if (intensity < 0.75) return '#F59E0B'
  return '#EF4444'
}

export default function TimeHeatmap({ data }) {
  const grid = {}
  let max = 1
  ;(data ?? []).forEach(({ day, hour, count }) => {
    grid[`${day}-${hour}`] = count
    if (count > max) max = count
  })

  return (
    <div className="bg-panel border border-line rounded-lg p-4 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Fraud by Time of Day
        </h2>
        <div className="flex items-center gap-1 text-[10px] text-muted">
          Low
          {['#3B82F6', '#22C55E', '#F59E0B', '#EF4444'].map((c) => (
            <span key={c} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          High
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col gap-1 min-w-[420px]">
          {DAYS.map((label, dayIdx) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-8 text-[10px] text-muted flex-shrink-0">{label}</span>
              <div className="flex gap-[2px] flex-1">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const count = grid[`${dayIdx}-${hour}`] ?? 0
                  return (
                    <span
                      key={hour}
                      title={`${label} ${hour}:00 — ${count} fraud detections`}
                      className="flex-1 aspect-square rounded-sm"
                      style={{ backgroundColor: cellColor(count / max) }}
                    />
                  )
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1 pt-1">
            <span className="w-8 flex-shrink-0" />
            <div className="flex gap-[2px] flex-1 text-[9px] text-muted">
              <span className="flex-[4] text-left">12 AM</span>
              <span className="flex-[8] text-center">12 PM</span>
              <span className="flex-[4] text-right">11 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
