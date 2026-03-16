'use client'

import React, { useState } from 'react'
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react'

// Market Fee Presets (Approximate for 2026 standard)
const MARKET_FEES = {
  smartstore: { name: '네이버 스마트스토어', feeRatio: 0.058, icon: '🟢' }, // ~5.8% max
  cafe24: { name: '카페24 자사몰 (PG)', feeRatio: 0.035, icon: '⚫️' }, // ~3.5% avg
  coupang: { name: '쿠팡 (로켓/마켓)', feeRatio: 0.108, icon: '🚀' }, // ~10.8% avg
  eleven11: { name: '11번가', feeRatio: 0.13, icon: '🔴' } // ~13% avg
}

export default function MarginCalculatorClient() {
  const [costPrice, setCostPrice] = useState<number>(10000)
  const [shippingCost, setShippingCost] = useState<number>(3000)
  const [sellingPrice, setSellingPrice] = useState<number>(15000)
  const [chargeShipping, setChargeShipping] = useState<number>(3000)
  const [selectedMarket, setSelectedMarket] = useState<keyof typeof MARKET_FEES>('smartstore')
  
  // Derived state (no useEffect needed)
  const totalRev = sellingPrice + chargeShipping
  const totalCost = costPrice + shippingCost
  const fee = totalRev * MARKET_FEES[selectedMarket].feeRatio
  const preTaxProfit = totalRev - totalCost - fee
  const vatAmount = preTaxProfit > 0 ? preTaxProfit * 0.1 : 0
  const pureMargin = preTaxProfit - vatAmount
  const marginPct = totalRev > 0 ? (pureMargin / totalRev) * 100 : 0

  const marginRatio = Number(marginPct.toFixed(1))
  const totalFee = Math.round(fee)
  const finalVatAmount = Math.round(vatAmount)
  const finalPureMargin = Math.round(pureMargin)

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Calculator size={40} className="text-accent-primary" color="#3b82f6" />
          오픈마켓 <span className="gradient-text-accent">마진 계산기</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          도매처 원가만 보고 팔았다가 역마진 나지 않도록, 수수료와 세금을 미리 시뮬레이션 하세요.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Input Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
            비용 및 판매가 입력
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyles}>어디서 판매하시나요?</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(Object.keys(MARKET_FEES) as Array<keyof typeof MARKET_FEES>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedMarket(key)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedMarket === key ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: selectedMarket === key ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: selectedMarket === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    flex: '1 1 45%'
                  }}
                >
                  {MARKET_FEES[key].icon} {MARKET_FEES[key].name}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              * 평균 수수료율({(MARKET_FEES[selectedMarket].feeRatio * 100).toFixed(1)}%)로 계산됩니다.
            </div>
          </div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>매입 원가 (도매가)</label>
            <input 
              type="number" 
              value={costPrice} 
              onChange={(e) => setCostPrice(Number(e.target.value))}
              style={inputStyles}
            />
          </div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>실제 발생 배송비 (내가 도매처/택배사에 내는 돈)</label>
            <input 
              type="number" 
              value={shippingCost} 
              onChange={(e) => setShippingCost(Number(e.target.value))}
              style={inputStyles}
            />
          </div>

          <div style={{ margin: '32px 0', borderTop: '1px dashed var(--border-color)' }}></div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>고객 판매가 (내가 팔 가격)</label>
            <input 
              type="number" 
              value={sellingPrice} 
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              style={{ ...inputStyles, border: '2px solid var(--accent-success)', background: 'rgba(16, 185, 129, 0.05)' }}
            />
          </div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>고객 청구 배송비 (고객이 내는 돈)</label>
            <input 
              type="number" 
              value={chargeShipping} 
              onChange={(e) => setChargeShipping(Number(e.target.value))}
              style={inputStyles}
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>* 무료배송은 0원으로 입력하세요.</div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px', background: finalPureMargin > 0 ? 'rgba(59, 130, 246, 0.03)' : 'rgba(239, 68, 68, 0.03)', border: finalPureMargin > 0 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>최종 예상 순수익</h3>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: finalPureMargin > 0 ? '#2563EB' : '#EF4444', letterSpacing: '-1px', marginBottom: '8px' }}>
              {finalPureMargin > 0 ? '+' : ''}{formatCurrency(finalPureMargin)}<span style={{ fontSize: '1.5rem', fontWeight: 600 }}>원</span>
            </div>
            
            <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '8px', background: finalPureMargin > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: finalPureMargin > 0 ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: '1.1rem' }}>
              수익률: {marginRatio}%
            </div>

            <div style={{ marginTop: '32px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={breakdownRowStyles}>
                <span style={{ color: 'var(--text-secondary)' }}>총 매출 (상품가+오픈마켓배송비)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(totalRev)}원</span>
              </div>
              <div style={breakdownRowStyles}>
                <span style={{ color: 'var(--text-secondary)' }}>총 지출 (매입가+실배송비)</span>
                <span style={{ fontWeight: 600, color: '#EF4444' }}>-{formatCurrency(totalCost)}원</span>
              </div>
              <div style={breakdownRowStyles}>
                <span style={{ color: 'var(--text-secondary)' }}>{MARKET_FEES[selectedMarket].name} 수수료</span>
                <span style={{ fontWeight: 600, color: '#EF4444' }}>-{formatCurrency(totalFee)}원</span>
              </div>
              <div style={{ ...breakdownRowStyles, borderBottom: 'none', marginBottom: 0 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>부가세 버퍼 (약 10%)</span>
                <span style={{ fontWeight: 600, color: '#EF4444' }}>-{formatCurrency(finalVatAmount)}원</span>
              </div>
            </div>
          </div>

          {/* CTA Ad Banner */}
          <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={24} color="#3b82f6" />
              마진 계산, 수만 개 상품엔 언제 다 하죠?
            </h3>

            <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: '#3b82f6', color: 'white', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '1.1rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Mo2 평생 무료로 시작하기 <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyles: React.CSSProperties = {
  display: 'block',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '8px'
}

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '1.1rem',
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
}

const inputGroupStyles: React.CSSProperties = {
  marginBottom: '20px'
}

const breakdownRowStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: '12px',
  marginBottom: '12px',
  borderBottom: '1px solid var(--border-color)',
  fontSize: '0.95rem'
}
