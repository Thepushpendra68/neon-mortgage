'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';

export default function Complete() {
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const loanType = localStorage.getItem('loanType');
    const propertyStatus = localStorage.getItem('propertyStatus');
    const propertyType = localStorage.getItem('propertyType');
    
    if (!loanType || !propertyStatus || !propertyType) {
      router.push('/get-mortgage/step1');
      return;
    }
    
    setFormData({
      loanType,
      propertyStatus,
      propertyType
    });
  }, [router]);

  const getDisplayText = (key, value) => {
    const displayMap = {
      loanType: {
        'new-purchase': 'New Purchase',
        'refinance': 'Refinance'
      },
      propertyStatus: {
        'browsing': 'Just browsing',
        'looking': 'Actively searching',
        'found': 'Found my home'
      },
      propertyType: {
        'villa': 'Villa',
        'apartment': 'Apartment',
        'undecided': 'Not sure yet'
      }
    };
    
    return displayMap[key]?.[value] || value;
  };

  const handleStartOver = () => {
    localStorage.clear();
    router.push('/get-mortgage');
  };

  if (!formData.loanType) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pure-white)' }}>
        <div className="heading-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter" style={{ background: 'var(--pure-white)' }}>
      <LandingHeader />

      <div className="completion-container">
        {/* Success Icon */}
        <div className="success-icon">
          <svg width="28" height="28" fill="none" stroke="var(--pure-white)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="heading-medium mb-6">
          Application Started!
        </h1>
        <p className="body-text-gray mb-8">
          We&apos;ll contact you within 24 hours with personalized mortgage options.
        </p>

        {/* Summary */}
        <div className="summary-box">
          <div className="body-text" style={{ fontWeight: '600', marginBottom: '12px' }}>
            Your Selections:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <span className="body-text" style={{ 
              background: 'var(--pure-white)', 
              padding: '6px 14px', 
              borderRadius: '16px',
              fontSize: '14px',
              border: '1px solid #E5E5E5'
            }}>
              <strong>Service:</strong> {getDisplayText('loanType', formData.loanType)}
            </span>
            <span className="body-text" style={{ 
              background: 'var(--pure-white)', 
              padding: '6px 14px', 
              borderRadius: '16px',
              fontSize: '14px',
              border: '1px solid #E5E5E5'
            }}>
              <strong>Status:</strong> {getDisplayText('propertyStatus', formData.propertyStatus)}
            </span>
            <span className="body-text" style={{ 
              background: 'var(--pure-white)', 
              padding: '6px 14px', 
              borderRadius: '16px',
              fontSize: '14px',
              border: '1px solid #E5E5E5'
            }}>
              <strong>Type:</strong> {getDisplayText('propertyType', formData.propertyType)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/journey" className="btn-primary" style={{ marginRight: '16px', padding: '16px 32px' }}>
            Continue to Full Application
          </Link>
          <button 
            onClick={handleStartOver}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--dark-gray)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
          >
            Start over
          </button>
        </div>

        {/* Contact */}
        <p className="body-text" style={{ fontSize: '14px', color: 'var(--dark-gray)' }}>
          Need immediate assistance? Call us at{" "}
          <span style={{ color: 'var(--primary-black)', fontWeight: '600' }}>+971 58 800 2132</span>
        </p>
      </div>

      <LandingFooter />
    </div>
  );
}