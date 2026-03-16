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

    // Rule-based Classification (Heuristics)
    const modifiers: string[] = [] // 짧고 수식하는 말 (가성비, 예쁜, 미니)
    const brands: string[] = [] // 영어나 3자 영/한
    const subs: string[] = [] // 긴 확장 단어

    relatedKeywords.forEach(kw => {
      // Remove the main keyword from the related term to isolate the modifier if present
      const stripped = kw.replace(new RegExp(query, 'gi'), '').trim()
      
      if (!stripped) return

      if (stripped.length <= 2) {
        // e.g., "가방 투명" -> "투명" (Modifier)
        modifiers.push(stripped)
      } else if (/^[a-zA-Z]+$/.test(stripped) || stripped.endsWith('브랜드')) {
        // English words or ends with '브랜드' (Brand)
        brands.push(stripped.replace('브랜드', '').trim())
      } else if (kw.length > query.length + 3) {
        // Significantly longer words -> Sub keywords
        subs.push(kw)
      } else {
        modifiers.push(stripped)
      }
    })

    // Deduplicate and filter empty strings
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
