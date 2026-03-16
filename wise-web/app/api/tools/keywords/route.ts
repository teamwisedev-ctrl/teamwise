import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query is missing' }, { status: 400 })
  }

  try {
    // 1. Fetch Auto-complete terms from Naver Search
    // Naver uses EUC-KR for this endpoint, but simple English/Korean strings work fine with URI encoding.
    // However, JS fetch with default UTF-8 might garble the euc-kr response, so we grab related tags instead.
    
    // 2. Fetch Naver Mobile search for related keywords (HTML parsing)
    // To avoid Euc-KR parsing issues, we fetch the mobile search result page and extract the `<div class="skey_area">` related keywords.
    const res = await fetch(`https://m.search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      next: { revalidate: 3600 } // cache for an hour
    })

    const html = await res.text()
    
    // Extremely rudimentary DOM regex parsing to find related Keywords in Naver M
    // Look for data-cr-area="rlk" attributes or class="tit" inside the related keyword block.
    const relatedKeywords: string[] = []
    
    // Pattern 1: Related Keywords in Mobile Naver 
    // They are usually within <div class="direct_link"> or similar structures with class "tit"
    const relRegex = /<div class="tit">([^<]+)<\/div>/g
    let match
    while ((match = relRegex.exec(html)) !== null) {
      const kw = match[1].trim()
      if (kw && kw !== query && !relatedKeywords.includes(kw)) {
        relatedKeywords.push(kw)
      }
    }

    // Pattern 2: Auto-completion API (fallback JSONP parsing)
    // Naver AutoComplete API: https://ac.search.naver.com/nx/ac?q=...&con=1&rev=4&q_enc=UTF-8&st=100&r_format=json&t_koreng=1&q_au=0&dir=0&os=...
    try {
      const autoRes = await fetch(`https://ac.search.naver.com/nx/ac?q=${encodeURIComponent(query)}&con=1&rev=4&q_enc=UTF-8&st=100&r_format=json&t_koreng=1&q_au=0&dir=0`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 }
      })
      const autoJson = await autoRes.json()
      if (autoJson && autoJson.items && autoJson.items[0]) {
        autoJson.items[0].forEach((item: string[]) => {
          if (item[0] && item[0] !== query && !relatedKeywords.includes(item[0])) {
            relatedKeywords.push(item[0])
          }
        })
      }
    } catch (e) {
      console.warn('Naver AC fallback failed', e)
    }

    if (relatedKeywords.length === 0) {
      // Create some default variations if API logic completely changed
      relatedKeywords.push(`${query} 추천`, `가성비 ${query}`, `${query} 비교`, `${query} 브랜드`)
    }



    // Enhanced Rule-based Classification (Heuristics)
    const modifiers: string[] = [] // 짧고 수식하는 분할 단어 (예: 초경량, 접이식, 미니)
    const brands: string[] = [] // 영어, 3음절 유명 브랜드, 혹은 '~브랜드' 명시
    const subs: string[] = [] // 비교적 긴 파생 단어

    relatedKeywords.forEach(kw => {
      // 본래 키워드(query) 구문 자체를 삭제해서 순수 파생 단어만 남깁니다.
      const stripped = kw.replace(new RegExp(query, 'gi'), '').trim()
      
      if (!stripped) return

      // 브랜드 감지 로직 (강화됨)
      // 1. 순수 영문자이거나 영문+숫자 조합 (예: LG, K2)
      // 2. 단어가 '브랜드' 혹은 '메이커' 로 끝남
      // 3. 특정 2~4글자 고유명사 패턴 (정확히는 알 수 없지만, 네이버 연관검색어 생리상 쿼리 앞에 붙는 2~3글자 단어가 브랜드일 확률이 매우 높음)
      const isEnglishOrBrand = /^[a-zA-Z0-9]+$/.test(stripped) || stripped.endsWith('브랜드') || stripped.endsWith('메이커')
      
      const isPrefixPattern = kw.startsWith(stripped) && stripped.length >= 2 && stripped.length <= 4 // e.g., "다이소 캠핑의자" -> "다이소"
      
      if (isEnglishOrBrand) {
        brands.push(stripped.replace(/(브랜드|메이커)/g, '').trim())
      } else if (isPrefixPattern && !stripped.includes(' ')) {
        // 단어 앞에 붙는 2~4글자의 띄어쓰기 없는 단어는 브랜드나 주요 수식어일 확률이 큼
        // 이 중 너무 흔한 형용사(예: 예쁜, 좋은)가 아니면 브랜드 배열에도 슬쩍 넣어봄
        brands.push(stripped)
        modifiers.push(stripped) // 동시에 수식어에도 넣음 (사용자 선택권)
      } else if (stripped.length <= 3) {
        // 짧은 단어는 수식어로 분류 (투명, 미니, 소형 등)
        modifiers.push(stripped)
      } else if (kw.length > query.length + 3 || stripped.includes(' ')) {
        // 전체 길이가 길거나, 남은 파생 단어에 띄어쓰기가 포함된 긴 구절 -> 서브 키워드
        subs.push(kw)
      } else {
        // 나머지는 수식어로 편입
        modifiers.push(stripped)
      }
    })
    const cleanModifiers = [...new Set(modifiers)].filter(Boolean)
    const cleanBrands = [...new Set(brands)].filter(Boolean)
    const cleanSubs = [...new Set(subs)].filter(Boolean)

    return NextResponse.json({
      original: query,
      modifiers: cleanModifiers.slice(0, 5),
      brands: cleanBrands.slice(0, 3),
      subs: cleanSubs.slice(0, 5)
    })

  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
  }
}
