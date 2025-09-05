'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function PurchaseStep5() {
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
    const savedPropertyStatus = localStorage.getItem('propertyStatus');
    const savedPropertyType = localStorage.getItem('propertyType');
    const savedBudgetRange = localStorage.getItem('budgetRange');
    if (!savedLoanType || savedLoanType !== 'new-purchase' || !savedPropertyStatus || !savedPropertyType || !savedBudgetRange) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(6);
  }, [router, pathname]);

  const options = [
    {
      id: '10-percent',
      title: '10%',
      description: 'Minimum for UAE residents'
    },
    {
      id: '20-25-percent',
      title: '20-25%',
      description: 'Standard down payment'
    },
    {
      id: '30-plus-percent',
      title: '30% or more',
      description: 'Lower monthly payments'
    },
    {
      id: 'need-guidance',
      title: 'I need guidance',
      description: 'Help me decide the best option'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('downPayment', optionId);
      router.push('/get-mortgage/purchase/step6');
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
        🏦 Down Payment Expert • Flexible options for all budgets
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={6} branch="new-purchase" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          How much can you put down?
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
        onClick={() => router.push('/get-mortgage/purchase/step4')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}