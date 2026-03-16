import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '설치 파일 다운로드 | Mo2 Windows 전용 앱',
  description: '최신 버전의 Mo2 데스크톱 자동화 앱을 다운로드하고, 클릭 한 번으로 상품 연동을 시작하세요. (Windows 10/11 지원)',
  alternates: {
    canonical: '/download'
  }
}

export default async function DownloadPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check subscription status
  // const { data: subData } = await supabase
  //   .from('subscriptions')
  //   .select('*')
  //   .eq('user_id', user.id)
  //   .order('created_at', { ascending: false })
  //   .limit(1)
  //   .single()

  // const hasActiveSub =
  //   subData &&
  //   (subData.status === 'active' ||
  //     subData.status === 'trialing' ||
  //     subData.status === 'trial' ||
  //     subData.plan_id?.includes('trial') ||
  //     subData.plan_id === 'free')

  // if (!hasActiveSub) {
  //   return (
  //     <div
  //       className="container"
  //       style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center' }}
  //     >
  //       <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>
  //         라이선스가 <span style={{ color: 'var(--accent-secondary)' }}>필요합니다</span>
  //       </h1>
  //       <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px' }}>
  //         <strong>{user.email}</strong>님, 데스크톱 앱을 다운로드하려면 활성화된 라이선스가
  //         필요합니다.
  //         <br />
  //         아래 버튼을 눌러 요금제를 확인해 주세요.
  //       </p>
  //       <a
  //         href="/pricing"
  //         className="btn-primary"
  //         style={{ padding: '16px 32px', fontSize: '1.1rem', textDecoration: 'none' }}
  //       >
  //         🛒 요금제 보러가기
  //       </a>
  //     </div>
  //   )
  // }

  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
          Mo2 솔루션 <span className="gradient-text-accent">다운로드</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          <strong>{user.email}</strong>님의 라이선스는 현재{' '}
          <strong style={{ color: 'var(--accent-success)' }}>활성(Active)</strong> 상태입니다.
          <br />
          아래 링크에서 최신 버전의 앱을 다운로드할 수 있습니다.
        </p>
      </div>

      <div style={downloadGridStyles}>
        {/* Windows Download */}
        <div className="glass-panel" style={downloadCardStyles}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🪟</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Windows 용</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Windows 10, 11 (64-bit)
            <br />
            버전 3.5.0
          </p>
          <a
            href="https://github.com/teamwisedev-ctrl/teamwise/releases/latest/download/Mo2-Official-3.5.0-setup.exe"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1rem',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Mo2-Official-3.5.0-setup.exe 다운로드 (135MB)
          </a>
        </div>

        {/* Mac Download (Hidden for now) */}
        {/*
                <div className="glass-panel" style={downloadCardStyles}>
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🍎</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>macOS 용</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        macOS 12.0 이상 (Apple Silicon / Intel)<br />버전 1.0.0
                    </p>
                    <button className="btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        출시 준비 중
                    </button>
                </div>
                */}
      </div>

      <div
        className="glass-panel"
        style={{ marginTop: '60px', padding: '24px', maxWidth: '800px', margin: '60px auto 0' }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--accent-primary)' }}>
          🚨 윈도우 설치 시 &quot;PC 보호&quot; 파란 화면이 뜨나요?
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          안녕하세요, <strong>Team Mo2</strong>입니다.<br/>
          Mo2 설치 시 간혹 나타나는 파란색 <strong>&quot;Windows 사용자 보호&quot;</strong> 화면은 프로그램 오류나 바이러스가 아니며, 아직 다운로드 수가 충분히 누적되지 않은 신규 소프트웨어에 대해 Windows가 기본적으로 띄우는 정상적인 보안 알림입니다.
        </p>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>💡 10초 해결 방법:</strong>
          <ol style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            <li>파란 화면 좌측 중간의 <u><strong>[추가 정보(More info)]</strong></u> 글자를 클릭합니다.</li>
            <li>우측 하단에 나타나는 <strong>[실행(Run anyway)]</strong> 버튼을 클릭하면 정상 설치됩니다.</li>
          </ol>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', marginTop: '32px', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💊 알약(ALYac) &quot;랜섬웨어 차단&quot; 알림이 뜨나요?
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          보안 프로그램인 <strong>알약(ALYac)</strong>을 사용하시는 경우, 설치 파일을 <strong>&quot;랜섬웨어 의심 행위&quot;</strong>로 오진하여 차단할 수 있습니다.<br/>
          이는 국내 스타트업이나 개인 개발자의 신규 프로그램 설치 시 매우 흔하게 발생하는 <strong style={{ color: 'var(--text-primary)' }}>단순 오탐지(False Positive)</strong> 현상이므로 안심하셔도 됩니다.
        </p>
        <div style={{ background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-warning)' }}>💡 알약 오진 해결 방법:</strong>
          <ol style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            <li>알약 랜섬웨어 차단 알림창 하단의 <u><strong>[의심 파일 차단 제외 하기]</strong></u> 체크박스에 체크합니다.</li>
            <li>하단의 <strong>[예(Y)]</strong> 버튼을 클릭하여 차단을 해제하고 설치를 계속 진행합니다.</li>
          </ol>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', marginTop: '40px' }}>기본 설치 안내</h3>
        <ol style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>다운로드한 파일을 더블 클릭하여 설치를 진행합니다.</li>
          <li>
            Mac의 경우 시스템 설정에서 &apos;확인되지 않은 개발자의 앱 열기&apos;를 허용해야 할 수
            있습니다.
          </li>
          <li>바탕화면에 생성된 Mo2 아이콘을 실행합니다.</li>
          <li>
            웹사이트에서 가입하신 <strong>Google 계정</strong>으로 앱 내에서 로그인하면 즉시 사용
            가능합니다.
          </li>
        </ol>
      </div>
    </div>
  )
}

const downloadGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
  gap: '32px',
  maxWidth: '800px',
  margin: '0 auto'
}

const downloadCardStyles: React.CSSProperties = {
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
}
