import { BetaAnalyticsDataClient } from '@google-analytics/data'
import fs from 'fs'
import path from 'path'

// Load from temp_ga_auth.json instead of env to guarantee no dotenv corruption
const jsonPath = path.join(__dirname, 'temp_ga_auth.json')
const rawJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const propertyId = '528037799'

// Try pure parsing directly from google's own generated JSON
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: rawJson.client_email,
    private_key: rawJson.private_key
  }
})

async function checkGa() {
  console.log('Using Property ID:', propertyId)
  console.log('Original PVT KEY length:', rawJson.private_key.length)
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }], // Test up to 90 days
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }]
    })
    console.log('Report result rows length:', response.rows?.length)
    if (response.rows && response.rows.length > 0) {
      console.log('Sample data:', JSON.stringify(response.rows[0], null, 2))
    } else {
      console.log('No data returned. This means exactly 0 traffic for the date range.')
    }
  } catch (e: any) {
    console.error('API Error:', e.message)
  }
}

checkGa()
