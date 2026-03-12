import axios from 'axios'

async function test() {
  try {
    const res = await axios.post('https://teamwise-sand.vercel.app/api/market/cafe24/token', {
      mallId: 'wiseteam'
    })
    const token = res.data.access_token

    // Step 1: Upload image file to get path
    console.log('1. Uploading image...')
    const imgRes = await axios.get('https://picsum.photos/200/300', { responseType: 'arraybuffer' })
    const b64 = Buffer.from(imgRes.data, 'binary').toString('base64')
    const imgString = `data:image/jpeg;base64,${b64}`

    // Step 2: Create product WITHOUT image
    console.log('1. Creating product...')
    const productPayload = {
      shop_no: 1,
      request: {
        display_state: 'T',
        selling_state: 'T',
        product_name: '테스트 베이스64 트라이',
        price: '1000',
        retail_price: '1000',
        supply_price: '500',
        summary_description: '설명',
        simple_description: '간단설명',
        description: '상세설명',
        custom_product_code: 'TEST_B64_DIRECT',
        has_option: 'F',
        shipping_fee_type: 'T'
      }
    }

    const prodRes = await axios.post(
      'https://wiseteam.cafe24api.com/api/v2/admin/products',
      productPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    const productNo = prodRes.data.product.product_no
    console.log('Created Product No:', productNo)

    // Step 3: Associate the image path to the product
    console.log('2. Mapping base64 directly to product...')
    const mapPayload = {
      shop_no: 1,
      request: {
        image_upload_type: 'A',
        detail_image: imgString
      }
    }

    const mapRes = await axios.post(
      `https://wiseteam.cafe24api.com/api/v2/admin/products/${productNo}/images`,
      mapPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    console.log('Successfully mapped image!', mapRes.data)
  } catch (e: any) {
    console.error('Error occurred:')
    console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e.message)
  }
}
test()
