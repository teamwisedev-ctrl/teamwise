import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); 
  const mallId = state || searchParams.get('mall_id'); // We pass mallId in the state parameter

  if (!code || !mallId) {
    return NextResponse.json({ error: 'Missing code or mall_id (state)' }, { status: 400 });
  }

  // TODO: Securely fetch from environment variables in production
  // We use placeholder env vars for the Mo2 official Cafe24 App
  const clientId = process.env.CAFE24_CLIENT_ID;
  const clientSecret = process.env.CAFE24_CLIENT_SECRET;
  const redirectUri = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/market/cafe24/callback'
    : 'https://mo2.kr/api/market/cafe24/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`https://${mallId}.cafe24api.com/api/v2/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cafe24 token exchange failed:', errorText);
      return NextResponse.json({ error: 'Token exchange failed', details: errorText }, { status: response.status });
    }

    const tokenData = await response.json();
    const { access_token, refresh_token, expires_at, refresh_token_expires_at } = tokenData;

    // Save tokens securely to Supabase associated with the user
    // In a real flow, 'state' might be a JWT or session identifier to link to the correct Supabase user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // For now, if no user is found in the current web session, just store it under the specific mall_id
    // and let the desktop app fetch it by mallId. Ideally, link it to the user's UUID.
    
    // Using a hypothetic 'market_credentials' table
    const { error: dbError } = await supabaseAdmin
      .from('market_credentials')
      .upsert({
        user_id: null, // Best effort
        market_type: 'cafe24',
        mall_id: mallId,
        access_token,
        refresh_token,
        access_expires_at: expires_at,
        refresh_expires_at: refresh_token_expires_at,
        updated_at: new Date().toISOString()
      }, { onConflict: 'market_type, mall_id' }); // Assuming unique constraint on market_type+mall_id

    if (dbError) {
      console.error('Failed to save Cafe24 tokens to DB:', dbError);
    }

    // Redirect the user back to the Web Dashboard or show a success page that Electron can detect
    // Electron usually listens for a specific URL or title to close the auth popup
    return new NextResponse(`
      <html>
        <head><title>Cafe24 Authentication Success</title></head>
        <body>
          <h2>연동 성공!</h2>
          <p>카페24 쇼핑몰(${mallId}) 권한 인증이 완료되었습니다. 창을 닫아주세요.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  } catch (error: any) {
    console.error('Cafe24 OAuth callback error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
