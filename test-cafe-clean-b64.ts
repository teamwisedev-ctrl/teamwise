import axios from 'axios';

async function test() {
    try {
        const res = await axios.post('https://teamwise-sand.vercel.app/api/market/cafe24/token', {
            mallId: 'wiseteam'
        });
        const token = res.data.access_token;
        
        // 1. Download image
        const imgRes = await axios.get('https://picsum.photos/200/300', { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const imgString = `data:image/jpeg;name=test.jpg;base64,${b64}`;

        const payload = {
            shop_no: 1,
            request: {
                display_state: 'T',
                selling_state: 'T',
                product_name: '테스트 베이스64 - NoUploadType',
                price: '1000',
                retail_price: '1000',
                supply_price: '500',
                summary_description: '설명',
                simple_description: '간단설명',
                description: '상세설명',
                detail_image: imgString, // Raw base64 with data scheme
                custom_product_code: 'TEST_B64_NO_TYPE',
                origin_classification: 'T', // Domestic
                origin_place_no: 400, // 400 is common for Korea
                has_option: 'F',
                shipping_fee_type: 'T'
            }
        };

        const prodRes = await axios.post('https://wiseteam.cafe24api.com/api/v2/admin/products', payload, {
             headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
             }
        });
        console.log("Product created (Base64 JPEG NoUploadType):", prodRes.data.product.product_no);
    } catch(e: any) {
        console.error("Error creating product:");
        console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
