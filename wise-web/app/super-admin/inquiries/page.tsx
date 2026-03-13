import { requireSuperAdmin } from '../actions'
import { getAllInquiries } from './actions'
import SuperAdminInquiryClient from './SuperAdminInquiryClient'
import { ShieldAlert } from 'lucide-react'

export default async function SuperAdminInquiriesPage() {
  await requireSuperAdmin()
  const inquiries = await getAllInquiries()

  return (
    <div
      className="container animate-fade-in"
      style={{ paddingTop: '40px', paddingBottom: '40px' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <ShieldAlert size={40} color="#3b82f6" />
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            1:1 문의 전체 관리
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            전체 회원이 등록한 1:1 문의 내역을 확인하고 관리자 답변을 등록합니다.
          </p>
        </div>
      </div>

      <SuperAdminInquiryClient initialInquiries={inquiries} />
    </div>
  )
}
