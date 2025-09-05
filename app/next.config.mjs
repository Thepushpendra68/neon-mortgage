/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'neonmortgage.com',
            },
        ],
    },
    
    // SEO-friendly URL rewrites - /get-mortgage as primary entry point
    async rewrites() {
        return [
            // Keep get-mortgage as the SEO entry point (no rewrite)
            // All other URLs redirect to get-mortgage for SEO consolidation
        ];
    },

    // Redirect all other entry points to /get-mortgage for SEO consolidation
    async redirects() {
        return [
            // Primary redirects to consolidate SEO value
            {
                source: '/apply-now',
                destination: '/get-mortgage',
                permanent: true,
            },
            {
                source: '/start-application',
                destination: '/get-mortgage', 
                permanent: true,
            },
            {
                source: '/quick-approval',
                destination: '/get-mortgage',
                permanent: true,
            },
            
            // Intent-based URLs redirect to primary
            {
                source: '/buy-home',
                destination: '/get-mortgage',
                permanent: true,
            },
            {
                source: '/refinance-mortgage',
                destination: '/get-mortgage',
                permanent: true,
            },
            {
                source: '/investment-property', 
                destination: '/get-mortgage',
                permanent: true,
            },
            
            // Regional URLs redirect to primary
            {
                source: '/uae-mortgage',
                destination: '/get-mortgage',
                permanent: true,
            },
            {
                source: '/dubai-mortgage',
                destination: '/get-mortgage',
                permanent: true,
            },
            {
                source: '/home-loan-dubai',
                destination: '/get-mortgage',
                permanent: true,
            },
            {
                source: '/mortgage-calculator-uae',
                destination: '/get-mortgage',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
