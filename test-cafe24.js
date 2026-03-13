const axios = require('axios');

async function testCafe24() {
  const mallId = 'wiseteam';

  try {
    // 1. Get Token
    const serverUrl = process.env.MOI_WEB_URL || 'https://teamwise-sand.vercel.app';
    console.log(`Fetching token for ${mallId}...`);
    const tokenRes = await axios.post(`${serverUrl}/api/market/cafe24/token`, { mallId });
    const token = tokenRes.data.access_token;
    console.log(`Got token: ${token.substring(0, 10)}...`);

    // 2. GET all products (limit 5)
    console.log(`GET /api/v2/admin/products?limit=5`);
    const getRes = await axios.get(
      `https://${mallId}.cafe24api.com/api/v2/admin/products?limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`GET Success!`);
    console.log(JSON.stringify(getRes.data, null, 2));

  } catch (error) {
    console.error(`\nFAILED!`);
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testCafe24();
