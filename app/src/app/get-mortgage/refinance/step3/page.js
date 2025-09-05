'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function RefinanceStep3() {
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
    const savedResidencyStatus = localStorage.getItem('residencyStatus');
    if (!savedLoanType || savedLoanType !== 'refinance' || !savedResidencyStatus) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(4);
  }, [router, pathname]);

  const options = [
    {
      id: 'above-4',
      title: 'Above 4%',
      description: 'Significant savings potential'
    },
    {
      id: '3-5-to-4',
      title: '3.5% - 4%',
      description: 'Good refinance opportunity'
    },
    {
      id: '3-to-3-5',
      title: '3% - 3.5%',
      description: 'Moderate savings possible'
    },
    {
      id: 'below-3',
      title: 'Below 3%',
      description: 'Already have a great rate'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('currentRate', optionId);
      updateLandingSession(4);
      router.push('/get-mortgage/refinance/step4');
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
        📉 Rates at 3-month low • Perfect time to refinance
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={4} branch="refinance" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          What&apos;s your current interest rate?
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
        onClick={() => router.push('/get-mortgage/refinance/step2')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}