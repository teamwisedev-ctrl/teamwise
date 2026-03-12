const fs = require('fs')
const cheerio = require('cheerio')

function extractCategories() {
  const html = fs.readFileSync('dom-main.html', 'utf-8')
  const $ = cheerio.load(html)

  const map = new Map()

  $('a[href*="code="]').each((i, el) => {
    let text = $(el).text().trim()
    // Some texts contain \n\t sub-descriptions, split and take first part
    text = text.split('\n')[0].trim()

    const href = $(el).attr('href')
    const match = href.match(/code=(\d{4})$/)
    if (match && text && text.length > 1 && text !== '더보기') {
      map.set(match[1], text)
    }
  })

  const finalArray = Array.from(map.entries())
    .map(([code, name]) => [code, name])
    .sort((a, b) => a[0].localeCompare(b[0]))

  console.log(JSON.stringify(finalArray, null, 2))
}

extractCategories()
