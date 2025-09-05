'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, clearLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function PurchaseComplete() {
  const [formData, setFormData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Validate session for this step
    const { step, loanType: requiredLoanType } = getStepRequirements(pathname);
    const validation = validateLandingSession(step, requiredLoanType);
    
    if (!validation.valid) {
      console.log('Session validation failed:', validation.reason);
      router.push('/get-mortgage');
      return;
    }

    const loanType = localStorage.getItem('loanType');
    const fullName = localStorage.getItem('fullName');
    const email = localStorage.getItem('email');
    const storedApplicationId = localStorage.getItem('applicationId');
    
    if (!loanType || loanType !== 'new-purchase' || !fullName || !email) {
      router.push('/get-mortgage');
      return;
    }
    
    // Collect all stored data for summary
    const collectedData = {
      loanType,
      propertyStatus: localStorage.getItem('propertyStatus'),
      propertyType: localStorage.getItem('propertyType'),
      budgetRange: localStorage.getItem('budgetRange'),
      downPayment: localStorage.getItem('downPayment'),
      monthlyIncome: localStorage.getItem('monthlyIncome'),
      employmentStatus: localStorage.getItem('employmentStatus'),
      fullName,
      email,
      phoneNumber: localStorage.getItem('phoneNumber'),
      contactMethod: localStorage.getItem('contactMethod')
    };
    
    // Debug logging to see what data is available
    console.log('🔍 Completion Page - Collected Data:', collectedData);
    console.log('🔍 Completion Page - Application ID:', storedApplicationId);
    console.log('🔍 Completion Page - All localStorage keys:', Object.keys(localStorage));
    console.log('🔍 Completion Page - Required fields check:', {
      loanType: !!loanType,
      isUAEResident: !!localStorage.getItem('isUAEResident'),
      residencyStatus: !!localStorage.getItem('residencyStatus'),
      fullName: !!fullName,
      email: !!email,
      phoneNumber: !!localStorage.getItem('phoneNumber')
    });
    
    setFormData(collectedData);
    setApplicationId(storedApplicationId || '');
    setIsLoaded(true);
  }, [router, pathname]);

  const getDisplayText = (key, value) => {
    const displayMap = {
      propertyStatus: {
        'browsing': 'Just browsing',
        'looking': 'Actively searching',
        'found': 'Found my home'
      },
      propertyType: {
        'villa': 'Villa',
        'apartment': 'Apartment',
        'townhouse': 'Townhouse',
        'not-sure': 'Not sure yet'
      },
      budgetRange: {
        'under-1m': 'Under AED 1M',
        '1m-2m': 'AED 1M - 2M',
        '2m-5m': 'AED 2M - 5M',
        'above-5m': 'Above AED 5M'
      },
      downPayment: {
        '10-percent': '10%',
        '20-25-percent': '20-25%',
        '30-plus-percent': '30% or more',
        'need-guidance': 'Need guidance'
      },
      monthlyIncome: {
        'under-15k': 'Under AED 15K',
        '15k-30k': 'AED 15K - 30K',
        '30k-50k': 'AED 30K - 50K',
        'above-50k': 'Above AED 50K'
      },
      employmentStatus: {
        'uae-resident-employee': 'UAE Resident Employee',
        'uae-national': 'UAE National',
        'expat-work-visa': 'Expat on work visa',
        'self-employed': 'Self-employed'
      }
    };
    
    return displayMap[key]?.[value] || value;
  };

  const handleStartOver = () => {
    localStorage.clear();
    clearLandingSession();
    router.push('/get-mortgage');
  };

  if (!isLoaded) {
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
          Ready to Find Your Dream Home!
        </h1>
        <p className="body-text-gray mb-4">
          We&apos;ll help you get pre-approved and connect you with top real estate agents in Dubai.
        </p>
        
        {/* Enhanced Application ID Section */}
        {applicationId && (
          <div className="application-id-section" style={{ 
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)', 
            padding: '24px', 
            borderRadius: '16px', 
            marginBottom: '32px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(30, 64, 175, 0.2)'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              🎯 Your Application ID
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              fontFamily: 'monospace',
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {applicationId}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              ✓ Application submitted successfully • Email confirmation sent
            </div>
          </div>
        )}

        {/* Direct Call CTA */}
        <div className="call-cta-section" style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
            📞 Need Immediate Assistance?
          </div>
          <div style={{ marginBottom: '16px' }}>
            <a 
              href="tel:+971588002132"
              className="btn-primary"
              style={{
                background: '#f59e0b',
                border: 'none',
                padding: '16px 32px',
                fontSize: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Call Now: +971 58 800 2132
            </a>
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            Available 24/7 • Free consultation
          </div>
        </div>

        {/* Next Steps */}
        <div className="summary-box">
          <div className="body-text" style={{ fontWeight: '600', marginBottom: '16px' }}>
            What Happens Next:
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="body-text" style={{ marginBottom: '8px' }}>
              ✓ Pre-approval letter within 24 hours
            </div>
            <div className="body-text" style={{ marginBottom: '8px' }}>
              ✓ Property search assistance from top agents
            </div>
            <div className="body-text">
              ✓ Bank rate comparison and best offers
            </div>
          </div>
        </div>

        {/* Complete Application Summary */}
        <div className="complete-summary-section" style={{ marginBottom: '32px', marginTop: '24px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            📋 Complete Application Summary
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Personal Information */}
            <div className="summary-card" style={{
              background: 'var(--pure-white)',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                👤 Personal Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Name:</strong> {formData.fullName}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Phone:</strong> {formData.phoneNumber}</div>
                <div><strong>Contact Method:</strong> {formData.contactMethod}</div>
                <div><strong>Best Time:</strong> {formData.bestTimeToCall}</div>
              </div>
            </div>

            {/* Mortgage Details */}
            <div className="summary-card" style={{
              background: 'var(--pure-white)',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                🏠 Mortgage Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Loan Type:</strong> {getDisplayText('loanType', formData.loanType)}</div>
                <div><strong>Property Status:</strong> {getDisplayText('propertyStatus', formData.propertyStatus)}</div>
                <div><strong>Property Type:</strong> {getDisplayText('propertyType', formData.propertyType)}</div>
                <div><strong>Budget Range:</strong> {getDisplayText('budgetRange', formData.budgetRange)}</div>
                <div><strong>Down Payment:</strong> {getDisplayText('downPayment', formData.downPayment)}</div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="summary-card" style={{
              background: 'var(--pure-white)',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                💰 Financial Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Monthly Income:</strong> {getDisplayText('monthlyIncome', formData.monthlyIncome)}</div>
                <div><strong>Employment Status:</strong> {getDisplayText('employmentStatus', formData.employmentStatus)}</div>
                <div><strong>Residency:</strong> {formData.isUAEResident ? 'UAE Resident' : 'Non-UAE Resident'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: '40px', marginTop: '40px' }}>
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
          Questions? Call us at{" "}
          <span style={{ color: 'var(--primary-black)', fontWeight: '600' }}>+971 58 800 2132</span>
        </p>
      </div>

      <LandingFooter />
    </div>
  );
}