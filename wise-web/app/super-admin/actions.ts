'use server';

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const SUPER_ADMIN_EMAIL = 'mo2kr.team@gmail.com';

// Validate if the current session belongs to the super admin
export async function requireSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        throw new Error("Unauthorized: Super Admin access required.");
    }
    return user;
}

// Create a Supabase client configured with the Service Role Key to bypass RLS
function getServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createSupabaseAdmin(supabaseUrl, supabaseServiceKey);
}

export async function getAllUsersData() {
    await requireSuperAdmin();
    const adminClient = getServiceRoleClient();

    // Fetch auth users
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
    if (authError) throw new Error(authError.message);

    // Fetch subscriptions for all users
    const { data: subData, error: subError } = await adminClient.from('subscriptions').select('*');
    if (subError) throw new Error(subError.message);

    // Combine Data
    const usersMap = authData.users.map(user => {
        const userSubs = subData.filter(sub => sub.user_id === user.id)
                                .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const activeSub = userSubs[0] || null;

        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            subscription: activeSub
        };
    });

    // Sort by created_at descending
    usersMap.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return usersMap;
}

export async function updateUserSubscription(userId: string, planId: string, expiryDateString: string) {
    await requireSuperAdmin();
    const adminClient = getServiceRoleClient();

    // We will do a robust upsert or update. Since users should have a subscription row from the trigger, we try to update first.
    // If not found, we insert.
    const { data: existingSub } = await adminClient.from('subscriptions').select('id').eq('user_id', userId).limit(1).single();

    if (existingSub) {
        const { error } = await adminClient.from('subscriptions').update({
            plan_id: planId,
            current_period_end: new Date(expiryDateString).toISOString(),
            status: 'active',
            updated_at: new Date().toISOString()
        }).eq('id', existingSub.id);
        
        if (error) throw new Error(error.message);
    } else {
        const { error } = await adminClient.from('subscriptions').insert([{
            user_id: userId,
            plan_id: planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(expiryDateString).toISOString()
        }]);

        if (error) throw new Error(error.message);
    }

    return { success: true };
}
