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
        const imgString = `data:image/jpeg;base64,${b64}`; // or without data URI

        // 2. Upload to Cafe24
        console.log("Uploading image to Cafe24...");
        let path = '';
        try {
            const uploadPayload = {
                request: {
                    image: b64 // Or maybe imgString? Let's try raw b64 first. Wait, maybe we need an array? Let's try single object first.
                }
            };
            const uploadRes = await axios.post('https://wiseteam.cafe24api.com/api/v2/admin/products/images', uploadPayload, {
                 headers: {
                     'Authorization': `Bearer ${token}`,
                     'Content-Type': 'application/json'
                 }
            });
            console.log("Image upload response:", uploadRes.data);
            path = uploadRes.data.images[0].path; // assuming standard cafe24 response format
        } catch(uploadErr: any) {
            console.error("Image Upload Failed:");
            console.error(uploadErr.response ? JSON.stringify(uploadErr.response.data, null, 2) : uploadErr.message);
            
            // Try with data uri if raw b64 failed
            try {
                console.log("Retrying with data URI...");
                const uploadPayload2 = {
                    request: {
                        image: imgString
                    }
                };
                const uploadRes2 = await axios.post('https://wiseteam.cafe24api.com/api/v2/admin/products/images', uploadPayload2, {
                     headers: {
                         'Authorization': `Bearer ${token}`,
                         'Content-Type': 'application/json'
                     }
                });
                console.log("Image upload response 2:", uploadRes2.data);
                path = uploadRes2.data.images[0].path;
            } catch(e2: any) {
                console.error("Image Upload Failed (Data URI fallback):");
                console.error(e2.response ? JSON.stringify(e2.response.data, null, 2) : e2.message);
                return;
            }
        }

        if (!path) {
            console.error("No path returned.");
            return;
        }

        // 3. Create Product
        console.log("Creating product using path:", path);
        const payload = {
            shop_no: 1,
            request: {
                display_state: 'T',
                selling_state: 'T',
                product_name: '테스트 투스텝 업로드',
                price: '1000',
                retail_price: '1000',
                supply_price: '500',
                summary_description: '설명',
                simple_description: '간단설명',
                description: '상세설명',
                detail_image: path,
                image_upload_type: 'A', // Or omitted, or C?
                custom_product_code: 'TEST_2STEP',
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
        console.log("Product created:", prodRes.data.product.product_no);
    } catch(e: any) {
        console.error("Error creating product:");
        console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
