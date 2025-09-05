'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function PurchaseStep2() {
  const [selectedOption, setSelectedOption] = useState('');
  const [loanType, setLoanType] = useState('');
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

    const savedLoanType = localStorage.getItem('loanType');
    if (!savedLoanType || savedLoanType !== 'new-purchase') {
      router.push('/get-mortgage');
      return;
    }
    
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(3);
  }, [router, pathname]);

  const options = [
    {
      id: 'browsing',
      title: 'Just browsing',
      description: 'I\'m exploring my options'
    },
    {
      id: 'looking',
      title: 'Actively searching',
      description: 'I\'m viewing properties'
    },
    {
      id: 'found',
      title: 'Found my home',
      description: 'I have a specific property in mind'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('propertyStatus', optionId);
      // Update session progress for next step
      updateLandingSession(3);
      router.push('/get-mortgage/purchase/step3');
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
        🏠 Property Expert • Approved for 95% of Dubai developments
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={3} branch="new-purchase" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          Have you found a property already?
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
        onClick={() => router.push('/get-mortgage/step2')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}