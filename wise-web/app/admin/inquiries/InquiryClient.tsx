'use client'

import { useState } from 'react'
import { createInquiry } from './actions'

export default function InquiryClient({
  initialInquiries
}: {
  initialInquiries: Record<string, any>[]
}) {
  const [inquiries] = useState(initialInquiries)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createInquiry(formData)
      alert('문의가 성공적으로 등록되었습니다. 빠르게 답변해 드리겠습니다.')
      setShowForm(false)
      // In a real app we might refetch inquiries here, or wait for page reload.
      // For now, reload to get the fresh list from server
      window.location.reload()
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert(String(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header / Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>나의 문의 내역 ({inquiries.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          {showForm ? '취소' : '새 문의 등록'}
        </button>
      </div>

      {/* New Inquiry Form */}
      {showForm && (
        <div
          className="glass-panel animate-slide-up"
          style={{
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid var(--accent-primary)'
          }}
        >
          <form
            action={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                문의 유형
              </label>
              <select
                name="type"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none'
                }}
              >
                <option value="결제/환불">💳 결제 및 환불</option>
                <option value="기술지원">💻 오류 및 기술 지원</option>
                <option value="상품문의">📦 이용 방법 문의</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>제목</label>
              <input
                type="text"
                name="title"
                required
                placeholder="문의 제목을 입력해주세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>내용</label>
              <textarea
                name="content"
                required
                rows={5}
                placeholder="상세한 문의 내용을 남겨주시면 더 빠르고 정확한 답변이 가능합니다."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              ></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ padding: '10px 24px' }}
              >
                {isSubmitting ? '등록 중...' : '문의 등록하기'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inquiries List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {inquiries.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: 'var(--text-muted)',
              fontSize: '1rem',
              textAlign: 'center',
              background: 'rgba(248, 250, 252, 0.5)',
              borderRadius: '12px'
            }}
          >
            등록된 문의 내역이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inquiries.map((iq) => (
              <div
                key={iq.id}
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: '#FAFAFA'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        padding: '4px 8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--accent-primary)',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}
                    >
                      {iq.type}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{iq.title}</h3>
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: iq.status === 'answered' ? '#10B981' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    {iq.status === 'answered' ? '답변 완료' : '답변 대기중'}
                  </div>
                </div>
                <div
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '16px'
                  }}
                >
                  {iq.content}
                </div>

                {iq.response && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: '#FFFFFF',
                      borderLeft: '4px solid var(--accent-primary)',
                      borderRadius: '0 8px 8px 0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--accent-primary)',
                        marginBottom: '8px'
                      }}
                    >
                      관리자 답변
                    </div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {iq.response}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  등록일: {new Date(iq.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
