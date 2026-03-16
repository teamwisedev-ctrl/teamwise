import { Metadata } from 'next'
import MarginCalculatorClient from './MarginCalculatorClient'

export const metadata: Metadata = {
  title: '오픈마켓 마진 계산기 | 스마트스토어, 카페24, 쿠팡 수익 분석',
  description: '도매처 원가, 택배비, 마켓 평균 수수료를 입력하고 실제 통장에 꽂히는 순수익과 마진율을 즉시 시뮬레이션 하세요.',
  alternates: {
    canonical: '/tools/margin-calculator'
  }
}

export default function MarginCalculatorPage() {
  return <MarginCalculatorClient />
}
