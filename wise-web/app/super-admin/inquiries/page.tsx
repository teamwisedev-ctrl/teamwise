import { requireSuperAdmin } from '../actions'
import { getAllInquiries } from './actions'
import SuperAdminInquiryClient from './SuperAdminInquiryClient'

export default async function SuperAdminInquiriesPage() {
  await requireSuperAdmin()
  // Assuming type allows returning arrays of inquiries
  const inquiries = await getAllInquiries()

  return (
    <div style={{ padding: '24px' }}>
      <h1
        style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          marginBottom: '24px',
          color: 'var(--text-primary)'
        }}
      >
        1:1 문의 전체 관리
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        전체 회원이 등록한 1:1 문의 내역을 확인하고 관리자 답변을 등록합니다.
      </p>

      <SuperAdminInquiryClient initialInquiries={inquiries} />
    </div>
  )
}
