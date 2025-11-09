import React from 'react';

interface StructuredDataProps {
  type: 'WebApplication' | 'Organization' | 'WebSite' | 'BreadcrumbList';
  data?: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'WebApplication':
      structuredData = {
        ...structuredData,
        '@type': 'WebApplication',
        name: 'Verfolia',
        description: 'Transform your resume into a professional portfolio with AI-powered parsing and advanced analytics',
        url: 'https://verfolia.com',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'AI-powered resume parsing',
          'Beautiful portfolio templates',
          'Resume analytics and tracking',
          'View count tracking',
          'Engagement metrics',
          'Free resume builder'
        ],
        ...data,
      };
      break;

    case 'Organization':
      structuredData = {
        ...structuredData,
        '@type': 'Organization',
        name: 'Verfolia',
        url: 'https://verfolia.com',
        logo: 'https://verfolia.com/logo.png',
        description: 'Professional resume to portfolio converter with AI-powered parsing',
        sameAs: [
          'https://twitter.com/verfolia',
          // Add other social media links here
        ],
        ...data,
      };
      break;

    case 'WebSite':
      structuredData = {
        ...structuredData,
        '@type': 'WebSite',
        name: 'Verfolia',
        url: 'https://verfolia.com',
        description: 'Transform your resume into a professional portfolio',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://verfolia.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };
      break;

    case 'BreadcrumbList':
      structuredData = {
        ...structuredData,
        '@type': 'BreadcrumbList',
        itemListElement: data?.items || [],
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Helper to create breadcrumb items
export function createBreadcrumbItem(name: string, url: string, position: number) {
  return {
    '@type': 'ListItem',
    position,
    name,
    item: url,
  };
}

// Preset structured data configurations
export const presetStructuredData = {
  home: [
    <StructuredData key="webapp" type="WebApplication" />,
    <StructuredData key="org" type="Organization" />,
    <StructuredData key="website" type="WebSite" />,
  ],
  createResume: [
    <StructuredData 
      key="breadcrumb" 
      type="BreadcrumbList" 
      data={{
        items: [
          createBreadcrumbItem('Home', 'https://verfolia.com', 1),
          createBreadcrumbItem('Create Resume', 'https://verfolia.com/create-resume', 2),
        ]
      }}
    />
  ],
  uploadResume: [
    <StructuredData 
      key="breadcrumb" 
      type="BreadcrumbList" 
      data={{
        items: [
          createBreadcrumbItem('Home', 'https://verfolia.com', 1),
          createBreadcrumbItem('Upload Resume', 'https://verfolia.com/upload-resume', 2),
        ]
      }}
    />
  ],
};
