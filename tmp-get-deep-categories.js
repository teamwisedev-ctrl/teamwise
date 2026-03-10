const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('dom-main.html', 'utf-8');
const $ = cheerio.load(html);

const categories = [];

// Inspecting the #categoryAll or similar navigation menus
$('#categoryAll .cate_b_link').each((i, el) => {
    const mainHref = $(el).attr('href');
    const mainText = $(el).text().trim();
    const mainMatch = mainHref && mainHref.match(/cateCd=([0-9]+)/);
    
    if (mainMatch) {
        const mainCode = mainMatch[1];
        categories.push({ code: mainCode, name: mainText, level: 1 });
        
        // Find subcategories. Usually they are in an adjacent ul or div.
        const $submenu = $(el).next('ul, div, .sub_menu');
        if ($submenu.length) {
            $submenu.find('a').each((j, subEl) => {
                const subHref = $(subEl).attr('href');
                const subText = $(subEl).text().trim();
                const subMatch = subHref && subHref.match(/cateCd=([0-9]+)/);
                if (subMatch && subText) {
                    categories.push({ code: subMatch[1], name: `${mainText} > ${subText}`, level: 2 });
                }
            });
        }
    }
});

console.log(`Found ${categories.length} categories.`);
if (categories.length > 0) {
    console.log("Sample:", categories.slice(0, 10));
}

// Write to a JSON file to inspect
fs.writeFileSync('dom-all-categories.json', JSON.stringify(categories, null, 2));
