const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function scrapeDometopiaCategories() {
  try {
    const res = await axios.get('https://dometopia.com/main/index', { responseType: 'arraybuffer' });
    const html = iconv.decode(res.data, 'EUC-KR');
    const $ = cheerio.load(html);

    const categories = new Set();
    
    // Attempt to find categories in the sidemenu or category specific drop downs
    $('.category_side a, #categoryAll a, .xans-layout-category a').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 0) {
            categories.add(text);
        }
    });
    
    // fallback if no standard classes
    if (categories.size === 0) {
        $('a[href^="/goods/category?cate="]').each((_, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 0) {
                categories.add(text);
            }
        });
    }

    console.log(Array.from(categories));
  } catch (error) {
    console.error(error.message);
  }
}

scrapeDometopiaCategories();
