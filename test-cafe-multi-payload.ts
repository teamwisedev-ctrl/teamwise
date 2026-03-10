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

        const payloads = [
            { request: { image: imgString } },
            { requests: [{ image: imgString }] },
            { request: { images: [imgString] } },
            { requests: [imgString] }
        ];

        for (let i = 0; i < payloads.length; i++) {
            console.log(`Testing payload format ${i+1}...`);
            try {
                const uploadRes = await axios.post('https://wiseteam.cafe24api.com/api/v2/admin/products/images', payloads[i], {
                     headers: {
                         'Authorization': `Bearer ${token}`,
                         'Content-Type': 'application/json'
                     }
                });
                console.log(`Success with payload ${i+1}!`, uploadRes.data);
                // We found the correct one!
                break;
            } catch(e: any) {
                console.error(`Failed payload ${i+1}:`, e.response?.data?.error?.message || e.message);
            }
        }
    } catch(e: any) {
        console.error("Global Error:");
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
