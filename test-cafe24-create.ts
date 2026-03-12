import axios from 'axios'
import { getCafe24Token } from './src/main/cafe24'

async function test() {
  try {
    const token = await getCafe24Token('wiseteam')
    const payload = {
      shop_no: 1,
      request: {
        display_status: 'T',
        selling_status: 'T',
        product_name: 'Test Product Category API',
        price: '1000',
        retail_price: '1500',
        supply_price: '800',
        has_option: 'F',
        category: [
          {
            category_no: 32, // The WISE temporary category we created
            recommend: 'F',
            new: 'F'
          }
        ]
      }
    }

    console.log('Sending Payload:', JSON.stringify(payload, null, 2))

    const res = await axios.post('https://wiseteam.cafe24api.com/api/v2/admin/products', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response:', JSON.stringify(res.data.product, null, 2))
  } catch (e) {
    if (e.response) {
      console.error('API Error Response:', JSON.stringify(e.response.data, null, 2))
    } else {
      console.error('Network Error:', e.message)
    }
  }
}
test()
