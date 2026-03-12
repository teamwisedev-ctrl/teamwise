require('dotenv').config({ path: 'c:/wise/wise-web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log("Checking subscriptions schema...");
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error fetching subscriptions:", error);
  } else {
    console.log("Subscriptions columns:", Object.keys(data[0]));
  }

  // Attempt to dummy signup to see the exact error if it's the trigger
  console.log("Attempting a dummy email signup to see trigger errors...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'testdummy' + Date.now() + '@gmail.com',
    password: 'password12345!',
  });

  if (authError) {
    console.error("Auth Signup Error:", authError);
  } else {
    console.log("Auth Signup Success! User was successfully inserted into auth.users and triggers executed perfectly.", authData.user.id);
    if (authData.user) {
        // Look into profiles and subscriptions
        const {data: pData} = await supabase.from('profiles').select('*').eq('id', authData.user.id);
        console.log("Created Profile:", pData);
        const {data: sData} = await supabase.from('subscriptions').select('*').eq('user_id', authData.user.id);
        console.log("Created Subscription:", sData);

        // cleanup
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log("Cleanup done.");
    }
  }
}

checkDatabase();
