import { BrowserWindow, session, Notification, shell } from 'electron'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Use exactly the same public keys from your web project
const SUPABASE_URL = 'https://sqiufpkzdosgtynbikkx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_hTtTs0gEhVPcG2sQRfEHoQ_SAJO8Bh_'

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Checks if a user has a valid active/trial subscription.
 */
export async function checkLicense(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return false
    }

    return ['active', 'trial'].includes(data.status)
  } catch (e) {
    console.error('License check failed', e)
    return false
  }
}

/**
 * Opens a login window to your Next.js web app's login page.
 * Returns the Supabase session details if successful.
 */
export function requireLogin(
  parentWindow?: BrowserWindow
): Promise<{ user_id: string; email: string }> {
  return new Promise((resolve, reject) => {
    const loginWin = new BrowserWindow({
      width: 800,
      height: 900,
      title: 'Mo2 라이선스 로그인',
      modal: parentWindow ? true : false,
      parent: parentWindow,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    // We load the live Next.js app in development, or the production URL later.
    // The most robust way in Electron is to use the standard Supabase Auth UI
    // hosted on your website, then capture the session token from local storage or cookie.

    loginWin.loadURL('https://mo2.kr/login')

    // Periodically check local storage or cookies to see if user logged in
    // In Next.js with Supabase SSR, a cookie like `sb-XXX-auth-token` is set.
    const checkInterval = setInterval(async () => {
      if (loginWin.isDestroyed()) {
        clearInterval(checkInterval)
        return
      }

      try {
        // Execute JS to grab the Supabase auth token from local storage if using client auth
        // Or check cookies
        await session.defaultSession.cookies.get({ url: 'https://mo2.kr' })
        // Alternatively, we can just intercept the redirect to /admin!
        // Since our web app redirects to /admin upon login, detecting /admin means success.
      } catch {
        // ignore
      }
    }, 1000)

    // Easier method: Intercept Navigation!
    loginWin.webContents.on('did-navigate', async (_event, url) => {
      if (url.includes('/admin')) {
        clearInterval(checkInterval)

        // User is authenticated. Let's pull the session cookie from the browser window.
        await session.defaultSession.cookies.get({ url: 'https://mo2.kr' })

        // Due to SSR, Next.js holds the session cookies.
        // To get the user ID, we can inject a script to ask the page, or read the token.
        // An easier trick: Just inject JS into the loaded /admin page to read the user email
        // that is rendered, or better yet, hit an API endpoint we create.

        try {
          // Inject JS to grab the email from the page text for a quick mock test
          // But for security, we need the exact Supabase JWT.
          // Let's use `window.localStorage.getItem` if available.
          const localStorageKeys = await loginWin.webContents.executeJavaScript(
            `Object.keys(window.localStorage)`
          )
          const sbKey = localStorageKeys.find(
            (k: string) => k.startsWith('sb-') && k.endsWith('-auth-token')
          )

          if (sbKey) {
            const tokenStr = await loginWin.webContents.executeJavaScript(
              `window.localStorage.getItem('${sbKey}')`
            )
            const tokenData = JSON.parse(tokenStr)
            console.log('Found Electron local session:', tokenData.user.email)

            loginWin.close()
            resolve({ user_id: tokenData.user.id, email: tokenData.user.email })
          } else {
            // If it's pure SSR and no local storage, we might need a dedicated API endpoint like /api/auth/me
            // For now, assume SSR cookies are shared and we can just hit our DB.
          }
        } catch (e) {
          console.error('Failed to read user data from window', e)
        }
      }
    })

    loginWin.on('closed', () => {
      clearInterval(checkInterval)
      reject(new Error('User closed login window.'))
    })
  })
}

/**
 * Subscribes to Supabase Realtime for push notifications.
 */
export function setupPushNotifications(userId: string) {
  // We only care about updates where status changes to 'answered' for THIS user
  const channel = supabase
    .channel('inquiries-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'inquiries',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const oldRow = payload.old as any
        const newRow = payload.new as any

        // Check if status changed from 'pending' to 'answered'
        if (oldRow.status !== 'answered' && newRow.status === 'answered') {
          if (Notification.isSupported()) {
            const notif = new Notification({
              title: 'Mo2 관리자 답변 알림',
              body: `[${newRow.title}] 문의에 대한 답변이 등록되었습니다.`,
              icon: __dirname + '/../../resources/icon.png' // Use app icon if available
            })

            notif.on('click', () => {
              // Bring the main window to front
              const win = BrowserWindow.getAllWindows()[0]
              if (win) {
                if (win.isMinimized()) win.restore()
                win.show()
                win.focus()
              } else {
                // If the app is somehow fully closed (unlikely in tray), open external
                shell.openExternal('https://mo2.kr/admin/inquiries')
              }
            })

            notif.show()
          }
        }
      }
    )
    .subscribe((status) => {
      console.log('Realtime notification subscription status:', status)
    })

  return channel
}

export function setupAuthHandlers() {
  // Add setup logic here if needed
}
