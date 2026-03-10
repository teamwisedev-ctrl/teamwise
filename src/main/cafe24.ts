import axios from 'axios';

// Cache for access tokens
const tokenCache: { [mallId: string]: { token: string; expiresAt: number } } = {};

/**
 * Request an Access Token from our Next.js SaaS Backend.
 * The backend manages the Client ID, Secret, and Refresh Tokens securely.
 */
export async function getCafe24Token(mallId: string): Promise<string> {
  const now = Date.now();
  if (tokenCache[mallId] && tokenCache[mallId].expiresAt > now + 60000) {
    return tokenCache[mallId].token;
  }

  try {
    // URL fallback for dev or prod Next.js server
    const serverUrl = process.env.WISE_WEB_URL || 'https://teamwise-sand.vercel.app';
    const response = await axios.post(`${serverUrl}/api/market/cafe24/token`, {
      mallId,
    });

    if (response.data && response.data.access_token) {
      const token = response.data.access_token;
      // Expires roughly in 2 hours, but server handles refresh. Let's cache locally for 1 hr.
      tokenCache[mallId] = {
        token,
        expiresAt: now + (3600 * 1000)
      };
      return token;
    } else {
      throw new Error(response.data.error || 'Token fetch failed');
    }
  } catch (error: unknown) {
    const err = error as any;
    console.error('Cafe24 백엔드 연동 토큰 갱신 실패:', err?.response?.data || err.message);
    throw new Error('카페24 API 토큰 갱신 여부를 확인해 주세요. [1클릭 연동] 버튼을 다시 눌러주세요.');
  }
}

export interface Cafe24ProductPayload {
  shop_no: number;
  request: {
    display_state: 'T' | 'F';
    selling_state: 'T' | 'F';
    product_name: string;
    price: string | number;
    retail_price: string | number;
    supply_price: string | number;
    summary_description: string;
    simple_description: string;
    description: string;
    detail_image?: string; // Optional URL
    image_upload_type?: string; // Optional Upload Type
    custom_product_code: string; // Our master DB ItemCode
    origin_classification?: string;
    origin_place_no?: number;
    // Categorization
    category?: { category_no: number; recommend: 'T' | 'F'; new: 'T' | 'F' }[];
    // Options
    has_option: 'T' | 'F';
    shipping_fee_type: 'T' | 'R' | 'F' | 'M' | 'D' | 'W';
    shipping_fee?: string | number;
  };
}

