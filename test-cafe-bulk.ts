import { scrapeDometopiaProduct } from './src/main/scraper';
import { createCafe24Product, Cafe24ProductPayload } from './src/main/cafe24';

const testUrls = [
    '130286', // 탠인머스켓
    '133545', // 신고배
    '114383', // 완숙 토마토
];

async function testBulkCafe24() {
    // Requires a connected mallId. The user was using 'wiseteam' in dev.
    const mallId = 'wiseteam';
    let successes = 0;

    for (const itemCode of testUrls) {
        console.log(`\n\n--- Scraping ${itemCode} ---`);
        const url = `https://dometopia.com/goods/view?no=${itemCode}`;
        const scraped: any = await scrapeDometopiaProduct(url);
        
        if (!scraped || !scraped.success || !scraped.data) {
            console.log(`Failed to scrape ${itemCode}:`, scraped?.error);
            continue;
        }

        const data = scraped.data as any;

        const payload: Cafe24ProductPayload = {
            shop_no: 1,
            request: {
                display_state: 'T',
                selling_state: 'T',
                product_name: data.name,
                price: Math.floor(data.salePrice * 1.3),
                retail_price: Math.floor(data.salePrice * 1.3),
                supply_price: data.salePrice,
                summary_description: "WISE 연동 테스트 제품",
                simple_description: "WISE 연동 테스트 제품",
                description: `<img src="${data.mainImageUrl}" /><br/>${data.detailHtml}`,
                detail_image: data.mainImageUrl,
                image_upload_type: 'A',
                custom_product_code: itemCode,
                has_option: 'F',
                shipping_fee_type: 'T',
                shipping_fee: data.deliveryFee || 3000
            }
        };

        console.log(`Payload prepared for ${itemCode} (${data.name.substring(0, 15)}...). Uploading to Cafe24 (${mallId})...`);
        try {
            const productNo = await createCafe24Product(mallId, payload);
            console.log(`✅ Success! Cafe24 Product No: ${productNo}`);
            successes++;
        } catch (error: any) {
            console.error(`❌ Upload failed for ${itemCode}:`, error.message);
        }

        // Delay for rate limiting (1.5s)
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`\n--- Test Complete: ${successes}/${testUrls.length} succeeded ---`);
}

testBulkCafe24();
