'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function InvestmentStep3() {
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
    if (!savedLoanType || savedLoanType !== 'investment' || !savedResidencyStatus) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(4);
  }, [router, pathname]);

  const options = [
    {
      id: 'first-investment',
      title: 'First investment property',
      description: 'New to property investing'
    },
    {
      id: 'own-1-2',
      title: 'Own 1-2 properties',
      description: 'Some investment experience'
    },
    {
      id: 'own-3-plus',
      title: 'Own 3+ properties',
      description: 'Experienced investor'
    },
    {
      id: 'professional-investor',
      title: 'Professional investor',
      description: 'Real estate is my business'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('investorExperience', optionId);
      updateLandingSession(4);
      router.push('/get-mortgage/investment/step4');
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
        🏆 Investment Expert • 85% rental yield improvement track record
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={4} branch="investment" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          Investment property experience?
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
        onClick={() => router.push('/get-mortgage/investment/step2')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}