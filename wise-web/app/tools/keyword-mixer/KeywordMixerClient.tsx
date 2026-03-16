'use client'

import React, { useState } from 'react'
import { Wand2, Copy, Check, ArrowRight, TrendingUp, Sparkles, Loader2 } from 'lucide-react'

export default function KeywordMixerClient() {
  const [keywordGroup1, setKeywordGroup1] = useState('가성비, 고급, 예쁜')
  const [keywordGroup2, setKeywordGroup2] = useState('삼성, 애플, LG')
  const [keywordGroup3, setKeywordGroup3] = useState('스마트폰, 태블릿, 워치')
  const [keywordGroup4, setKeywordGroup4] = useState('케이스, 필름')
  
  const [copied, setCopied] = useState(false)
  
  // AI Magic State
  const [magicKeyword, setMagicKeyword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleMagicGeneration = async () => {
    if (!magicKeyword.trim()) return
    
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/tools/keywords?q=${encodeURIComponent(magicKeyword.trim())}`)
      if (!res.ok) throw new Error('API fetch failed')
      
      const data = await res.json()
      
      // Map properties back to our state groups
      // Group 1: Modifiers
      if (data.modifiers && data.modifiers.length > 0) {
        setKeywordGroup1(data.modifiers.join(', '))
      }
      
      // Group 2: Brands
      if (data.brands && data.brands.length > 0) {
        setKeywordGroup2(data.brands.join(', '))
      }
      
      // Group 3: Original Base Keyword
      setKeywordGroup3(data.original)
      
      // Group 4: Subs
      if (data.subs && data.subs.length > 0) {
        setKeywordGroup4(data.subs.join(', '))
      }
      
    } catch (error) {
      console.error('Magic Generation Error:', error)
      alert('자동 조합 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Compute results synchronously on render based on state
  const parse = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean)
  const arrays = [parse(keywordGroup1), parse(keywordGroup2), parse(keywordGroup3), parse(keywordGroup4)]
    .filter(arr => arr.length > 0)

  let results: string[] = []
  if (arrays.length > 0) {
    const cartesian = (a: string[][], b: string[]): string[][] => {
      return a.flatMap(d => b.map(e => [...d, e]))
    }
    let combinations: string[][] = arrays[0].map(x => [x])
    for (let i = 1; i < arrays.length; i++) {
        combinations = cartesian(combinations, arrays[i])
    }
    results = combinations.map(words => words.join(' '))
  }

  const handleCopy = () => {
    if (results.length === 0) return
    const textToCopy = results.join('\n')
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Wand2 size={40} className="text-accent-primary" color="#3b82f6" />
          쇼핑몰 <span className="gradient-text-accent">상품명(키워드) 조합기</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          엑셀 없이 수식어, 브랜드, 카테고리를 쉼표(,)로 묶어서 수십 개의 키워드를 단숨에 생성하세요.
        </p>
      </div>

      {/* Magic Keyword Form */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
          <Sparkles size={20} fill="currentColor" />
          AI 연관 키워드 자동 채우기
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px' }}>
          단어를 일일이 생각하기 힘들다면 코어 키워드(예: <strong style={{color: 'var(--text-primary)'}}>캠핑 의자</strong>)만 넣고 버튼을 눌러보세요. 
          네이버 쇼핑 트렌드에 기반한 수식어와 연관검색어를 빈칸에 자동으로 꽉 채워드립니다.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            value={magicKeyword}
            onChange={(e) => setMagicKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMagicGeneration()}
            placeholder="핵심 단어를 입력하세요 (예: 노트북 파우치)"
            disabled={isGenerating}
            style={{ ...inputStyles, flex: '1 1 200px', border: '2px solid rgba(59, 130, 246, 0.3)', background: 'white' }}
          />
          <button
            onClick={handleMagicGeneration}
            disabled={isGenerating || !magicKeyword.trim()}
            className="btn-primary"
            style={{ padding: '0 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? <><Loader2 size={18} className="animate-spin" /> 트렌드 분석 중...</> : <><Sparkles size={18} /> 자동 조합하기</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Input Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
            단어 묶음 입력 (쉼표로 구분)
          </h3>
          
          <div style={inputGroupStyles}>
            <label style={labelStyles}>수식어 (예: 가성비, 예쁜, 고급스러운)</label>
            <input 
              type="text" 
              value={keywordGroup1} 
              onChange={(e) => setKeywordGroup1(e.target.value)}
              placeholder="단어들을 쉼표(,)로 구분해주세요"
              style={inputStyles}
            />
          </div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>브랜드/제조사 (예: 삼성, 애플)</label>
            <input 
              type="text" 
              value={keywordGroup2} 
              onChange={(e) => setKeywordGroup2(e.target.value)}
              placeholder="단어들을 쉼표(,)로 구분해주세요"
              style={inputStyles}
            />
          </div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>메인 키워드 (예: 스마트폰, 태블릿)</label>
            <input 
              type="text" 
              value={keywordGroup3} 
              onChange={(e) => setKeywordGroup3(e.target.value)}
              placeholder="단어들을 쉼표(,)로 구분해주세요"
              style={inputStyles}
            />
          </div>

          <div style={inputGroupStyles}>
            <label style={labelStyles}>서브 키워드 (예: 케이스, 보호필름)</label>
            <input 
              type="text" 
              value={keywordGroup4} 
              onChange={(e) => setKeywordGroup4(e.target.value)}
              placeholder="선택 사항입니다"
              style={inputStyles}
            />
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                조합 결과 <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{results.length}</span>개
              </h3>
              <button
                onClick={handleCopy}
                disabled={results.length === 0}
                className="btn-primary"
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.9rem',
                  background: copied ? 'var(--accent-success)' : 'var(--accent-primary)',
                  boxShadow: 'none'
                }}
              >
                {copied ? <><Check size={16} /> 복사 완료</> : <><Copy size={16} /> 전체 복사</>}
              </button>
            </div>
            
            <div style={{ 
              flex: 1, 
              background: '#f8fafc', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '16px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}>
              {results.length > 0 ? results.join('\n') : <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>단어를 입력하면 결과가 즉시 나타납니다.</div>}
            </div>
          </div>

          {/* CTA Ad Banner */}
          <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={24} color="#3b82f6" />
              상품명, 아직도 일일이 만들어서 복사하시나요?
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
              <strong>Mo2 솔루션</strong>은 도매토피아 수집 시 상품명 치환 규칙을 한 번만 등록해두면, 수만 개 상품의 이름을 구글시트에서 한 번에 싹 다 바꿔서 스마트스토어/카페24에 밀어 넣습니다. 노가다는 끝!
            </p>
            <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: '#3b82f6', color: 'white', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '1.1rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Mo2 평생 무료로 자동 배포하기 <ArrowRight size={20} />
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
  color: 'var(--text-secondary)',
  marginBottom: '8px'
}

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
}

const inputGroupStyles: React.CSSProperties = {
  marginBottom: '20px'
}
