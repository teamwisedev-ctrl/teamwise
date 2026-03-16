import { Metadata } from 'next'
import KeywordMixerClient from './KeywordMixerClient'

export const metadata: Metadata = {
  title: '쇼핑몰 상품명 조합기 | 스마트스토어 키워드 추출',
  description: '엑셀 함수 없이 무료로 쇼핑몰 키워드, 수식어, 상품명을 무한 조합해 스마트스토어 SEO 최적화에 활용하세요.',
  alternates: {
    canonical: '/tools/keyword-mixer'
  }
}

export default function KeywordMixerPage() {
  return <KeywordMixerClient />
}
