import axios from 'axios';

async function test() {
    try {
        const res = await axios.post('https://teamwise-sand.vercel.app/api/market/cafe24/token', {
            mallId: 'wiseteam'
        });
        const token = res.data.access_token;
        console.log('Token fetched');

        const catRes = await axios.get('https://wiseteam.cafe24api.com/api/v2/admin/categories', {
             headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
             }
        });
        console.log("Categories found:", catRes.data.categories.length);
        console.log(catRes.data.categories.slice(0, 5));
    } catch(e: any) {
        console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
