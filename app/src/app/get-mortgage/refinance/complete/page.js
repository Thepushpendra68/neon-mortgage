'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, clearLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function RefinanceComplete() {
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
      router.push('/get-mortgage');
      return;
    }

    const loanType = localStorage.getItem('loanType');
    const fullName = localStorage.getItem('fullName');
    const email = localStorage.getItem('email');
    
    if (!loanType || loanType !== 'refinance' || !fullName || !email) {
      router.push('/get-mortgage');
      return;
    }
    
    // Collect all stored data for summary
    const collectedData = {
      loanType,
      refinanceReason: localStorage.getItem('refinanceReason'),
      currentRate: localStorage.getItem('currentRate'),
      remainingBalance: localStorage.getItem('remainingBalance'),
      propertyValue: localStorage.getItem('propertyValue'),
      monthlyIncomeRefinance: localStorage.getItem('monthlyIncomeRefinance'),
      fullName,
      email,
      phoneNumber: localStorage.getItem('phoneNumber'),
      contactMethod: localStorage.getItem('contactMethod')
    };
    
    setFormData(collectedData);
    setApplicationId(localStorage.getItem('applicationId') || '');
    setIsLoaded(true);
  }, [router, pathname]);

  const getDisplayText = (key, value) => {
    const displayMap = {
      refinanceReason: {
        'lower-rate': 'Want lower interest rate',
        'cash-out': 'Need cash out refinance',
        'switching-bank': 'Switching from another bank',
        'debt-consolidation': 'Consolidating debts'
      },
      currentRate: {
        'above-4': 'Above 4%',
        '3-5-to-4': '3.5% - 4%',
        '3-to-3-5': '3% - 3.5%',
        'below-3': 'Below 3%'
      },
      remainingBalance: {
        'under-500k': 'Under AED 500K',
        '500k-1m': 'AED 500K - 1M',
        '1m-2m': 'AED 1M - 2M',
        'above-2m': 'Above AED 2M'
      },
      propertyValue: {
        'under-1m': 'Under AED 1M',
        '1m-2m': 'AED 1M - 2M',
        '2m-5m': 'AED 2M - 5M',
        'above-5m': 'Above AED 5M'
      },
      monthlyIncomeRefinance: {
        'under-15k': 'Under AED 15K',
        '15k-30k': 'AED 15K - 30K',
        '30k-50k': 'AED 30K - 50K',
        'above-50k': 'Above AED 50K'
      }
    };
    
    return displayMap[key]?.[value] || value;
  };

  const getPotentialSavings = () => {
    const currentRate = formData.currentRate;
    const balance = formData.remainingBalance;
    
    if (currentRate === 'above-4' && (balance === '1m-2m' || balance === 'above-2m')) {
      return 'AED 2,000+ monthly';
    } else if (currentRate === '3-5-to-4') {
      return 'AED 1,000+ monthly';
    } else if (currentRate === '3-to-3-5') {
      return 'AED 500+ monthly';
    }
    return 'We\'ll calculate your exact savings';
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
          Let&apos;s Lower Your Payments!
        </h1>
        <p className="body-text-gray mb-8">
          We&apos;ll analyze your current mortgage and find better rates to save you money every month.
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

        {/* Potential Savings */}
        <div className="summary-box" style={{ background: '#e8f5e8', borderColor: '#4ade80' }}>
          <div className="body-text" style={{ fontWeight: '600', marginBottom: '8px', color: '#166534' }}>
            💰 Potential Monthly Savings:
          </div>
          <div className="heading-medium" style={{ color: '#166534', fontSize: '24px' }}>
            {getPotentialSavings()}
          </div>
        </div>

        {/* Next Steps */}
        <div className="summary-box">
          <div className="body-text" style={{ fontWeight: '600', marginBottom: '16px' }}>
            What Happens Next:
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="body-text" style={{ marginBottom: '8px' }}>
              ✓ Current mortgage analysis within 24 hours
            </div>
            <div className="body-text" style={{ marginBottom: '8px' }}>
              ✓ Rate comparison from multiple banks
            </div>
            <div className="body-text">
              ✓ Refinancing timeline and process guidance
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

            {/* Refinance Details */}
            <div className="summary-card" style={{
              background: 'var(--pure-white)',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                🔄 Refinance Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Refinance Reason:</strong> {getDisplayText('refinanceReason', formData.refinanceReason)}</div>
                <div><strong>Current Rate:</strong> {getDisplayText('currentRate', formData.currentRate)}</div>
                <div><strong>Remaining Balance:</strong> {getDisplayText('remainingBalance', formData.remainingBalance)}</div>
                <div><strong>Property Value:</strong> {getDisplayText('propertyValue', formData.propertyValue)}</div>
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
                <div><strong>Monthly Income:</strong> {getDisplayText('monthlyIncomeRefinance', formData.monthlyIncomeRefinance)}</div>
                <div><strong>Loan Type:</strong> {getDisplayText('loanType', formData.loanType)}</div>
                <div><strong>Residency:</strong> {formData.isUAEResident ? 'UAE Resident' : 'Non-UAE Resident'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: '40px', marginTop: '40px' }}>
          <Link href="/journey" className="btn-primary" style={{ marginRight: '16px', padding: '16px 32px' }}>
            Get My Savings Report
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
          Questions about refinancing? Call us at{" "}
          <span style={{ color: 'var(--primary-black)', fontWeight: '600' }}>+971 58 800 2132</span>
        </p>
      </div>

      <LandingFooter />
    </div>
  );
}