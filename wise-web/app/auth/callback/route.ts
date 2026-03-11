import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/admin'
  let exchangeError: unknown = null;

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (err) {
              console.error("cookieStore.set error in callback route:", err);
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    exchangeError = error;
    
    if (!error) {
      // Use the NEXT_PUBLIC_SITE_URL environment variable if set (which is our Vercel prod URL),
      // otherwise fallback to the origin of the request.
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
      
      // Ensure we don't redirect to localhost in production if origin somehow resolved to it
      if (process.env.NODE_ENV === 'production' && siteUrl.includes('localhost')) {
          return NextResponse.redirect(`https://mo2.kr${next}`)
      }

      return NextResponse.redirect(`${siteUrl}${next}`)
    } else {
      console.error("Supabase exchangeCodeForSession Error:", error);
      return NextResponse.json({
        success: false,
        message: "Supabase 인증 세션 교환에 실패했습니다.",
        errorDetails: error
      }, { status: 400 });
    }
  }

  // return the user to an error page with some instructions
  console.error("OAuth Callback Error:", exchangeError || "No code provided in URL");
  return NextResponse.json({
    success: false,
    message: "인증 코드가 URL에 없습니다.",
  }, { status: 400 });
}
