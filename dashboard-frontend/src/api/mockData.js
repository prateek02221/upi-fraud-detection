// Generates payloads shaped exactly like GET /api/data from the Flask backend.
// Used for local preview before wiring up real polling — swapping to the
// live API later is a one-line change in src/api/fetchData.js.

const CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
]

const DEVICES = ['Android', 'iOS']
const MERCHANTS = ['Grocery', 'Fuel', 'Utility Bill', 'Food Delivery', 'Recharge', 'Shopping', 'P2P Transfer']

let txnCounter = 1000

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

// A tiny 1x2 transparent PNG so <img> tags render without a real backend.
const PLACEHOLDER_SHAP =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

function makeTransaction() {
  const amount = randomInt(10, 50000)
  const hour = randomInt(0, 23)
  const probability = Math.round(Math.random() * 10000) / 100
  const prediction = probability > 50 ? 1 : 0
  const risk = probability > 80 ? 'High' : probability > 50 ? 'Medium' : 'Low'
  const topFeature = Math.random() > 0.5 ? 'amount' : 'time'

  txnCounter += 1

  return {
    _id: `mock-${txnCounter}`,
    transaction_id: `txn${txnCounter}`,
    amount,
    time: hour,
    timestamp: new Date().toISOString(),
    location: pick(CITIES).name,
    device: pick(DEVICES),
    merchant_category: pick(MERCHANTS),
    prediction,
    probability,
    risk,
    top_feature: topFeature,
    shap_graph: PLACEHOLDER_SHAP,
    reason:
      prediction === 1
        ? 'High transaction amount, Amount strongly influenced prediction'
        : 'Normal behavior',
  }
}

export function makeMockPayload(previous) {
  const recent = previous?.recent_transactions ?? []
  const newTxns = [makeTransaction(), ...recent].slice(0, 25)

  const total = 4000 + txnCounter
  const fraud = Math.round(total * (0.18 + Math.random() * 0.05))
  const safe = total - fraud

  const cityBreakdown = {}
  CITIES.forEach((c) => {
    const cityTotal = randomInt(200, 900)
    cityBreakdown[c.name] = {
      total: cityTotal,
      fraud: Math.round(cityTotal * (0.15 + Math.random() * 0.1)),
    }
  })

  const deviceBreakdown = {
    Android: { total: randomInt(1500, 2500), fraud: randomInt(200, 500) },
    iOS: { total: randomInt(1200, 2000), fraud: randomInt(150, 400) },
  }

  const riskBreakdown = {
    High: randomInt(100, 300),
    Medium: randomInt(300, 700),
    Low: randomInt(2000, 3500),
  }

  const now = new Date()
  const volumeSeries = Array.from({ length: 15 }).map((_, i) => {
    const t = new Date(now.getTime() - (14 - i) * 60000)
    const count = randomInt(8, 40)
    const fraudCount = Math.round(count * (0.1 + Math.random() * 0.15))
    return {
      minute: t.toTimeString().slice(0, 5),
      count,
      fraud: fraudCount,
      legitimate: count - fraudCount,
    }
  })

  const riskScoreBuckets = {
    'High (80-100)': randomInt(1500, 2200),
    'Medium (50-79)': randomInt(1900, 2400),
    'Low (20-49)': randomInt(700, 1000),
    'Very Low (0-19)': randomInt(250, 400),
  }

  const alerts = newTxns
    .filter((t) => t.prediction === 1)
    .slice(0, 8)
    .map((t) => ({ ...t }))

  const fraudPatterns = [
    { label: 'Amount-Driven Prediction', percent: 32.6 },
    { label: 'Unusual Time', percent: 24.8 },
    { label: 'Time-Driven Prediction', percent: 18.7 },
    { label: 'High Amount', percent: 13.2 },
  ]

  const timeHeatmap = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      timeHeatmap.push({ day: String(day), hour: String(hour), count: randomInt(0, 12) })
    }
  }

  const trend = Array.from({ length: 20 }).map(() => Math.round(Math.random() * 10000) / 100)
  const liveMetrics = {
    avg_confidence: Math.round((40 + Math.random() * 20) * 100) / 100,
    high_confidence_rate: Math.round((30 + Math.random() * 20) * 100) / 100,
    fraud_positive_rate: Math.round((15 + Math.random() * 10) * 100) / 100,
    avg_probability_trend: trend,
  }

  const systemStatus = {
    database: 'Healthy',
    data_stream: 'Active',
    ml_model: 'Active',
    api_gateway: 'Active',
  }

  return {
    kpis: {
      total,
      fraud,
      safe,
      fraud_rate: Math.round((fraud / total) * 10000) / 100,
      approval_rate: Math.round((safe / total) * 10000) / 100,
      high_risk: riskBreakdown.High,
      avg_probability: Math.round((30 + Math.random() * 20) * 100) / 100,
      txns_last_minute: randomInt(15, 45),
    },
    city_breakdown: cityBreakdown,
    device_breakdown: deviceBreakdown,
    risk_breakdown: riskBreakdown,
    risk_score_buckets: riskScoreBuckets,
    alerts,
    fraud_patterns: fraudPatterns,
    time_heatmap: timeHeatmap,
    live_metrics: liveMetrics,
    system_status: systemStatus,
    volume_series: volumeSeries,
    recent_transactions: newTxns,
    server_time: now.toISOString(),
  }
}

export const CITY_COORDS = CITIES
