const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

async function extractDeepCategoriesLive() {
  try {
    const response = await axios.get('https://dometopia.com/main/index', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const html = response.data // UTF-8 by default
    const $ = cheerio.load(html)

    const map = new Map()
    const allLinks = $('a[href*="code="]')

    allLinks.each((i, el) => {
      let text = $(el).text().trim()
      if (!text) return
      text = text.split('\n')[0].trim()

      if (
        text.length < 2 ||
        text === '더보기' ||
        text === '전체보기' ||
        text === '전체 카테고리' ||
        text === '닫기'
      )
        return

      const href = $(el).attr('href') || ''
      const match = href.match(/code=(\d+)/)

      if (match) {
        const code = match[1]
        if (code.length >= 4) {
          if (!map.has(code) || map.get(code).length < text.length) {
            map.set(code, text)
          }
        }
      }
    })

    const categories = Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code))

    console.log(`Found ${categories.length} deep categories.`)

    const categorizedPaths = []
    const codeToName = Object.fromEntries(categories.map((c) => [c.code, c.name]))

    for (const cat of categories) {
      const code = cat.code
      let fullPath = ''

      if (code.length === 4) {
        fullPath = cat.name
      } else if (code.length === 8) {
        const parentCode = code.substring(0, 4)
        const parentName = codeToName[parentCode] || '알수없음'
        fullPath = `${parentName} > ${cat.name}`
      } else if (code.length === 12) {
        const topCode = code.substring(0, 4)
        const parentCode = code.substring(0, 8)
        const topName = codeToName[topCode] || '알수없음'
        const parentName = codeToName[parentCode] || '알수없음'
        fullPath = `${topName} > ${parentName} > ${cat.name}`
      } else {
        fullPath = cat.name
      }

      categorizedPaths.push([code, fullPath])
    }

    fs.writeFileSync('dom-deep-categories-live.json', JSON.stringify(categorizedPaths, null, 2))
    console.log('Sample of deep categories:')
    console.log(categorizedPaths.slice(100, 110))
  } catch (e) {
    console.error(e.message)
  }
}

extractDeepCategoriesLive()
