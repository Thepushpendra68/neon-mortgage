'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function RefinanceStep2() {
  const [selectedOption, setSelectedOption] = useState('');
  const [loanType, setLoanType] = useState('');
  const [showResidencyStep, setShowResidencyStep] = useState(true);
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
    
    if (!savedLoanType || savedLoanType !== 'refinance') {
      router.push('/get-mortgage/step1');
      return;
    }
    
    setLoanType(savedLoanType);
    
    // If residency is already set, show refinance questions, otherwise show residency questions
    if (savedResidencyStatus) {
      setShowResidencyStep(false);
      // Update session progress for refinance step
      updateLandingSession(3);
    } else {
      setShowResidencyStep(true);
      // Update session progress for residency step
      updateLandingSession(2);
    }
  }, [router, pathname]);

  const residencyOptions = [
    {
      id: 'uae-resident',
      title: 'Yes, I am a UAE resident',
      description: 'I have Emirates ID or UAE residency visa'
    },
    {
      id: 'non-resident',
      title: 'No, I am not a UAE resident',
      description: 'I am planning to move or invest from abroad'
    }
  ];

  const refinanceOptions = [
    {
      id: 'lower-rate',
      title: 'Want lower interest rate',
      description: 'Reduce my monthly payments'
    },
    {
      id: 'cash-out',
      title: 'Need cash out refinance',
      description: 'Access equity for other needs'
    },
    {
      id: 'switching-bank',
      title: 'Switching from another bank',
      description: 'Better service or terms'
    },
    {
      id: 'debt-consolidation',
      title: 'Consolidating debts',
      description: 'Combine multiple loans'
    }
  ];

  const options = showResidencyStep ? residencyOptions : refinanceOptions;

  const handleResidencySelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      const isUAEResident = optionId === 'uae-resident';
      localStorage.setItem('isUAEResident', isUAEResident.toString());
      localStorage.setItem('residencyStatus', optionId);
      updateLandingSession(2);
      // Show refinance questions next
      setShowResidencyStep(false);
      setSelectedOption(''); // Reset selection for refinance step
    }, 300);
  };

  const handleRefinanceSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('refinanceReason', optionId);
      updateLandingSession(3);
      router.push('/get-mortgage/refinance/step3');
    }, 300);
  };

  const handleOptionSelect = (optionId) => {
    if (showResidencyStep) {
      handleResidencySelect(optionId);
    } else {
      handleRefinanceSelect(optionId);
    }
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
        {showResidencyStep 
          ? '🛡️ Privacy Protected • We never share your information with third parties'
          : '💡 Rate Optimizer • Find better deals than your current bank'
        }
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar 
          currentStep={showResidencyStep ? 2 : 3} 
          branch="refinance" 
        />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          {showResidencyStep 
            ? 'Are you a UAE resident?'
            : 'Tell us about your current mortgage'
          }
        </h1>
        
        {showResidencyStep && (
          <p className="body-text-gray text-center mb-8">
            This ensures we provide you with accurate rates and terms for your situation
          </p>
        )}
        
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
        onClick={() => {
          if (showResidencyStep) {
            router.push('/get-mortgage/step1');
          } else {
            // Go back to residency step
            setShowResidencyStep(true);
            setSelectedOption('');
          }
        }}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}