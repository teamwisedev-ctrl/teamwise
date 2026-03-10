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
        const imgString = `data:image/jpeg;base64,${b64}`;

        const uploadPayload = {
            requests: [{ image: imgString }]
        };

        const uploadRes = await axios.post('https://wiseteam.cafe24api.com/api/v2/admin/products/images', uploadPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
        });
        const path = uploadRes.data.images[0].path;
        console.log("Acquired Cafe24 internal path:", path);

        // 2. Create Product
        console.log("Creating product using internal path...");
        const payload = {
            shop_no: 1,
            request: {
                display_state: 'T',
                selling_state: 'T',
                product_name: '테스트 투스텝 최종확인',
                price: '1000',
                retail_price: '1000',
                supply_price: '500',
                summary_description: '설명',
                simple_description: '간단설명',
                description: '상세설명',
                detail_image: path, // Let's try omit image_upload_type entirely, or use 'A' if prompted. It should just work natively with native paths.
                custom_product_code: 'TEST_2STEP_FINAL',
                origin_classification: 'T',
                origin_place_no: 400,
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
        console.log("Product created successfully:", prodRes.data.product.product_no);
    } catch(e: any) {
        console.error("Error creating product:");
        console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
