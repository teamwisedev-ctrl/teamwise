import React, { useState } from 'react';
import { RefreshCcw, BookOpen, Coins, Package, Lock, FolderOpen, XCircle, Sparkles, Rocket, CloudUpload } from 'lucide-react';

type SyncStatus = 'pending' | 'syncing' | 'success' | 'failed';

interface MarketSyncStepProps {
    sheetData: string[][];
    syncStatuses: { [rowIdx: number]: { status: SyncStatus, message: string } };
    handleReadProducts: () => Promise<void>;
    handleSyncProducts: (selectedMarkets: string[], cafe24CategoryNo?: number) => Promise<void>;
    handleFetchSmartStoreOrders: () => Promise<void>;
    marginRate: number;
    setMarginRate: React.Dispatch<React.SetStateAction<number>>;
    extraShippingCost: number;
    setExtraShippingCost: React.Dispatch<React.SetStateAction<number>>;
    masterSheetId: string;
    licenseTier: 'free' | 'pro';
    betaMarketsInfo: Record<string, { isBeta: boolean; daysLeft: number }>;
    credentials: { clientId: string, clientSecret: string };
    cafe24Credentials: { mallId: string, connected: boolean };
}

export const MarketSyncStep: React.FC<MarketSyncStepProps> = ({
    sheetData,
    syncStatuses,
    handleReadProducts,
    handleSyncProducts,
    marginRate,
    setMarginRate,
    extraShippingCost,
    setExtraShippingCost,
    licenseTier,
    betaMarketsInfo = {},
    credentials,
    cafe24Credentials
}) => {
    // Only Cafe24 is checked by default for free users
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['cafe24']);

    // Cafe24 Category State
    const [cafe24Categories, setCafe24Categories] = useState<{ category_no: number, category_name: string }[]>([]);
    const [selectedCafe24Category, setSelectedCafe24Category] = useState<number | null>(null);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null);
    const hasAttemptedFetch = React.useRef(false);

    React.useEffect(() => {
        if (selectedMarkets.includes('cafe24') && cafe24Credentials.connected && cafe24Credentials.mallId && !hasAttemptedFetch.current && cafe24Categories.length === 0) {
            hasAttemptedFetch.current = true;
            setIsLoadingCategories(true);
            setCategoryLoadError(null);

            let isTimeout = false;
            const timeoutId = setTimeout(() => {
                isTimeout = true;
                setIsLoadingCategories(false);
                setCategoryLoadError('불러오기 지원 지연 (시간 초과)');
            }, 8000);

            window.electron.ipcRenderer.invoke('get-cafe24-categories', { mallId: cafe24Credentials.mallId })
                .then(res => {
                    if (isTimeout) return;
                    if (res.success && res.categories) {
                        setCafe24Categories(res.categories);
                        if (res.categories.length > 0) {
                            setSelectedCafe24Category(res.categories[0].category_no);
                        }
                    } else {
                        setCategoryLoadError(res.error || '카테고리 정보를 가져오지 못했습니다.');
                    }
                })
                .catch(err => {
                    if (isTimeout) return;
                    setCategoryLoadError(err.message || '통신 오류');
                })
                .finally(() => {
                    if (isTimeout) return;
                    clearTimeout(timeoutId);
                    setIsLoadingCategories(false);
                });
        }
    }, [selectedMarkets, cafe24Credentials, cafe24Categories.length]);

    const handleCreateFallbackCategory = async () => {
        if (!cafe24Credentials.mallId) return;
        setIsLoadingCategories(true);
        const res = await window.electron.ipcRenderer.invoke('create-cafe24-category', { mallId: cafe24Credentials.mallId }, '[Moi 수집 상품]');
        if (res.success && res.category) {
            const newCat = { category_no: res.category.category_no, category_name: res.category.category_name };
            setCafe24Categories(prev => [newCat, ...prev]);
            setSelectedCafe24Category(newCat.category_no);
            alert('전용 수집 카테고리가 성공적으로 생성되었습니다!');
        } else {
            alert(`카테고리 생성 실패: ${res.error}`);
        }
        setIsLoadingCategories(false);
    };

    const targetMarkets = [
        { id: 'cafe24', label: '카페24 (Cafe24)', ready: true, requirePro: false },
        { id: 'smartstore', label: '네이버 스마트스토어', ready: true, requirePro: true },
        { id: 'coupang', label: '쿠팡', ready: false, requirePro: true },
        { id: '11st', label: '11번가', ready: false, requirePro: true, isBeta: true },
        { id: 'gmarket', label: 'G마켓', ready: false, requirePro: true },
        { id: 'haoreum', label: '해오름', ready: false, requirePro: true }
    ];

    const toggleMarket = (id: string, ready: boolean, requirePro: boolean) => {
        if (!ready) {
            alert('해당 마켓 연동은 준비 중입니다.');
            return;
        }

        const targetMarket = targetMarkets.find(m => m.id === id);
        const safeBetaInfo = betaMarketsInfo || {};
        const isBetaTarget = targetMarket?.isBeta || safeBetaInfo[id]?.isBeta;
        const isLocked = requirePro && licenseTier === 'free' && !isBetaTarget;

        if (isLocked) {
            alert('🔒 Pro 전용 기능\n\n해당 마켓으로 상품을 배포하려면 Pro 플랜으로 업그레이드가 필요합니다.');
            return;
        }
        setSelectedMarkets(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleInitiateSync = () => {
        if (sheetData.length === 0 || selectedMarkets.length === 0) {
            return;
        }

        // Check for Cafe24 credentials if Cafe24 is selected
        if (selectedMarkets.includes('cafe24') && !cafe24Credentials.mallId) {
            alert('카페24 쇼핑몰 아이디(Mall ID) 설정이 필요합니다.\n[환경 설정] 탭에서 우선 연동해주세요.');
            return;
        }

        // Check for Smartstore credentials if Smartstore is selected
        if (selectedMarkets.includes('smartstore') && (!credentials.clientId || !credentials.clientSecret)) {
            alert('스마트스토어 API 연동을 위한 Client ID와 Client Secret 설정이 필요합니다.\n[환경 설정] 탭에서 우선 연동해주세요.');
            return;
        }

        handleSyncProducts(selectedMarkets, selectedCafe24Category || undefined);
    };

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ marginBottom: '32px' }}>
                <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCcw size={20} color="#3b82f6" /> 상품 연동 허브</div>
                <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
                    구글 시트에서 미리 세팅된 데이터를 읽어오고 수익률을 지정한 후, 다중 마켓에 일괄 등록합니다.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button className="secondary" onClick={handleReadProducts} style={{ flexGrow: 1, padding: '14px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <BookOpen size={18} /> 1. 등록할 상품 시트에서 가져오기
                    </button>
                </div>
            </div>

            {sheetData.length > 0 && (
                <>
                    <div className="glass-panel" style={{ marginBottom: '32px' }}>
                        <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Coins size={20} color="#34d399" /> 2. 수익률 설정 및 데이터 검토</div>
                        <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
                            수집된 원가에 마진율과 고정 부대비용을 더해 마켓 최종 판매가를 결정합니다.
                        </p>

                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#e2e8f0' }}>마진율 (%)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={marginRate}
                                    onChange={(e) => setMarginRate(Number(e.target.value))}
                                    style={{ width: '100%', fontSize: '16px' }}
                                    min="0"
                                />
                            </div>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#e2e8f0' }}>추가 배송비 / 고정 마진 (₩)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={extraShippingCost}
                                    onChange={(e) => setExtraShippingCost(Number(e.target.value))}
                                    style={{ width: '100%', fontSize: '16px' }}
                                    min="0"
                                    step="100"
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>순번</th>
                                        <th>상품명</th>
                                        <th>카테고리ID</th>
                                        <th>판매가 (적용 전 ➔ 후)</th>
                                        <th>상태</th>
                                        <th>응답 / 메시지</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const hasHeader = sheetData.length > 0 && (sheetData[0][0] === '카테고리ID' || sheetData[0][1] === '상품명');
                                        const startIndex = hasHeader ? 1 : 0;
                                        const dataRows = hasHeader ? sheetData.slice(1) : sheetData;

                                        return dataRows.map((row, idx) => {
                                            const rowIdx = startIndex + idx;
                                            if (row.length < 6 || !row[0]) return null;
                                            const statusInfo = syncStatuses[rowIdx] || { status: 'pending', message: '연동 대기 중' };

                                            return (
                                                <tr key={rowIdx}>
                                                    <td style={{ whiteSpace: 'nowrap' }}>{idx + 1}번째 상품</td>
                                                    <td style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        {row[3] ? (
                                                            <img className="table-thumbnail" src={row[3]} alt="thumbnail" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        ) : (
                                                            <div className="table-thumbnail" style={{ borderStyle: 'dashed' }} />
                                                        )}
                                                        <div style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                                                            {row[1]}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '13px', fontFamily: 'monospace', padding: '4px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                                            {row[0]}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                                {parseInt(row[4] || '0').toLocaleString()} ₩
                                                            </span>
                                                            <span style={{ color: '#64748b' }}>➔</span>
                                                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#38bdf8' }}>
                                                                {(Math.floor((parseInt(row[4] || '0') * (1 + marginRate / 100) + extraShippingCost) / 10) * 10).toLocaleString()} ₩
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={`badge ${statusInfo.status}`}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                                                            {statusInfo.status}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: statusInfo.status === 'failed' ? '#f87171' : (statusInfo.status === 'success' ? '#34d399' : '#cbd5e1') }}>
                                                        {statusInfo.message}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Multi-Market Selector */}
                    <div className="glass-panel" style={{ marginBottom: '32px', textAlign: 'left', padding: '32px' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                            <Package size={24} color="#3b82f6" /> 3. 등록할 타겟 마켓 선택 (1:N 분배)
                        </h4>
                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
                            연동할 마켓을 선택하세요. 체크된 모든 마켓으로 상품 데이터가 배포됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {targetMarkets.map(market => {
                                const isLocked = market.requirePro && licenseTier === 'free';
                                const isBetaTarget = market.isBeta || betaMarketsInfo[market.id]?.isBeta;

                                return (
                                    <label key={market.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px',
                                        backgroundColor: isLocked ? '#f1f5f9' : (selectedMarkets.includes(market.id) ? '#eff6ff' : '#f8fafc'),
                                        border: isLocked ? '1px dashed #cbd5e1' : (selectedMarkets.includes(market.id) ? '2px solid #3b82f6' : '1px solid #e2e8f0'),
                                        borderRadius: '12px', cursor: (market.ready && !isLocked) ? 'pointer' : 'not-allowed',
                                        opacity: (!market.ready || isLocked) ? 0.6 : 1,
                                        fontWeight: selectedMarkets.includes(market.id) ? 600 : 500,
                                        color: isLocked ? '#94a3b8' : (selectedMarkets.includes(market.id) ? '#1e40af' : '#64748b'),
                                        transition: 'all 0.2s',
                                        boxShadow: selectedMarkets.includes(market.id) ? '0 4px 6px rgba(59, 130, 246, 0.1)' : 'none',
                                        position: 'relative'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMarkets.includes(market.id)}
                                            onChange={() => toggleMarket(market.id, market.ready, market.requirePro)}
                                            disabled={!market.ready || isLocked}
                                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: (market.ready && !isLocked) ? 'pointer' : 'not-allowed' }}
                                        />
                                        <span style={{ fontSize: '15px' }}>{market.label}</span>
                                        {isLocked && <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '4px', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Lock size={12} /> Pro</span>}
                                        {isBetaTarget && <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>BETA 무료</span>}
                                        {!market.ready && !isBetaTarget && !isLocked && <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>준비중</span>}
                                    </label>
                                )
                            })}
                        </div>

                        {/* Cafe24 Category Selection UI */}
                        {selectedMarkets.includes('cafe24') && cafe24Credentials.connected && (
                            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                                    <FolderOpen size={18} color="#f59e0b" /> 카페24 연동 시, 어떤 카테고리로 상품을 넣을까요?
                                </label>

                                {isLoadingCategories ? (
                                    <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        카테고리 정보를 불러오는 중...
                                    </div>
                                ) : categoryLoadError ? (
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ flex: '1', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <XCircle size={16} /> {categoryLoadError} (임시 보관함을 자동 생성하여 진행해주세요.)
                                        </div>
                                        <button
                                            className="secondary"
                                            onClick={handleCreateFallbackCategory}
                                            style={{ padding: '12px 16px', fontSize: '14px', whiteSpace: 'nowrap', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Sparkles size={16} /> [+ Moi 임시 수집함] 자동 생성
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        {cafe24Categories.length > 0 ? (
                                            <select
                                                className="input-field"
                                                value={selectedCafe24Category || ''}
                                                onChange={(e) => setSelectedCafe24Category(Number(e.target.value))}
                                                style={{ flex: '1', minWidth: '240px', maxWidth: '360px', padding: '12px', fontSize: '15px' }}
                                            >
                                                {cafe24Categories.map(cat => (
                                                    <option key={cat.category_no} value={cat.category_no}>
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div style={{ flex: '1', minWidth: '240px', padding: '12px 16px', backgroundColor: '#fff', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                                등록된 카테고리가 없습니다. (미분류로 전송됨)
                                            </div>
                                        )}

                                        <button
                                            className="secondary"
                                            onClick={handleCreateFallbackCategory}
                                            style={{ padding: '12px 16px', fontSize: '14px', whiteSpace: 'nowrap', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Sparkles size={16} /> [+ Moi 임시 수집함] 자동 생성
                                        </button>
                                    </div>
                                )}
                                <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                                    선택한 한 곳의 카테고리로 데이터가 일괄 전송됩니다. 카페24 전용 임시 보관함을 만들어두고 나중에 카페24 어드민에서 상세 분류하는 것을 권장합니다.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="glass-panel" style={{ marginBottom: '32px', textAlign: 'center', padding: '32px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Rocket size={40} color="#3b82f6" /></div>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '22px', color: '#1e293b', fontWeight: 700 }}>모든 준비가 완료되었습니다!</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>
                            위의 상품 목록과 최종 가격, 그리고 타겟 마켓({selectedMarkets.length}곳) 설정을 확인한 후 실행하세요.
                        </p>
                        <button className="primary" onClick={handleInitiateSync} disabled={sheetData.length === 0 || selectedMarkets.length === 0} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 600, opacity: (sheetData.length === 0 || selectedMarkets.length === 0) ? 0.5 : 1, cursor: (sheetData.length === 0 || selectedMarkets.length === 0) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CloudUpload size={20} /> 선택된 {selectedMarkets.length}개 마켓으로 일괄 배포 시작하기
                        </button>
                    </div>
                </>
            )
            }
        </div >
    );
};
