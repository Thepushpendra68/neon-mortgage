'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function RefinanceStep6() {
  const [selectedOption, setSelectedOption] = useState('');
  const [loanType, setLoanType] = useState('');
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
    const savedLoanType = localStorage.getItem('loanType');
    const savedPropertyValue = localStorage.getItem('propertyValue');
    if (!savedLoanType || savedLoanType !== 'refinance' || !savedPropertyValue) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(7);
  }, [router, pathname]);

  const options = [
    {
      id: 'under-15k',
      title: 'Under AED 15K',
      description: 'Entry-level income range'
    },
    {
      id: '15k-30k',
      title: 'AED 15K - 30K',
      description: 'Mid-level income range'
    },
    {
      id: '30k-50k',
      title: 'AED 30K - 50K',
      description: 'High income range'
    },
    {
      id: 'above-50k',
      title: 'Above AED 50K',
      description: 'Premium income range'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('monthlyIncomeRefinance', optionId);
      updateLandingSession(7);
      router.push('/get-mortgage/refinance/step7');
    }, 300);
  };

  if (!loanType) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pure-white)' }}>
        <div className="heading-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter" style={{ background: 'var(--pure-white)' }}>
      {/* Trust Banner */}
      <div className="trust-banner">
        💰 Income Verification • Secure better terms with confidence
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={7} branch="refinance" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          What&apos;s your monthly income?
        </h1>
        
        {/* Options */}
        <div className="option-cards-container">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`option-card ${selectedOption === option.id ? 'selected' : ''}`}
              aria-label={`${option.title} - ${option.description}`}
            >
              <div className="card-title">
                {option.title}
              </div>
              <div className="card-description">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/get-mortgage/refinance/step5')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}