require('dotenv').config({ path: 'c:/wise/wise-web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Ensure we have service role for DB inserts
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);

async function debugDatabase() {
    console.log("Triggering auth.signUp to see if the trigger crashes...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'testdummy' + Date.now() + '@gmail.com',
        password: 'password12345!',
    });

    if (authError) {
        console.error("Auth Signup Error:", authError);
    } else {
        console.log("Auth Signup Success!", authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
    }
}

debugDatabase();
