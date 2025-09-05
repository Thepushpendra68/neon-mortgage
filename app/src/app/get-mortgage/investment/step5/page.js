'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function InvestmentStep5() {
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
    const savedInvestmentBudget = localStorage.getItem('investmentBudget');
    if (!savedLoanType || savedLoanType !== 'investment' || !savedInvestmentBudget) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(6);
  }, [router, pathname]);

  const options = [
    { id: 'uae-resident-employee', title: 'UAE Resident Employee', description: 'Salaried with Emirates ID' },
    { id: 'uae-national', title: 'UAE National', description: 'Emirati citizen' },
    { id: 'expat-work-visa', title: 'Expat on work visa', description: 'Foreign national with work permit' },
    { id: 'self-employed', title: 'Self-employed', description: 'Business owner or freelancer' }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('employmentStatus', optionId);
      updateLandingSession(6);
      router.push('/get-mortgage/investment/step6');
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
        💼 Employment Verified • All employment types welcomed
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={6} branch="investment" />
        <h1 className="question-text text-center mb-4">What&apos;s your employment status?</h1>
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

      <button onClick={() => router.push('/get-mortgage/investment/step4')} className="btn-back">← Back</button>
      <LandingFooter />
    </div>
  );
}
