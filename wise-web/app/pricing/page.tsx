
import { Rocket, Package, Zap } from 'lucide-react';

export default async function PricingPage() {
    return (
        <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>
                    합리적인 <span className="gradient-text-accent">요금제</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '16px' }}>
                    평생 무료 플랜(Starter)으로 결제 등록 없이 지금 바로 시작해보세요.<br />업그레이드는 필요할 때 언제든 가능합니다.
                </p>
            </div>

            <div style={pricingGridStyles}>
                {/* Free Tier */}
                <div className="glass-panel animate-slide-up delay-100" style={pricingCardStyles}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Rocket size={24} /> Starter (Free)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '24px 0' }}>
                        ₩0 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 평생 무료</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        기본 채널 연동과 제한된 볼륨으로<br />충분히 경험해보세요.
                    </p>
                    <ul style={featureListStyles}>
                        <li>✔️ <b>카페24(자사몰) 단독 연동</b></li>
                        <li>✔️ 기본 소싱처 (도매토피아) 연동</li>
                        <li>✔️ 월 동기화 최대 500건 제한</li>
                    </ul>
                    <a href="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 'auto', padding: '16px', fontSize: '1.1rem', textDecoration: 'none' }}>
                        신청하기
                    </a>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        복잡한 절차 없이 구글 로그인
                    </div>
                </div>

                {/* Open Market Add-on */}
                <div className="glass-panel animate-slide-up delay-200" style={pricingCardStyles}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Package size={24} /> 오픈마켓 연동(Pro)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '24px 0' }}>
                        ₩30,000 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 월</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', wordBreak: 'break-word' }}>
                        네이버, 쿠팡 등 국내 주요 오픈마켓<br />상품 전송 모듈 추가 제공
                    </p>
                    <ul style={featureListStyles}>
                        <li>✔️ 오픈마켓 카테고리 자동 매핑</li>
                        <li>✔️ 각 마켓별 필수 옵션 자동 변환</li>
                        <li>✔️ 플랫폼별 배송/출고지 템플릿 연동</li>
                        <li>✔️ 마켓별 무제한 스토어 계정 연결</li>
                    </ul>
                    <button disabled className="btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 'auto', opacity: 0.5, cursor: 'not-allowed' }}>
                        출시 준비 중
                    </button>
                </div>

                {/* Super Seller Unlimited */}
                <div className="glass-panel animate-slide-up delay-300" style={pricingCardStyles}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Zap size={24} color="#eab308" /> 슈퍼셀러 무제한팩</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '24px 0' }}>
                        ₩50,000 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 월</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        월 500건 제한을 전면 해제하고<br />초고속 다중 스레드 업로드 제공
                    </p>
                    <ul style={featureListStyles}>
                        <li>✔️ 월 상품 동기화 <b>무제한 해제</b></li>
                        <li>✔️ 다중 스레드 속도 부스트 제공</li>
                        <li>✔️ 대량 엑셀 다운로드 최적화</li>
                        <li>✔️ 1:1 VIP 기술 지원</li>
                    </ul>
                    <button disabled className="btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 'auto', opacity: 0.5, cursor: 'not-allowed' }}>
                        출시 준비 중
                    </button>
                </div>
            </div>
        </div>
    );
}

const pricingGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
    gap: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    alignItems: 'stretch',
};

const pricingCardStyles: React.CSSProperties = {
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    position: 'relative',
    minHeight: '500px',
};



const featureListStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 40px 0',
    textAlign: 'left',
    lineHeight: 2,
};
