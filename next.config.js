const withNextIntl = require('next-intl/plugin')('./src/i18n.ts')

const nextConfig = {
  reactStrictMode: true
}

module.exports = withNextIntl(nextConfig)
