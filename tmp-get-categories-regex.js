const axios = require('axios')
const iconv = require('iconv-lite')

async function scrapeDometopiaCategories() {
  try {
    const res = await axios.get('https://dometopia.com', { responseType: 'arraybuffer' })
    const html = iconv.decode(res.data, 'EUC-KR')

    // We can extract categories using regex matches for cate=XXXX on the main page.
    const matches = html.match(/cate=(\d{4})['"].*?>([^<]+)</g)

    const categories = new Set()
    const map = {}

    if (matches) {
      matches.forEach((m) => {
        const codeMatch = m.match(/cate=(\d{4})/)
        const nameMatch = m.match(/>([^<]+)</)

        if (codeMatch && nameMatch) {
          const code = codeMatch[1]
          const name = nameMatch[1].trim()

          if (name.length > 1 && name !== '더보기') {
            // console.log(code, name);
            map[code] = name
          }
        }
      })
    }

    console.log(Object.values(map))
  } catch (error) {
    console.error(error.message)
  }
}

scrapeDometopiaCategories()
