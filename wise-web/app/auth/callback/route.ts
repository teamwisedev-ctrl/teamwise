import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      if (!data?.session) {
        console.error("OAuth session missing after successful exchange:", data);
        // User created but no session (e.g., email confirmation required)
        return NextResponse.redirect(`${origin}/login?error=session_missing`)
      }

      // Check if we are incorrectly redirecting to a different domain where cookies won't match
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      let redirectUrl = `${origin}${next}`;
      
      // If we are behind a reverse proxy/load balancer, use forwarded host to preserve the correct domain
      if (!isLocalEnv && forwardedHost) {
        // Only use forwardedHost if it matches our canonical domains to prevent open redirect
        if (forwardedHost === 'mo2.kr' || forwardedHost.endsWith('.vercel.app')) {
            redirectUrl = `https://${forwardedHost}${next}`;
        }
      } else if (!isLocalEnv && process.env.NEXT_PUBLIC_SITE_URL) {
        // Fallback to standard site URL in production if no forwarded host
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        // Avoid localhost redirect in prod
        if (!siteUrl.includes('localhost')) {
           redirectUrl = `${siteUrl}${next}`;
        }
      }

      return NextResponse.redirect(redirectUrl)
    } else {
      console.error("Supabase exchangeCodeForSession Error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`)
    }
  }

  console.error("OAuth Callback Error: No code provided in URL");
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
