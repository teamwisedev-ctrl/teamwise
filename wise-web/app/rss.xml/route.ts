import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://mo2.kr'
  const date = new Date().toUTCString()

  // Define the core pages for the RSS feed
  const pages = [
    {
      title: 'Mo2 - 1:N Market Sync Solution',
      description: '다중 도매처와 오픈마켓을 통합 관리하는 지능형 스크래핑 솔루션',
      url: `${baseUrl}/`
    },
    {
      title: 'Mo2 사용자 매뉴얼',
      description: 'Mo2의 도매처 상품 수집부터 카페24 마스터 연동까지의 상세 가이드',
      url: `${baseUrl}/guide`
    },
    {
      title: 'Mo2 Windows 다운로드',
      description: 'Mo2 데스크톱 애플리케이션 공식 다운로드 및 설치 안내',
      url: `${baseUrl}/download`
    }
  ]

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Mo2 공식 웹사이트</title>
    <link>${baseUrl}</link>
    <description>다중 도매처와 오픈마켓을 통합 관리하는 지능형 스크래핑 솔루션</description>
    <language>ko</language>
    <pubDate>${date}</pubDate>
    <lastBuildDate>${date}</lastBuildDate>
    ${pages
      .map(
        (page) => `
    <item>
      <title><![CDATA[${page.title}]]></title>
      <link>${page.url}</link>
      <description><![CDATA[${page.description}]]></description>
      <pubDate>${date}</pubDate>
      <guid>${page.url}</guid>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
    }
  })
}
