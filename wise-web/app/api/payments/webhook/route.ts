import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Toss Payments Webhook Endpoint
// This endpoint receives notifications from Toss Payments about결제 status changes.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventType, data } = body;

        // Verify Toss Payments Webhook Source (in production, you'd check a secret/signature here)
        // For now, we proceed to process the payload
        
        console.log(`[Toss Webhook] Received event: ${eventType}`);

        // We only care about successful payments for subscriptions/addons
        if (eventType === 'PAYMENT_STATUS_CHANGED' && data.status === 'DONE') {
            const { orderId, paymentKey, amount, customerEmail } = data;

            // Initialize Admin Supabase Client to bypass RLS
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { persistSession: false } }
            );

            // Find the user by the email that was sent during the payment request
            const { data: users, error: userError } = await supabaseAdmin
                .from('auth.users')
                .select('id')
                .eq('email', customerEmail);

            if (userError || !users || users.length === 0) {
                console.error(`[Toss Webhook] Customer not found for email: ${customerEmail}`);
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const userId = users[0].id;
            
            // Extract plan from orderId or a metadata field if passed (e.g. order_coupon_1234 -> coupon)
            // For this demo, let's assume we mapped it beforehand, or we distinguish by amount if strictly needed.
            // Ideally, the client sends custom data or we maintain an "orders" table to look up the planId.
            // Here, we'll do a simple heuristic for MVP:
            let planId = 'unknown';
            if (amount === 9900) planId = 'addon_coupang';
            if (amount === 19900) planId = 'pro_unlimited';

            // Calculate expiration (e.g. 1 month from now)
            const currentPeriodStart = new Date();
            const currentPeriodEnd = new Date(currentPeriodStart);
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

            // Upsert the subscription record
            const { error: dbError } = await supabaseAdmin
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    status: 'active',
                    plan_id: planId,
                    current_period_start: currentPeriodStart.toISOString(),
                    current_period_end: currentPeriodEnd.toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' }); // Assuming 1 active sub per user for now, or handle addons via array/jsonb

            if (dbError) {
                console.error(`[Toss Webhook] Failed to update subscription DB:`, dbError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }

            console.log(`[Toss Webhook] Successfully updated subscription for user ${userId} to plan ${planId}`);
            return NextResponse.json({ success: true, message: 'Subscription updated' });
        }

        // Return 200 OK for other events to acknowledge receipt
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('[Toss Webhook] Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
