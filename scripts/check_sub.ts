import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../wise-web/.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const userId = 'ef3a1525-71fc-4690-a28b-15f7afb68c22' // teamwise.dev
  const { data: subs, error } = await adminClient
    .from('subscriptions')
    .select('id, plan_id, status, current_period_end')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    
  if (error) console.error(error)
  console.log('Subs for teamwise.dev:', JSON.stringify(subs, null, 2))
}

check()
