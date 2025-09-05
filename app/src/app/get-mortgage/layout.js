import './get-mortgage.css';
import SessionWarning from '@/components/SessionWarning';

export const metadata = {
  title: 'Dubai Mortgage Application - Get Pre-Approved Today | Neon Mortgage',
  description: 'Apply for Dubai mortgage online in 3 simple steps. Get pre-approved in 24 hours for villas, apartments & investment properties. UAE residents & non-residents welcome.',
  keywords: 'Dubai mortgage application, UAE home loan, mortgage pre-approval Dubai, property financing UAE, villa mortgage Dubai, apartment loan, investment property mortgage, mortgage broker Dubai',
  authors: [{ name: 'Neon Mortgage' }],
  creator: 'Neon Mortgage',
  publisher: 'Neon Mortgage',
  metadataBase: new URL('https://neonmortgage.com'),
  alternates: {
    canonical: '/get-mortgage',
  },
  openGraph: {
    title: 'Dubai Mortgage Application - Get Pre-Approved Today | Neon Mortgage',
    description: 'Apply for Dubai mortgage online in 3 simple steps. Get pre-approved in 24 hours for villas, apartments & investment properties. UAE residents & non-residents welcome.',
    url: '/get-mortgage',
    siteName: 'Neon Mortgage',
    images: [
      {
        url: 'https://neonmortgage.com/assets/images/og-mortgage-application.jpg',
        width: 1200,
        height: 630,
        alt: 'Dubai Mortgage Application - Neon Mortgage',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dubai Mortgage Application - Get Pre-Approved Today',
    description: 'Apply for Dubai mortgage online in 3 simple steps. Get pre-approved in 24 hours for villas, apartments & investment properties.',
    images: ['https://neonmortgage.com/assets/images/og-mortgage-application.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Dubai Mortgage Application',
            description: 'Online mortgage application for Dubai properties. Get pre-approved in 24 hours for villas, apartments, and investment properties.',
            url: 'https://neonmortgage.com/get-mortgage',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web Browser',
            provider: {
              '@type': 'FinancialService',
              name: 'Neon Mortgage',
              url: 'https://neonmortgage.com',
              logo: 'https://neonmortgage.com/assets/images/logo.png',
              telephone: '+971-58-800-2132',
              email: 'info@neonmortgage.com',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'AE',
                addressRegion: 'Dubai',
                addressLocality: 'Dubai',
              }
            },
            offers: {
              '@type': 'Offer',
              description: 'Free mortgage pre-approval with competitive rates',
              price: '0',
              priceCurrency: 'AED',
              availability: 'https://schema.org/InStock',
              validFrom: '2025-01-01',
              serviceOutput: {
                '@type': 'Service',
                name: 'Mortgage Pre-Approval Certificate'
              }
            },
            audience: {
              '@type': 'Audience',
              audienceType: ['UAE Residents', 'Non-Residents', 'Property Investors']
            }
          })
        }}
      />
      <div className="landing-wrapper">
        <SessionWarning />
        {children}
      </div>
    </>
  );
}