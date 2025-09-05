'use client';

import Link from "next/link";
import { useEffect } from 'react';
import './get-mortgage.css';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { generateLandingSession, clearLandingSession } from '@/utils/landingSession';
import { clearResidencyStatus } from '@/utils/currencyUtils';

export default function Landing() {
  useEffect(() => {
    try {
      // Clear any existing landing session and start fresh
      clearLandingSession();
      clearResidencyStatus();
      
      // Generate new session
      const sessionId = generateLandingSession();
      console.log('New landing session created:', sessionId);
    } catch (error) {
      console.error('Error initializing landing session:', error);
    }
  }, []);
  return (
    <div className="min-h-screen" style={{ background: 'var(--pure-white)' }}>
      <LandingHeader />

      {/* Hero Section */}
      <div className="hero-container" style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
        position: 'relative'
      }}>
        <h1 className="heading-large mb-6">
          Get Your Dubai Mortgage<br/>
          <span style={{ color: '#d97706' }}>Pre-Approved</span> Today
        </h1>
        
        <div style={{ marginBottom: '40px' }}>
          <p className="body-text-gray mb-8">
            Apply online in a few simple steps.
          </p>
        </div>
        
        {/* Key Benefits */}
        <div style={{ marginBottom: '48px' }}>
          <div className="body-text" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" fill="#22c55e" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              24-Hour Pre-Approval
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" fill="#22c55e" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              🏦 Best UAE Bank Rates
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" fill="#22c55e" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              Non-Residents Welcome
            </span>
          </div>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <Link 
            href="/get-mortgage/step1" 
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #d97706 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)'
            }}
          >
            Start Your Mortgage Application
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div>
          <p className="body-text" style={{ fontSize: '14px', color: 'var(--dark-gray)' }}>
            Trusted by 500+ Dubai property buyers with 24-hour approvals for villas, apartments & investment properties.
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}