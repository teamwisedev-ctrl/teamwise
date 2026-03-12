import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getInquiries } from './actions'
import InquiryClient from './InquiryClient'

export default async function InquiriesPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const inquiries = await getInquiries()

  return (
    <div
      className="container animate-fade-in"
      style={{ paddingTop: '60px', paddingBottom: '60px', maxWidth: '900px' }}
    >
      <div style={{ marginBottom: '40px' }}>
        <Link
          href="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={16} /> 대시보드로 돌아가기
        </Link>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span className="gradient-text-accent">1:1 문의</span> 게시판
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          서비스 이용 중 불편하신 점이나 건의사항을 남겨주시면 빠르게 답변해 드립니다.
        </p>
      </div>

      <InquiryClient initialInquiries={inquiries} />
    </div>
  )
}
