const axios = require('axios')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')

async function scrapeDometopiaCategories() {
  try {
    const res = await axios.get('https://dometopia.com/main/index', { responseType: 'arraybuffer' })
    const html = iconv.decode(res.data, 'EUC-KR')
    const $ = cheerio.load(html)

    const categories = new Set()

    // Look specifically for sidebar category links
    $('#categoryAll .cate_b_link').each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length > 0) {
        categories.add(text)
      }
    })

    // Try catching any basic category link
    if (categories.size === 0) {
      $('a[href^="/goods/category?"] > span').each((_, el) => {
        const text = $(el).text().trim()
        if (text && text.length > 0) {
          categories.add(text)
        }
      })
    }

    if (categories.size === 0) {
      $('a[href*="cate="]').each((_, el) => {
        const text = $(el).text().trim()
        // ignore empty or "more"
        if (text && text.length > 1 && !text.includes('더보기')) {
          categories.add(text)
        }
      })
    }

    console.log(Array.from(categories))
  } catch (error) {
    console.error(error.message)
  }
}

scrapeDometopiaCategories()
