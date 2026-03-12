import { ipcMain } from 'electron'
import axios from 'axios'

// If you want a hardcoded fallback just for testing (NOT recommended for production):
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '' // Insert your key or rely on env

export function setupAIHandlers() {
  ipcMain.handle(
    'ai-extract-category-keyword',
    async (_event, productName: string, categoryPath: string[]) => {
      if (!OPENAI_API_KEY) {
        return { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' }
      }

      try {
        const prompt = `
당신은 이커머스 전문 카테고리 매칭 AI입니다.
상품명과 도매처의 기존 카테고리 경로를 보고, '네이버 스마트스토어' 카테고리 검색 API에 던졌을 때 가장 정확한 카테고리가 튀어나올 만한 "핵심 키워드(1~2단어)"를 추출해주세요.
결과는 오직 그 키워드만 출력해야 합니다. 부가 설명 금지.

[입력값]
- 상품명: ${productName}
- 수집처 카테고리: ${categoryPath.join(' > ')}

[출력 예시]
유리컵
여성니트
캠핑의자
`

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 20
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const keyword = response.data.choices[0].message.content.trim()
        return { success: true, keyword }
      } catch (error: any) {
        let msg = error.message
        if (error.response && error.response.data && error.response.data.error) {
          msg = error.response.data.error.message
        }
        return { success: false, error: msg }
      }
    }
  )

  ipcMain.handle(
    'ai-calculate-margin',
    async (
      _event,
      data: {
        productName: string
        baseCalculatedPrice: number
        costPrice: number
      }
    ) => {
      if (!OPENAI_API_KEY) {
        return { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' }
      }

      const { productName, baseCalculatedPrice, costPrice } = data

      try {
        const prompt = `당신은 한국의 온라인 이커머스(스마트스토어, 쿠팡 등) 상품 소싱 및 가격 결정 전문가입니다.
사용자가 도매 사이트에서 소싱한 상품을 판매하려고 합니다.

[상품 정보]
- 상품명: ${productName}
- 도매 원가: ${costPrice}원
- 사용자의 기본 마진율 설정에 따른 1차 계산가: ${baseCalculatedPrice}원

1차 계산가는 원가에 마진, 배송비, 수수료 등을 기계적으로 더한 값입니다.
당신의 임무는 이 상품의 시장 경쟁력, 심리적 가격 저항선, 실제 판매가 잘 될 만한 최적의 '최종 판매가'를 제안하는 것입니다.

[조건]
1. 1차 계산가보다 너무 낮게 설정하여 마진을 해치지 말 것.
2. 100원 단위나 10원 단위로 끊어지는 깔끔한 숫자를 제안할 것 (예: 12,900원).
3. 응답은 반드시 JSON 형태로만 줄 것.

응답 형식 예시:
{
  "suggestedPrice": 12900,
  "reasoning": "이 상품은 시장에서 단가가 높게 형성되므로 1차 계산가보다 약간 더 올려도 판매가 가능합니다."
}
`

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 15
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const suggestedPriceStr = response.data.choices[0].message.content.replace(/[^0-9]/g, '')
        const suggestedPrice = parseInt(suggestedPriceStr, 10)

        if (isNaN(suggestedPrice)) {
          return { success: false, error: 'AI가 유효한 가격을 반환하지 않았습니다.' }
        }

        return { success: true, suggestedPrice }
      } catch (error: any) {
        let msg = error.message
        if (error.response && error.response.data && error.response.data.error) {
          msg = error.response.data.error.message
        }
        return { success: false, error: msg }
      }
    }
  )
}
