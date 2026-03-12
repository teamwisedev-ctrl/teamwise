import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get current user's active subscription plans
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    // We use the anon key for the client initialization, but authenticate with the passed token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 })
    }

    // Initialize Admin Supabase Client to bypass RLS to read subscriptions for this user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const now = new Date().toISOString()

    // Fetch active subscriptions for this user
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_id, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('current_period_end', now)

    if (subError) {
      console.error('Failed to fetch subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    const activePlans = subscriptions.map((sub: any) => sub.plan_id)

    return NextResponse.json({
      activePlans,
      isCoupangActive: activePlans.includes('addon_coupang'),
      isUnlimitedActive: activePlans.includes('pro_unlimited')
    })
  } catch (error) {
    console.error('Error in subscriptions API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
