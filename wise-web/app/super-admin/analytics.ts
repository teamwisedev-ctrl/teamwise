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

    // Parse rows
    const dailyStats =
      response.rows?.map((row) => {
        return {
          date: row.dimensionValues?.[0]?.value || '',
          activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
          pageViews: parseInt(row.metricValues?.[1]?.value || '0', 10)
        }
      }) || []

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
