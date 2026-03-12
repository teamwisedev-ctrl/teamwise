import React from 'react'

export type ViewType = 'SOURCING' | 'SYNC' | 'ORDERS' | 'SETTINGS'

import { DownloadCloud, Rocket, ShoppingCart, Settings, Layers } from 'lucide-react'

interface SidebarProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'SOURCING', label: 'B2B 상품 소싱', icon: <DownloadCloud size={18} /> },
    { id: 'SYNC', label: '1:N 다중 마켓 배포', icon: <Rocket size={18} /> },
    { id: 'ORDERS', label: '통합 주문 관리', icon: <ShoppingCart size={18} /> },
    { id: 'SETTINGS', label: '연동 및 환경 설정', icon: <Settings size={18} /> }
  ]

  return (
    <div
      style={{
        width: '260px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
        zIndex: 10
      }}
    >
      <div style={{ marginBottom: '40px', padding: '0 8px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#2d3748',
            margin: 0,
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <linearGradient id="mo2-gradient-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#3b82f6" offset="0%" />
                <stop stopColor="#8b5cf6" offset="100%" />
              </linearGradient>
            </svg>
            <Layers size={32} stroke="url(#mo2-gradient-sidebar)" strokeWidth={2.5} />
          </span>
          Mo2<span style={{ color: '#4299e1' }}>.</span>
        </h1>
        <p style={{ color: '#718096', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '500' }}>
          Multi-Market Hub
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              gap: '12px',
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: currentView === item.id ? '#4299e1' : 'transparent',
              color: currentView === item.id ? 'white' : '#4a5568',
              fontWeight: currentView === item.id ? '600' : '500',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              boxShadow: currentView === item.id ? '0 4px 12px rgba(66, 153, 225, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.backgroundColor = 'rgba(66, 153, 225, 0.1)'
                e.currentTarget.style.color = '#2b6cb0'
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#4a5568'
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Affiliate B2B Banner (Coupang Dynamic Banner) */}
      <div style={{ marginTop: 'auto', marginBottom: '12px' }}>
        <div
          style={{
            width: '100%',
            height: '200px', // Adjusted for 200x200 banner
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            marginBottom: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <iframe
            src="https://ads-partners.coupang.com/widgets.html?id=971945&template=banner&trackingCode=AF5682280&subId=&width=200&height=200"
            width="200"
            height="200"
            frameBorder="0"
            scrolling="no"
            referrerPolicy="unsafe-url"
          ></iframe>
        </div>
        <div style={{ fontSize: '9px', color: '#a0aec0', textAlign: 'center', lineHeight: '1.3', letterSpacing: '-0.3px' }}>
          이 포스팅은 쿠팡 파트너스 활동의 일환으로,<br />
          이에 따른 일정액의 수수료를 제공받습니다.
        </div>
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#a0aec0',
          textAlign: 'center'
        }}
      >
        v3.0.0 (Multi-Market Ready)
      </div>
    </div>
  )
}
