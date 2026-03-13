import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mo2.kr'

  // We can add dynamic routes here later if needed (like blog posts)
  const routes = ['', '/guide', '/terms', '/privacy', '/download'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8
  }))

  return routes
}
