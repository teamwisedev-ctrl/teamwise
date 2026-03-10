import axios from 'axios';

async function test() {
    try {
        const res = await axios.post('https://teamwise-sand.vercel.app/api/market/cafe24/token', {
            mallId: 'wiseteam'
        });
        const token = res.data.access_token;
        
        const payload = {
            shop_no: 1,
            request: {
                display_state: 'T',
                selling_state: 'T',
                product_name: '테스트 상품 타입A - 돔',
                price: '1000',
                retail_price: '1000',
                supply_price: '500',
                summary_description: '설명',
                simple_description: '간단설명',
                description: '상세설명',
                custom_product_code: 'TEST_NO_IMG',
                origin_classification: 'T',
                origin_place_no: 494,
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
        console.log("Product created (Type A Dome):", prodRes.data.product.product_no);
    } catch(e: any) {
        console.error("Error creating product:");
        console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
