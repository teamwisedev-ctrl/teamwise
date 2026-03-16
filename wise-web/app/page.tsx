import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mo2 - 1:N 마켓 상품 동기화 솔루션 (무료 연동)',
  description: '도매토피아 등 B2B 도매사이트의 상품을 1초 만에 스마트스토어, 카페24로 복사하세요. 이미지 자동 변환부터 마진 계산까지.',
  alternates: {
    canonical: '/'
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-section" style={heroStyles}>
        <div className="container animate-slide-up" style={heroContainerStyles}>
          <div style={heroContentStyles}>
            <h1 style={heroTitleStyles}>
              내 모든 쇼핑몰 관리를{' '}
              <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>2배</span> 더 가볍게,
              <br />
              <span className="gradient-text-accent">하나로 모이(Mo2)는 동기화 솔루션</span>
            </h1>
            <p style={heroDescStyles}>
              수많은 도매처 상품을 내 마켓(카페24 등)으로 클릭 한 번에 전송하세요.
              <br />
              &apos;모으다&apos;의 의미를 담은 Mo2가 귀찮은 수작업을 덜어드립니다.
            </p>
            <div style={heroActionsStyles}>
              <Link
                href="/download"
                className="btn-primary"
                style={{ padding: '16px 32px', fontSize: '1.1rem' }}
              >
                Windows용 다운로드 (무료)
              </Link>
            </div>
            <p
              style={{
                marginTop: '16px',
                fontSize: '0.95rem',
                color: '#10b981',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              카드 등록 없음 · 카페24 완전 무료 연동
            </p>
            <div
              style={{
                marginTop: '20px',
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              복잡한 회원가입 없이{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                구글 계정으로 1초 만에 시작
              </strong>
            </div>
          </div>

          {/* Dashboard Mockup Video/Image Area */}
          <div className="glass-panel animate-slide-up delay-200 mockup-container" style={mockupContainerStyles}>
            <div style={mockupHeaderStyles}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#FF5F56'
                  }}
                ></div>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#FFBD2E'
                  }}
                ></div>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#27C93F'
                  }}
                ></div>
              </div>
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  flex: 1,
                  textAlign: 'center'
                }}
              >
                Mo2 Dashboard v3.0.0
              </div>
            </div>
            <div style={mockupContentStyles}>
              {/* Visual Pipeline for 1:N Sync */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  width: '100%',
                  padding: '16px 16px'
                }}
              >
                {/* Step 1: Source */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    flexWrap: 'wrap'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}
                  >
                    📦
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div
                      style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}
                    >
                      1. 도매토피아 상품 수집
                    </div>
                    <div
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        marginTop: '4px'
                      }}
                    >
                      가전/디지털 카테고리 100건
                    </div>
                  </div>
                  <div
                    style={{ color: 'var(--accent-success)', fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    완료
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    margin: '-8px 0'
                  }}
                >
                  ⬇
                </div>

                {/* Step 2: Master */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    flexWrap: 'wrap'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--accent-success)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}
                  >
                    📊
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div
                      style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}
                    >
                      2. 마스터 시트 데이터 가공
                    </div>
                    <div
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        marginTop: '4px'
                      }}
                    >
                      판매가 마진율(1.5x) 일괄 적용 및 이미지 호스팅 링크 생성
                    </div>
                  </div>
                  <div
                    style={{ color: 'var(--accent-success)', fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    완료
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    margin: '-8px 0'
                  }}
                >
                  ⬇
                </div>

                {/* Step 3: Target Markets */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'rgba(59, 130, 246, 0.05)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px dashed var(--accent-primary)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--accent-primary)' }}
                    >
                      🚀 3. 내 마켓으로 동시 배포 중 (1:N)
                    </div>
                  </div>

                  {/* Cafe24 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#1A1A1A',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      C
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          marginBottom: '6px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span>카페24 (Cafe24 자사몰)</span>
                        <span style={{ color: '#1A1A1A', fontWeight: 600 }}>100 / 100</span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: '#E2E8F0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', background: '#1A1A1A' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Naver */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#03C75A',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      N
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          marginBottom: '6px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span>네이버 스마트스토어</span>
                        <span style={{ color: '#03C75A', fontWeight: 600 }}>65 / 100</span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: '#E2E8F0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: '65%',
                            height: '100%',
                            background: '#03C75A',
                            transition: 'width 0.5s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={featuresStyles}>
        <div className="container animate-slide-up delay-100">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>
              강력한 핵심 기능
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              판매에만 집중하세요. 나머지는 Mo2가 알아서 합니다.
            </p>
          </div>

          <div style={featureGridStyles}>
            <div className="glass-panel animate-slide-up delay-100" style={featureCardStyles}>
              <div style={featureIconStyles}>🔄</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>
                클릭 한 번으로 N개 마켓 동시 배포
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                똑같은 상품을 마켓마다 일일이 올리지 마세요. 한 번만 세팅하면 여러 곳에 똑같이
                전송됩니다.
              </p>
            </div>

            <div className="glass-panel animate-slide-up delay-200" style={featureCardStyles}>
              <div style={featureIconStyles}>⚡</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>
                귀찮은 이미지 캡쳐/업로드 제로
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                무겁고 복잡한 상세페이지 이미지? 걱정 마세요. 알아서 리사이징하고 호스팅까지
                붙여줍니다.
              </p>
            </div>

            <div className="glass-panel animate-slide-up delay-300" style={featureCardStyles}>
              <div style={featureIconStyles}>🛡️</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>
                구글 시트 기반의 투명한 관리
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                구글 아이디 하나만 있으면 끝! 내 개인 구글 시트에 마스터 데이터가 저장되어 평생 내
                자산으로 남습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="how-it-works-section" style={howItWorksStyles}>
        <div className="container animate-slide-up delay-200">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>
              단 3단계면 끝입니다
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              직관적인 소싱-편집-배포 파이프라인
            </p>
          </div>

          <div style={stepGridStyles}>
            <div className="glass-panel" style={stepCardStyles}>
              <div style={stepNumberStyles}>1</div>
              <h3 style={stepTitleStyles}>상품 수집 (소싱)</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                도매처에서 원하는 상품 번호나 카테고리를 입력하면 이미지와 옵션, 상세페이지를
                자동으로 긁어옵니다.
              </p>
            </div>

            <div style={stepArrowStyles}>➔</div>

            <div className="glass-panel" style={stepCardStyles}>
              <div style={stepNumberStyles}>2</div>
              <h3 style={stepTitleStyles}>마스터 시트 연동</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                수집된 상품 데이터는 내 구글 시트에 자동으로 쌓입니다. 이곳에서 상품명이나 가격을
                입맛대로 수정하세요.
              </p>
            </div>

            <div style={stepArrowStyles}>➔</div>

            <div className="glass-panel" style={stepCardStyles}>
              <div style={stepNumberStyles}>3</div>
              <h3 style={stepTitleStyles}>원클릭 배포</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                원하는 타겟 마켓(카페24, 쿠팡, 스마트스토어 등)을 체크하고 [배포] 버튼을 누르면 모든
                스토어에 동시 등록됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Inline Styles
const heroStyles: React.CSSProperties = {
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'flex-start'
}

const heroContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
}

