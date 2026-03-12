import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client with the Service Role Key
// This lets us bypass RLS to clean up credentials without needing a user session
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        
        // Cafe24 Webhook Payload usually contains:
        // { event_type: 'app_uninstalled', mall_id: 'samplemall', client_id: 'xxxx' }
        console.log('[Cafe24 Webhook] Received payload:', payload);

        const { event_type, mall_id, client_id } = payload;

        if (event_type === 'app_uninstalled' && mall_id) {
            // Optional: Verify the client_id matches ours to prevent spoofing
            const expectedClientId = process.env.CAFE24_CLIENT_ID;
            if (expectedClientId && client_id !== expectedClientId) {
                console.warn(`[Cafe24 Webhook] Client ID mismatch. Expected ${expectedClientId}, got ${client_id}`);
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Clean up the integration tokens to revoke access and free up the user's slot
            const { error: deleteError } = await adminClient
                .from('market_credentials')
                .delete()
                .match({
                    market_type: 'cafe24',
                    mall_id: mall_id
                });
                
            if (deleteError) {
                console.error(`[Cafe24 Webhook] Failed to delete credentials for mall ${mall_id}:`, deleteError.message);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }

            console.log(`[Cafe24 Webhook] Successfully revoked integration for mall: ${mall_id}`);
            return NextResponse.json({ success: true, message: 'App uninstalled handling complete.' }, { status: 200 });
        }

        // Return 200 even if we don't process this type, so Cafe24 doesn't retry
        return NextResponse.json({ success: true, message: 'Event ignored.' }, { status: 200 });

    } catch (error: unknown) {
        console.error('[Cafe24 Webhook] Internal server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
