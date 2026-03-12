const fs = require('fs')
const cheerio = require('cheerio')

function extractCategories() {
  const html = fs.readFileSync('dom-main.html', 'utf-8')
  const $ = cheerio.load(html)

  const map = new Map()

  $('a[href*="code="]').each((i, el) => {
    const text = $(el).text().trim()
    const href = $(el).attr('href')
    const match = href.match(/code=(\d{4})$/)
    if (match && text && text.length > 1 && text !== '더보기') {
      map.set(match[1], text)
    }
  })

  console.log('Categories:', Array.from(map.entries()))
}

extractCategories()
