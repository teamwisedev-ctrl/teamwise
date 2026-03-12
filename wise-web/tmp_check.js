const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTrigger() {
  const { data, error } = await supabase.rpc('get_trigger_def_function_maybe')
  // Wait, I can just query Postgres `pg_proc`
  // since `supabase-js` service role key doesn't allow raw SQL easily without RPC,
  // I can use the REST API `pg_proc` endpoint? No, POSTGREST doesn't expose system catalogs!
  console.log(
    'We need to query the database using standard Node Postgres if we have the connection string.'
  )
}

checkTrigger()
