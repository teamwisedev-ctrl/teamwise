import { useState } from 'react';
import './index.css';

declare global {
  interface Window {
    require: any;
  }
}

const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

function App() {
  const [log, setLog] = useState<string[]>([]);
  const [sheetId, setSheetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString('ko-KR', { hour12: false })}] ${msg}`, ...prev]);
  };

  const handleAuth = async () => {
    if (!ipcRenderer) return addLog('❌ ipcRenderer not found (Web mode 에서는 사용 불가능합니다)');
    addLog('구글 계정 인증 창을 엽니다 (OAuth)...');
    try {
      const res = await ipcRenderer.invoke('google-auth');
      if (res.success) {
        addLog('✅ 인증 성공! 안전하게 권한을 획득했습니다.');
      } else {
        addLog(`❌ 인증 실패: ${res.error}`);
      }
    } catch (err: any) {
      addLog(`❌ 오류 발생: ${err.message}`);
    }
  };

  const handleCreateSheet = async () => {
    if (!ipcRenderer) return;
    addLog('마스터 구글 시트를 생성 요청 중입니다...');
    try {
      const res = await ipcRenderer.invoke('create-sheet', 'Mo2 Market Master Data');
      if (res.success) {
        addLog(`✅ 구글 드라이브에 시트 생성 완료 (ID: ${res.spreadsheetId})`);
        setSheetId(res.spreadsheetId);
      } else {
        addLog(`❌ 시트 생성 실패: ${res.error}`);
      }
    } catch (err: any) {
      addLog(`❌ 오류 발생: ${err.message}`);
    }
  };

  const handleWriteData = async () => {
    if (!ipcRenderer) return;
    if (!sheetId) return addLog('⚠️ 먼저 마스터 시트를 생성하거나 연동해 주세요.');
    addLog('테스트 마스터 데이터를 동기화 중입니다...');

    const values = [
      ['업데이트 시간', '상품 코드', '상품명', '판매가', '동기화 상태'],
      [new Date().toLocaleString('ko-KR'), 'M-A1001', '테스트 상품 A (네이버 전송용)', '15,000', 'Success'],
      [new Date().toLocaleString('ko-KR'), 'C-B2005', '테스트 상품 B (카페24 전송용)', '25,000', 'Pending']
    ];

    try {
      const res = await ipcRenderer.invoke('write-sheet', sheetId, 'Sheet1!A1:E3', values);
      if (res.success) {
        addLog('✅ 구글 시트 동기화 테스트 완료! 시트를 열어보세요.');
      } else {
        addLog(`❌ 동기화 실패: ${res.error}`);
      }
    } catch (err: any) {
      addLog(`❌ 오류 발생: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '260px', background: '#ffffff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Lucide Layers SVG mimicking the website's brand icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#mo2-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <linearGradient id="mo2-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#3b82f6" offset="0%" />
              <stop stopColor="#0ea5e9" offset="100%" />
            </linearGradient>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="gradient-text-accent" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Mo2</span>
        </div>
        
        <div style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div 
            onClick={() => setActiveTab('dashboard')}
            style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'dashboard' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            📊 대시보드
          </div>
          <div 
            onClick={() => setActiveTab('markets')}
            style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'markets' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'markets' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'markets' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            🛒 내 마켓 관리
          </div>
          <div 
            onClick={() => setActiveTab('sync')}
            style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'sync' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'sync' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'sync' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            🔄 상품 동기화
          </div>
          <div 
            onClick={() => setActiveTab('settings')}
            style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'settings' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'settings' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            ⚙️ 설정
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Mo2 Desktop Client v3.0.0<br/>
          <span style={{ color: 'var(--accent-success)', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>● Active License</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <header className="animate-fade-in" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-primary)' }}>환영합니다, </span>
            <span className="gradient-text-accent">Mo2 셀러님 👋</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            복잡한 파일 다운로드 없이 클릭만으로 카탈로그를 동기화하세요.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Card 1 */}
          <div className="glass-panel animate-slide-up" style={{ padding: '24px', background: '#fff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>1️⃣</span> 권한 인증
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px', wordBreak: 'keep-all', lineHeight: 1.6 }}>
              마스터 파이프라인(구글 시트)에 접근하여 상품을 기록하기 위해 안전하게 구글 계정을 연결합니다.
            </p>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={handleAuth}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Google 로그인 설정
            </button>
          </div>

          {/* Card 2 */}
          <div className="glass-panel animate-slide-up" style={{ padding: '24px', background: '#fff', animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>2️⃣</span> 마스터 데이터 생성
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px', wordBreak: 'keep-all', lineHeight: 1.6 }}>
              모든 마켓으로 배포될 기준이 되는 전용 스프레드시트를 클라우드에 즉시 생성합니다.
            </p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleCreateSheet}>
              ➕ 마스터 엑셀 자동 생성
            </button>
          </div>

          {/* Card 3 */}
          <div className="glass-panel animate-slide-up" style={{ padding: '24px', background: '#fff', animationDelay: '0.2s' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>3️⃣</span> 동기화 테스트 
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px', wordBreak: 'keep-all', lineHeight: 1.6 }}>
              수집된 상품 데이터를 시트에 전송하고 각 마켓과 연결되는 파이프라인을 테스트합니다.
            </p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleWriteData}>
              🚀 테스트 데이터 전송
            </button>
          </div>
        </div>

        {/* Console / Log Terminal */}
        <div className="glass-panel animate-slide-up" style={{ background: '#0f172a', color: '#f8fafc', padding: '24px', borderRadius: '16px', animationDelay: '0.3s', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
              SYSTEM TERMINAL
            </div>
          </div>
          
          <div style={{ height: '320px', overflowY: 'auto', fontFamily: '"Fira Code", "Consolas", monospace', fontSize: '0.9rem', display: 'flex', flexDirection: 'column-reverse', paddingRight: '8px' }}>
            {log.length === 0 ? (
              <div style={{ color: '#475569', textAlign: 'center', marginTop: '120px', letterSpacing: '0.5px' }}>
                대기 중... 작업을 시작해 주세요.
              </div>
            ) : (
              log.map((l, i) => {
                const isError = l.includes('❌');
                const isSuccess = l.includes('✅');
                return (
                  <div key={i} className="animate-fade-in" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: isError ? '#ef4444' : isSuccess ? '#10b981' : '#e2e8f0' }}>
                    <span style={{ color: '#3b82f6', marginRight: '6px' }}>{'>'}</span> {l}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
