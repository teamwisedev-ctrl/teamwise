import { getAllUsersData } from './actions'
import SuperAdminClient from './SuperAdminClient'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || user.email !== 'mo2kr.team@gmail.com') {
    // Redirect unauthorized users to login or a safe page
    redirect('/login')
  }

  let initialUsers: any[] = []
  try {
    initialUsers = await getAllUsersData()
  } catch (e) {
    console.error('Failed to fetch super admin data:', e)
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div
        style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)'
            }}
          >
            👑 최고 관리자 (Super Admin)
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            시스템의 모든 사용자를 모니터링하고 관리할 수 있는 전용 대시보드입니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/super-admin/inquiries"
            className="btn-secondary"
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              border: '1px solid var(--accent-primary)',
              textDecoration: 'none',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💬 1:1 문의 관리
          </Link>
          <Link
            href="/admin"
            className="btn-secondary"
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              background: 'transparent',
              color: 'var(--text-primary)'
            }}
          >
            ← 일반 대시보드로 돌아가기
          </Link>
        </div>
      </div>
      <SuperAdminClient initialUsers={initialUsers} currentUserEmail={user.email} />
    </div>
  )
}
