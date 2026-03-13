'use server'

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { requireSuperAdmin } from './actions'

// We'll require the Property ID from environment variables later
const propertyId = process.env.GA_PROPERTY_ID

// Configure Auth for the Data API client using our injected Environment Variables
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    // Replace literal \n with actual newlines to fix formatting issues in env vars
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
})

export async function getAnalyticsData() {
  await requireSuperAdmin()

  if (!propertyId) {
    throw new Error('Google Analytics Property ID is not configured in environment variables.')
  }

  try {
    // 1. Fetch active users in the last 7 days
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today'
        }
      ],
      dimensions: [
        {
          name: 'date'
        }
      ],
      metrics: [
        {
          name: 'activeUsers'
        },
        {
          name: 'screenPageViews'
        }
      ]
    })

    // 2. Generate a baseline 7-day array to ensure the table always renders
    const baselineStats: Record<string, any> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      // Format as YYYYMMDD to match GA response
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateKey = `${yyyy}${mm}${dd}`
      baselineStats[dateKey] = {
        date: dateKey,
        activeUsers: 0,
        pageViews: 0
      }
    }

    // 3. Merge actual GA data overriding the baseline zeros
    if (response.rows && response.rows.length > 0) {
      response.rows.forEach((row) => {
        const dateStr = row.dimensionValues?.[0]?.value
        if (dateStr && baselineStats[dateStr]) {
          baselineStats[dateStr].activeUsers = parseInt(row.metricValues?.[0]?.value || '0', 10)
          baselineStats[dateStr].pageViews = parseInt(row.metricValues?.[1]?.value || '0', 10)
        }
      })
    }

    // Convert object back to array
    const dailyStats = Object.values(baselineStats) as {
      date: string
      activeUsers: number
      pageViews: number
    }[]

    // Sort by date sequentially
    dailyStats.sort((a, b) => a.date.localeCompare(b.date))

    // Format dates 'YYYYMMDD' -> 'MM-DD'
    const formattedStats = dailyStats.map((stat) => ({
      ...stat,
      displayDate: `${stat.date.substring(4, 6)}-${stat.date.substring(6, 8)}`
    }))

    const totalActiveUsers = formattedStats.reduce((acc, curr) => acc + curr.activeUsers, 0)

    return {
      success: true,
      totalActiveUsers,
      dailyStats: formattedStats
    }
  } catch (e: any) {
    console.error('GA API Error:', e)
    throw new Error(`Failed to fetch analytics: ${e.message}`)
  }
}
