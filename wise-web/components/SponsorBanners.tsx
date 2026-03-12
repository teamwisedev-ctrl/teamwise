'use client'

import { ExternalLink, Package, ShoppingCart } from 'lucide-react'

export default function SponsorBanners() {
  return (
    <div
      className="glass-panel animate-slide-up delay-200"
      style={{ padding: '24px', marginBottom: '40px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Package size={20} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>셀러 추천 인프라 & 부자재</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
        사업 운영에 필수적인 가성비 도구들을 최저가로 만나보세요. (Mo2 전용 혜택 추가 예정)
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Coupang Partners Initial Ad Example */}
        <a
          href="https://link.coupang.com/a/bGZZZZ" // Placeholder Coupang link
          target="_blank"
          rel="noopener noreferrer"
          className="sponsor-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background:
              'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.02))',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#white',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingCart size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                가성비 우체국 택배박스 세트
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                로켓배송 무료 배송 혜택
              </div>
            </div>
          </div>
          <ExternalLink size={18} color="var(--text-muted)" />
        </a>

        {/* Placeholder for Tax Accountant / 3PL Ad */}
        <div
          className="sponsor-card-disabled"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)',
            background: 'rgba(255, 255, 255, 0.02)',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🤝</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                온라인 전문 세무/3PL 제휴
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                엄선된 파트너스 준비 중입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
