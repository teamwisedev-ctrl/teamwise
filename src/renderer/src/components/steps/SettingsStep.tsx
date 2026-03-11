import React from 'react';
import { Link, CheckCircle2, FolderOpen, Settings } from 'lucide-react';

interface SettingsStepProps {
    credentials: { clientId: string, clientSecret: string };
    setCredentials: React.Dispatch<React.SetStateAction<{ clientId: string, clientSecret: string }>>;
    cafe24Credentials: { mallId: string, connected: boolean };
    setCafe24Credentials: React.Dispatch<React.SetStateAction<{ mallId: string, connected: boolean }>>;
    addLog: (msg: string) => void;
    categoryMasterSheetId: string | null;
    handleOpenCategorySheet: () => Promise<void>;
    licenseTier: 'free' | 'pro';
}

export const SettingsStep: React.FC<SettingsStepProps> = ({
    credentials,
    setCredentials,
    cafe24Credentials,
    setCafe24Credentials,
    addLog,
    categoryMasterSheetId,
    handleOpenCategorySheet,
    licenseTier
}) => {
    const [isCafe24Authenticating, setIsCafe24Authenticating] = React.useState(false);

    const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => {
            const newCreds = { ...prev, [name]: value };
            localStorage.setItem(name === 'clientId' ? 'naverClientId' : 'naverClientSecret', value);
            return newCreds;
        });
    };

    const handleCafe24CredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCafe24Credentials(prev => {
            const newCreds = { ...prev, [name]: value };
            if (name === 'mallId') localStorage.setItem('cafe24MallId', value);
            return newCreds;
        });
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Category Master DB Integration */}
            <div className="glass-panel" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Link size={14} /></div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>카테고리 매핑 마스터 (구글 시트)</h3>
                </div>

                <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
                    앱 구동 및 로그인 시 자동으로 사용자 구글 드라이브에 시트가 생성되며, 상품 대량 연동 시 <strong>카테고리 매핑 인메모리 캐시</strong>로 활용됩니다.
                </p>

                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {categoryMasterSheetId ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '24px', display: 'flex' }}><CheckCircle2 size={24} color="#10b981" /></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#e2e8f0', marginBottom: '4px' }}>마스터 시트 연동 완료</div>
                                    <div style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>ID: {categoryMasterSheetId}</div>
                                </div>
                            </div>
                            <button className="primary" onClick={handleOpenCategorySheet} style={{ padding: '10px 20px', fontSize: '14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FolderOpen size={16} /> 시트 매핑 설정
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: '16px', color: '#94a3b8', fontSize: '14px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                            구글 로그인 후 자동으로 연동됩니다. (상태: 미연결)
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '32px' }}>
                <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} color="#3b82f6" /> 다중 마켓 플랫폼 인증 설정</div>
                <p style={{ color: '#cbd5e1', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>
                    상품과 주문을 연동할 외부 쇼핑몰 플랫폼의 접근 권한(API Key)을 연동합니다. 한 번 저장된 정보는 안전하게 브라우저 로컬 환경에 보관됩니다.
                </p>

                {/* Cafe24 SaaS Integration */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>C</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>카페24 (Cafe24) 원클릭 연동</h3>
                    </div>

                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                            복잡한 키 발급 없이 쇼핑몰 ID만 입력하고 <strong>[연동하기]</strong> 버튼을 누르면 즉시 관리 권한이 부여됩니다.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>쇼핑몰 ID (Mall ID)</label>
                                <input
                                    type="text"
                                    name="mallId"
                                    value={cafe24Credentials.mallId}
                                    onChange={handleCafe24CredentialsChange}
                                    placeholder="ex) mymall24 (카페24 관리자 로그인 시 사용하는 아이디)"
                                    style={{ width: '100%' }}
                                    disabled={cafe24Credentials.connected}
                                />
                            </div>
                        </div>

                        <button
                            className={cafe24Credentials.connected ? "success" : "secondary"}
                            style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', opacity: isCafe24Authenticating ? 0.7 : 1 }}
                            disabled={isCafe24Authenticating}
                            onClick={async () => {
                                if (isCafe24Authenticating) return;
                                if (!cafe24Credentials.mallId) {
                                    alert('먼저 카페24 쇼핑몰 아이디를 기입해주세요.');
                                    return;
                                }

                                setIsCafe24Authenticating(true);
                                // --- Mall ID Validation (Domain Check) ---
                                try {
                                    // Use no-cors to prevent CORS issues. We only care if the domain resolves.
                                    // If DNS resolves (even if it 404s/403s), fetch succeeds. If NXDOMAIN, fetch throws a TypeError.
                                    await fetch(`https://${cafe24Credentials.mallId}.cafe24api.com/`, { mode: 'no-cors' });
                                } catch {
                                    alert('❌ 연결할 수 없는 쇼핑몰 아이디입니다.\n\n카페24 관리자 센터 로그인에 사용하는 실제 아이디가 맞는지 오타를 다시 한 번 확인해주세요.\n(예: teamwise, dometopia 등 영문 형태)');
                                    setIsCafe24Authenticating(false);
                                    return;
                                }
                                // -----------------------------------------

                                const clientId = 'hxHOk08wCdCv4QSzDL0JpA';
                                const redirectUri = 'https://mo2.kr/api/market/cafe24/callback';
                                const authUrl = `https://${cafe24Credentials.mallId}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${clientId}&state=${cafe24Credentials.mallId}&redirect_uri=${redirectUri}&scope=mall.read_product,mall.write_product,mall.read_category,mall.write_category,mall.read_order`;

                                addLog(`카페24(${cafe24Credentials.mallId}) 연동 브라우저 창을 띄웁니다. 새 창에서 권한 동의를 완료해 주세요.`);
                                
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (window as any).electron.ipcRenderer.invoke('open-cafe24-auth-window', authUrl);

                                let attempts = 0;
                                const pollInterval = setInterval(async () => {
                                    attempts++;
                                    try {
                                        const res = await fetch(`https://teamwise-sand.vercel.app/api/market/cafe24/token`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ mallId: cafe24Credentials.mallId })
                                        });
                                        const data = await res.json();
                                        if (data && data.access_token) {
                                            setCafe24Credentials(prev => ({ ...prev, connected: true }));
                                            clearInterval(pollInterval);
                                            setIsCafe24Authenticating(false);
                                            addLog(`✅ 카페24(${cafe24Credentials.mallId}) 권한 연동 성공! 웹훅 및 API가 정상적으로 연결되었습니다.`);
                                        }
                                    } catch {
                                        // Ignore
                                    }

                                    if (attempts > 120) {
                                        clearInterval(pollInterval);
                                        setIsCafe24Authenticating(false);
                                        addLog(`❌ 카페24 인증 시간이 초과되었습니다. 창이 닫혔거나 통신 오류가 발생했습니다.`);
                                    }
                                }, 1500);
                            }}
                        >
                            {isCafe24Authenticating ? (
                                <><span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span> 카페24 연동 진행 중...</>
                            ) : cafe24Credentials.connected ? (
                                "✅ 카페24 실시간 연동 완료 (클릭하여 권한 재갱신)"
                            ) : (
                                "🔗 1초만에 쇼핑몰 연동하기 (SaaS Auth)"
                            )}
                        </button>
                    </div>
                </div>

                {/* Naver Smartstore Settings (Pro Only) */}
                {licenseTier !== 'free' && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#03C75A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>N</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>네이버 스마트스토어 API 인증</h3>
                        </div>

                        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>커머스 API 센터에서 발급받은 '애플리케이션 ID'와 '시크릿'을 입력하세요.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>Client ID (애플리케이션 ID)</label>
                                    <input
                                        type="text"
                                        name="clientId"
                                        value={credentials.clientId}
                                        onChange={handleCredentialsChange}
                                        placeholder="ex) 4aTjpvduCQkMgmJ..."
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>Client Secret</label>
                                    <input
                                        type="password"
                                        name="clientSecret"
                                        value={credentials.clientSecret}
                                        onChange={handleCredentialsChange}
                                        placeholder="ex) $2a$04$UNqs..."
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
