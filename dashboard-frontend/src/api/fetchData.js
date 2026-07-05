import { makeMockPayload } from './mockData'

// Toggle this once the Flask API is deployed and CORS-enabled.
// Set VITE_API_URL in your .env (or Render env vars) to the real API base URL,
// e.g. https://upi-fraud-api.onrender.com
const API_URL = import.meta.env.VITE_API_URL
const USE_MOCK = !API_URL

export async function fetchDashboardData(previousPayload) {
  if (USE_MOCK) {
    // Simulate network latency so loading states are visible in preview.
    await new Promise((res) => setTimeout(res, 150))
    return makeMockPayload(previousPayload)
  }

  const res = await fetch(`${API_URL}/api/data`)
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`)
  }
  return res.json()
}

export const isMockMode = USE_MOCK