const heroContentStyles: React.CSSProperties = {
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}

const heroTitleStyles: React.CSSProperties = {
  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
  fontWeight: 800,
  lineHeight: 1.25,
  letterSpacing: '-1.5px',
  marginBottom: '20px',
  wordBreak: 'keep-all',
  textAlign: 'center'
}

const heroDescStyles: React.CSSProperties = {
  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
  marginBottom: '40px',
  maxWidth: '700px',
  wordBreak: 'keep-all',
  textAlign: 'center'
}

const heroActionsStyles: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  flexWrap: 'wrap'
}

const mockupContainerStyles: React.CSSProperties = {
  width: '100%',
  maxWidth: '1000px',
  minHeight: '400px', // changed from fixed 500px to allow inner stacking
  marginTop: '80px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
}

const mockupHeaderStyles: React.CSSProperties = {
  padding: '12px 16px',
  background: '#F8FAFC',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center'
}

const mockupContentStyles: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap' // Added wrap for mobile
}

const featuresStyles: React.CSSProperties = {
  padding: '120px 0',
  background: 'linear-gradient(to bottom, transparent, #F8FAFC)'
}

const featureGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: '24px'
}

const featureCardStyles: React.CSSProperties = {
  padding: '40px 32px',
  transition: 'transform 0.3s ease'
}

const featureIconStyles: React.CSSProperties = {
  fontSize: '2.5rem',
  marginBottom: '24px',
  display: 'inline-block'
}

const howItWorksStyles: React.CSSProperties = {
  padding: '80px 0 140px 0',
  background: 'var(--bg-primary)'
}

const stepGridStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap'
}

const stepCardStyles: React.CSSProperties = {
  padding: '40px 32px',
  flex: '1 1 250px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  borderTop: '3px solid var(--accent-primary)'
}

const stepNumberStyles: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'var(--accent-primary)',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  marginBottom: '20px'
}

const stepTitleStyles: React.CSSProperties = {
  fontSize: '1.3rem',
  marginBottom: '16px',
  fontWeight: 600,
  color: 'var(--text-primary)'
}

const stepArrowStyles: React.CSSProperties = {
  fontSize: '2rem',
  color: 'var(--border-color)',
  display: 'flex',
  padding: '0 10px',
  opacity: 0.5
}
