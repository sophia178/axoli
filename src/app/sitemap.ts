import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://axoli.online'
  return [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/pricing` },
    { url: `${baseUrl}/login` },
    { url: `${baseUrl}/signup` }
  ]
}
