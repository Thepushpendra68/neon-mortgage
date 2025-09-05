'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';
import { getBudgetRanges } from '@/utils/currencyUtils';

export default function PurchaseStep4() {
  const [selectedOption, setSelectedOption] = useState('');
  const [loanType, setLoanType] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
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
    if (!savedLoanType || savedLoanType !== 'new-purchase' || !savedPropertyStatus || !savedPropertyType) {
      router.push('/get-mortgage/step1');
      return;
    }
    setLoanType(savedLoanType);
    
    // Set budget options after component mounts to avoid hydration errors
    setOptions(getBudgetRanges());
    setIsLoaded(true);
    
    // Update session progress
    updateLandingSession(5);
  }, [router, pathname]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('budgetRange', optionId);
      router.push('/get-mortgage/purchase/step5');
    }, 300);
  };

  if (!loanType || !isLoaded) {
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
        💰 Budget Optimizer • Find the perfect property within your range
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={5} branch="new-purchase" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          What&apos;s your budget range?
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
        onClick={() => router.push('/get-mortgage/purchase/step3')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}