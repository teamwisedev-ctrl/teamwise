const axios = require('axios')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')

async function scrapeDometopiaCategories() {
  try {
    const res = await axios.get('https://dometopia.com/main/index', { responseType: 'arraybuffer' })
    const html = iconv.decode(res.data, 'EUC-KR')
    const $ = cheerio.load(html)

    const categories = []

    // The category_navigation is where we clicked before
    // Or we scan the menu box left
    $('.category_navigation a, .allcate a, .category_list a, #result_category_list a').each(
      (_, el) => {
        const text = $(el).text().trim()
        if (text && !categories.includes(text)) {
          categories.push(text)
        }
      }
    )

    // Try finding the classic cate=0012 etc from links
    if (categories.length < 5) {
      $('a[href*="code="]').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href')
        const match = href.match(/code=(\d{4})$/) // Exact 4 digits is a 1-depth category
        if (text && match && !categories.includes(text) && text !== '더보기') {
          // Ignore standard menu links like '유럽브랜드관' if they don't look like standard catalogs
          categories.push(text)
        }
      })
    }

    console.log(categories)
  } catch (error) {
    console.error(error.message)
  }
}

scrapeDometopiaCategories()
