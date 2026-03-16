import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Layers } from 'lucide-react'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://mo2.kr'),
  title: {
    default: 'Mo2 - 1:N 쇼핑몰 통합관리 솔루션',
    template: '%s | Mo2'
  },
  description: '도매토피아, 네이버 스마트스토어, 카페24 등 다중 마켓을 한 번에 관리하는 지능형 상품 연동 솔루션',
  keywords: ['도매토피아', '카페24 연동', '스마트스토어 연동', '쇼핑몰 통합관리', '상품 대량등록', 'Mo2', '모투', '오픈마켓 연동', '마진계산'],
  openGraph: {
    title: 'Mo2 - 초보 셀러도 쉬운 1:N 마켓 통합관리',
    description: '구글 시트 기반의 투명한 쇼핑몰 관리. 클릭 한 번으로 수만 개 상품을 내 마켓에 동시 배포하세요.',
    url: 'https://mo2.kr',
    siteName: 'Mo2 (모투)',
    images: [
      {
        url: '/app_banner_740x416_final.jpg',
        width: 740,
        height: 416,
        alt: 'Mo2 자동화 솔루션 배너'
      }
    ],
    locale: 'ko_KR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mo2 - 1:N 마켓 상품 동기화 솔루션',
    description: '무겁고 복잡한 상세페이지 이미지? 걱정 마세요. 알아서 리사이징하고 호스팅까지 붙여 여러 쇼핑몰에 전송합니다.',
    images: ['/app_banner_740x416_final.jpg']
  },
  verification: {
    google: 'qsYaNXddxtUliIGmFE-vlCzJUDtMAYMB-FhNmFQ7nJI',
    other: {
      'naver-site-verification': '2439768ffa31048511f4f95c4a81b37cebb7a02f'
    }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <html lang="ko">
      <body>
        <nav className="nav-wrapper">
          <div className="container nav-container">
            <div className="nav-logo">
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <svg width="0" height="0">
                  <linearGradient id="mo2-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop stopColor="var(--accent-primary)" offset="0%" />
                    <stop stopColor="var(--accent-secondary)" offset="100%" />
                  </linearGradient>
                </svg>
                <Layers size={32} stroke="url(#mo2-gradient)" strokeWidth={2.5} />
                <span
                  className="gradient-text-accent"
                  style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.5px' }}
                >
                  Mo2
                </span>
              </Link>
            </div>
            <div className="nav-menu">
              <Link href="/" style={linkStyles}>
                홈
              </Link>
              <Link href="/guide" style={linkStyles}>
                가이드
              </Link>
              <Link href="/tools/margin-calculator" style={linkStyles}>
                마진 계산기
              </Link>
              <Link href="/tools/keyword-mixer" style={linkStyles}>
                상품명 조합기
              </Link>
              {/* <Link href="/pricing" style={linkStyles}>
                요금제
              </Link> */}
              <Link href="/admin" style={linkStyles}>
                대시보드
              </Link>
            </div>
            <div className="nav-auth">
              {user ? (
                <>
                  <Link
                    href="/admin"
                    className="btn-secondary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {user.email?.split('@')[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'inline-block' }}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/login"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'inline-block' }}
                  >
                    무료로 시작하기
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content" style={{ flex: 1, paddingBottom: '60px' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={footerStyles}>
          <div className="container" style={footerContainerStyles}>
            <div>
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                <Layers size={20} stroke="url(#mo2-gradient)" strokeWidth={2.5} />
                Mo2
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                초보 셀러도 쉽게 시작하는
                <br />
                1:N 마켓 상품 동기화 솔루션
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>링크</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link
                    href="/guide"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                  >
                    사용자 매뉴얼
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link
                    href="/terms"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                  >
                    이용약관
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link
                    href="/privacy"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                  >
                    개인정보처리방침
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link
                    href="/tools/margin-calculator"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                  >
                    오픈마켓 마진 계산기 (무료)
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link
                    href="/tools/keyword-mixer"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                  >
                    스마트스토어 키워드 조합기 (무료)
                  </Link>
                </li>
                {/* <li style={{ marginBottom: '8px' }}>
                  <Link
                    href="/pricing"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                  >
                    요금제 안내
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
        </footer>
        <GoogleAnalytics gaId="G-BDVPZ94H72" />
      </body>
    </html>
  )
}

// Inline styles for skeleton speed (In production, move to CSS modules or globals)
const linkStyles: React.CSSProperties = {
  fontWeight: 500,
  fontSize: '0.95rem',
  color: 'var(--text-secondary)'
}

const footerStyles: React.CSSProperties = {
  borderTop: '1px solid var(--border-color)',
  padding: '60px 0',
  marginTop: 'auto'
}

const footerContainerStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '40px'
}
