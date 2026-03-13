'use client'

import { useState, useMemo } from 'react'
import { replyToInquiry } from './actions'
import { Search } from 'lucide-react'

type TabType = 'all' | 'pending' | 'answered'

// Use any here because Supabase return types aren't strictly generated in this project yet
export default function SuperAdminInquiryClient({ initialInquiries }: { initialInquiries: any[] }) {
  const [inquiries] = useState(initialInquiries)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  async function handleReply(e: React.FormEvent<HTMLFormElement>, inquiryId: string) {
    e.preventDefault()
    setSubmittingId(inquiryId)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('inquiryId', inquiryId)
      await replyToInquiry(formData)

      alert('답변이 등록되었습니다.')
      // Reload page or optimistically update
      window.location.reload()
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert(String(error))
      }
    } finally {
      setSubmittingId(null)
    }
  }

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((iq) => {
      // 1. Tab filter
      if (activeTab === 'pending' && iq.status === 'answered') return false
      if (activeTab === 'answered' && iq.status !== 'answered') return false

      // 2. Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchTitle = iq.title?.toLowerCase().includes(query)
        const matchEmail = iq.user_email?.toLowerCase().includes(query)
        const matchContent = iq.content?.toLowerCase().includes(query)
        if (!matchTitle && !matchEmail && !matchContent) return false
      }

      return true
    })
  }, [inquiries, activeTab, searchQuery])

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '24px' }}>
      {/* Controls Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(
            [
              { id: 'all', label: '전체' },
              { id: 'pending', label: '답변 대기' },
              { id: 'answered', label: '답변 완료' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'rgba(0,0,0,0.05)',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="제목, 내용, 이메일 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredInquiries.map((iq) => (
            <div
              key={iq.id}
              style={{
                padding: '20px',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                background: '#FAFAFA'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{iq.title}</h3>
                  </div>
                  <div
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}
                  >
                    작성자 이메일: {iq.user_email}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: iq.status === 'answered' ? '#10B981' : '#EF4444',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px'
                  }}
                >
                  {iq.status === 'answered' ? '✓ 답변 완료' : '⚠ 미답변'}
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  [문의 내용]
                </div>
                {iq.content}
              </div>

              {/* Admin Reply Section */}
              {iq.status === 'answered' ? (
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.05)',
                    borderLeft: '4px solid var(--accent-primary)',
                    borderRadius: '0 8px 8px 0'
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
                    [제출된 답변]
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
              ) : (
                <form
                  onSubmit={(e) => handleReply(e, iq.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '16px'
                  }}
                >
                  <textarea
                    name="response"
                    required
                    rows={4}
                    placeholder="이곳에 고객에게 보낼 답변을 입력하세요."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  ></textarea>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submittingId === iq.id}
                      style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                    >
                      {submittingId === iq.id ? '전송 중...' : '답변 🚀'}
                    </button>
                  </div>
                </form>
              )}

              <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                작성일: {new Date(iq.created_at).toLocaleString()}{' '}
                {iq.updated_at &&
                  iq.status === 'answered' &&
                  `| 마지막 처리: ${new Date(iq.updated_at).toLocaleString()}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
