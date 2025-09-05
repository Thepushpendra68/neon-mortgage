'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';
import { getInvestmentBudgetRanges } from '@/utils/currencyUtils';

export default function InvestmentStep4() {
  const [selectedOption, setSelectedOption] = useState('');
  const [loanType, setLoanType] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { step, loanType: requiredLoanType } = getStepRequirements(pathname);
    const validation = validateLandingSession(step, requiredLoanType);
    if (!validation.valid) {
      router.push('/get-mortgage');
      return;
    }

    const savedLoanType = localStorage.getItem('loanType');
    const savedInvestorExperience = localStorage.getItem('investorExperience');
    if (!savedLoanType || savedLoanType !== 'investment' || !savedInvestorExperience) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    updateLandingSession(5);
  }, [router, pathname]);

  const options = getInvestmentBudgetRanges();

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('investmentBudget', optionId);
      updateLandingSession(5);
      router.push('/get-mortgage/investment/step5');
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
        🚀 Dubai property up 12% this year • Don&apos;t miss out
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={5} branch="investment" />
        <h1 className="question-text text-center mb-4">What&apos;s your investment budget?</h1>
        <div className="option-cards-container">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`option-card ${selectedOption === option.id ? 'selected' : ''}`}
              aria-label={`${option.title} - ${option.description}`}
            >
              <div className="card-title">{option.title}</div>
              <div className="card-description">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => router.push('/get-mortgage/investment/step3')} className="btn-back">← Back</button>
      <LandingFooter />
    </div>
  );
}