export async function createCafe24Product(
  mallId: string,
  payload: Cafe24ProductPayload
) {
  const token = await getCafe24Token(mallId);

  try {
    // 1. Extract image URL and remove from initial product payload
    const detailImageUrl = payload.request.detail_image;
    if (payload.request.detail_image) delete payload.request.detail_image;
    if (payload.request.image_upload_type) delete payload.request.image_upload_type;

    // 2. Create Product
    const response = await axios.post(
      `https://${mallId}.cafe24api.com/api/v2/admin/products`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const productNo = response.data.product?.product_no;

    // 3. Associate Image if one existed
    if (productNo && detailImageUrl) {
      try {
        const imgRes = await axios.get(detailImageUrl, { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const imgString = `data:image/jpeg;base64,${b64}`;

        await axios.post(
          `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/images`,
          {
            shop_no: payload.shop_no || 1,
            request: {
              image_upload_type: 'A',
              detail_image: imgString
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (imgErr: any) {
        console.error('Cafe24 Image Mapping Failed:', imgErr?.response?.data || imgErr.message);
        // We still successfully created the product, so we shouldn't necessarily fail the whole process.
        // The user can re-upload images later if needed. But let's log the error.
      }
    }

    // 4. Associate Category if requested (Cafe24 ignores category in POST /products)
    if (productNo && payload.request.category && payload.request.category.length > 0) {
      try {
        const targetCategoryNo = payload.request.category[0].category_no;
        await axios.post(
          `https://${mallId}.cafe24api.com/api/v2/admin/categories/${targetCategoryNo}/products`,
          {
            shop_no: payload.shop_no || 1,
            request: {
              product_no: [productNo]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (catErr: any) {
        console.error('Cafe24 Category Mapping Failed:', catErr?.response?.data || catErr.message);
      }
    }

    return {
      success: true,
      productNo
    };
  } catch (error: unknown) {
    const err = error as any;
    console.error('Cafe24 상품 등록 실패:', err?.response?.data || err.message);
    return {
      success: false,
      error: err?.response?.data?.error?.message || err.message
    };
  }
}

export async function updateCafe24Product(
  mallId: string,
  productNo: number,
  payload: Partial<Cafe24ProductPayload>
) {
  const token = await getCafe24Token(mallId);

  try {
    const response = await axios.put(
      `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      productNo: response.data.product?.product_no
    };
  } catch (error: unknown) {
    const err = error as any;
    console.error(`Cafe24 상품(${productNo}) 업데이트 실패:`, err?.response?.data || err.message);
    return {
      success: false,
      error: err?.response?.data?.error?.message || err.message
    };
  }
}

export async function deleteCafe24Product(
  mallId: string,
  productNo: number
) {
  const token = await getCafe24Token(mallId);

  try {
    await axios.delete(
      `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true
    };
  } catch (error: unknown) {
    const err = error as any;
    console.error(`Cafe24 상품(${productNo}) 삭제 실패:`, err?.response?.data || err.message);
    return {
      success: false,
      error: err?.response?.data?.error?.message || err.message
    };
  }
}

export async function fetchCafe24Orders(mallId: string, startDate: string, endDate: string) {
  const token = await getCafe24Token(mallId);

  try {
    const response = await axios.get(
      `https://${mallId}.cafe24api.com/api/v2/admin/orders`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
          embed: 'items,buyer,receivers' // Ensure child entities are hydrated
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Format orders for Google Sheets (same as SmartStore)
    // ['주문일시', '주문번호', '상품명', '옵션', '수량', '수취인', '주소', '연락처', '결제금액', '주문상태']
    const formattedOrders = (response.data.orders || []).map((o: any) => {
      const firstItem = o.items && o.items.length > 0 ? o.items[0] : {};
      const buyer = o.buyer || {};
      const receiver = o.receivers && o.receivers.length > 0 ? o.receivers[0] : {};
      
      const addressStr = receiver.address_full || `${receiver.address1 || ''} ${receiver.address2 || ''}`.trim() || `${buyer.buyer_address1 || ''} ${buyer.buyer_address2 || ''}`.trim();
      const amountStr = o.initial_order_amount?.total_amount_due || o.actual_order_amount?.total_amount_due || '0';

      return [
        o.order_date || '', // 주문일시
        o.order_id || '', // 주문번호
        firstItem.product_name || '이름 없음', // 상품명
        firstItem.option_value || '단품', // 옵션
        (firstItem.quantity || o.items?.length || 1).toString(), // 수량 (첫 번째 품목 수량 우선)
        receiver.name || buyer.name || '알수없음', // 수취인
        addressStr, // 주소
        receiver.cellphone || receiver.phone || '', // 연락처
        amountStr.replace(/\.00$/, ''), // 결제금액 (소수점 제거)
        firstItem.status_text || o.order_status || 'UNKNOWN' // 주문상태
      ];
    });

    return {
      success: true,
      orders: formattedOrders
    };
  } catch (error: unknown) {
    const err = error as any;
    console.error('Cafe24 주문 조회 실패:', err?.response?.data || err.message);
    return {
      success: false,
      error: err?.response?.data?.error?.message || err.message
    };
  }
}

export async function fetchCafe24Categories(mallId: string) {
  const token = await getCafe24Token(mallId);

  try {
    const response = await axios.get(
      `https://${mallId}.cafe24api.com/api/v2/admin/categories`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      categories: response.data.categories || []
    };
  } catch (error: unknown) {
    const err = error as any;
    console.error('Cafe24 카테고리 조회 실패:', err?.response?.data || err.message);
    return {
      success: false,
      error: err?.response?.data?.error?.message || err.message
    };
  }
}

export async function createCafe24Category(mallId: string, categoryName: string, _isRetry = false): Promise<any> {
  const token = await getCafe24Token(mallId);

  try {
    const response = await axios.post(
      `https://${mallId}.cafe24api.com/api/v2/admin/categories`,
      {
        shop_no: 1,
        request: {
          category_name: categoryName,
          parent_category_no: 1, // Root level usually or default
          display_type: 'A',     // PC + Mobile
          use_display: 'T'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      category: response.data.category
    };
  } catch (error: unknown) {
    const err = error as any;
    const errorMessage = err?.response?.data?.error?.message || err.message || '';
    const status = err?.response?.status;
    
    if (!_isRetry && (status === 401 || status === 403 || errorMessage.includes('Insufficient_scope'))) {
      if (tokenCache[mallId]) {
        delete tokenCache[mallId];
      }
      console.log(`[Cafe24] Token cache cleared for ${mallId} due to 401/403. Retrying API call...`);
      return createCafe24Category(mallId, categoryName, true);
    }

    console.error('Cafe24 카테고리 자동 생성 실패:', err?.response?.data || err.message);
    return {
      success: false,
      error: errorMessage
    };
  }
}
