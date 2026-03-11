import React from 'react';
import { Download, Link as LinkIcon, Play, Settings } from 'lucide-react';

export default function GuidePage() {
    return (
        <div className="container animate-fade-in" style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>
                    초보자도 쉬운 <span className="gradient-text-accent">Mo2 사용 가이드</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    단 4단계 베이직 설정으로, 내 쇼핑몰에 수만 개의 상품을 자동으로 채워보세요. 
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Step 1 */}
                <div className="glass-panel animate-slide-up delay-100" style={stepCardStyles}>
                    <div style={iconWrapperStyles}><Download size={28} strokeWidth={2.5} /></div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>1단계: 회원가입 및 전용 앱 다운로드</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px', wordBreak: 'keep-all' }}>
                            Mo2 웹사이트에서 무료 플랜(Starter)으로 회원가입을 완료한 뒤, <a href="/download" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Windows 전용 데스크톱 앱</a>을 다운로드하여 설치합니다. 설치 후 앱을 실행하고 웹에서 가입한 계정으로 로그인합니다.
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="glass-panel animate-slide-up delay-200" style={stepCardStyles}>
                    <div style={iconWrapperStyles}><Settings size={28} strokeWidth={2.5} /></div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>2단계: 소싱처(도매토피아) 연동</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px', wordBreak: 'keep-all' }}>
                            앱 내 <strong>[도매처 관리]</strong> 메뉴로 이동하여 도매토피아 발급 API 키(Client ID / Secret)를 입력합니다. 검증 버튼을 눌러 상태가 <span style={{ color: '#10B981', fontWeight: 'bold' }}>Active</span>로 변경되면 도매처 상품을 성공적으로 불러올 준비가 완료된 것입니다.
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="glass-panel animate-slide-up delay-300" style={stepCardStyles}>
                    <div style={iconWrapperStyles}><LinkIcon size={28} strokeWidth={2.5} /></div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>3단계: 내 쇼핑몰(카페24) 계정 연결</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px', wordBreak: 'keep-all' }}>
                            앱 내 <strong>[내 마켓 관리]</strong> 메뉴에서 카페24를 선택합니다. 카페24 아이디를 입력하고 연동하기 버튼을 누르면 브라우저 창이 열리며, 카페24 로그인 후 접근 권한을 허용하면 단 3초 만에 원클릭 OAuth 연동이 완료됩니다.
                        </p>
                        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            <strong>💡 팁:</strong> 무료 플랜은 1개의 쇼핑몰 계정만 연결 가능하며, 유료 플랜을 이용하시면 여러 개의 스토어를 무제한으로 연동할 수 있습니다.
                        </div>
                    </div>
                </div>

                {/* Step 4 */}
                <div className="glass-panel animate-slide-up delay-400" style={stepCardStyles}>
                    <div style={iconWrapperStyles}><Play size={28} fill="currentColor" strokeWidth={2.5} /></div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>4단계: 조건 설정 및 동기화 시작</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, wordBreak: 'keep-all' }}>
                            <strong>[상품 관리]</strong> 메뉴에서 원하는 마진율(예: 1.3 = 30% 마진)과 전송할 카테고리를 설정한 후 <strong>&apos;동기화 시작&apos;</strong> 버튼을 클릭합니다. 앱이 켜져 있는 동안 시스템이 자동으로 상품 이미지, 옵션, 상세페이지를 내 쇼핑몰 형식에 맞게 변환하여 업로드를 진행합니다!
                        </p>
                    </div>
                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <a href="/login" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>
                    지금 바로 Mo2 시작하기
                </a>
            </div>
        </div>
    );
}

const stepCardStyles: React.CSSProperties = {
    padding: '40px',
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
};

const iconWrapperStyles: React.CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)'
};
