import axios from 'axios'
import { getCafe24Token } from './src/main/cafe24'

async function test() {
  try {
    const token = await getCafe24Token('wiseteam')
    const res = await axios.get('https://wiseteam.cafe24api.com/api/v2/admin/products/30', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('CATEGORY FIELD:', JSON.stringify(res.data.product.category, null, 2))
    console.log('CATEGORIES FIELD:', JSON.stringify(res.data.product.categories, null, 2))

    // Also try checking the API schema for creating a product if we can
  } catch (e) {
    console.error(e?.response?.data || e.message)
  }
}
test()
