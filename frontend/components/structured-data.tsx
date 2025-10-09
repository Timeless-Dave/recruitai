export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RecruitAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '500',
    },
    description:
      'AI-powered recruitment platform for intelligent applicant screening, fair ranking, and automated feedback. Transform your hiring process with smart technology.',
    featureList: [
      'AI-powered applicant screening',
      'Intelligent candidate ranking',
      'Automated feedback system',
      'Real-time analytics',
      'Bias-free recruitment',
      'Applicant tracking system',
    ],
    screenshot: 'https://recruitai.app/og-image.png',
    author: {
      '@type': 'Organization',
      name: 'RecruitAI',
      url: 'https://recruitai.app',
    },
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RecruitAI',
    url: 'https://recruitai.app',
    logo: 'https://recruitai.app/favicon.svg',
    description:
      'Smart AI-powered recruitment platform helping companies find top talent faster with intelligent screening and fair ranking.',
    sameAs: [
      // Add your social media profiles here when available
      // 'https://twitter.com/recruitai',
      // 'https://linkedin.com/company/recruitai',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  )
}

