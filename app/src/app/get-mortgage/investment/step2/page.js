'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';

export default function InvestmentStep2() {
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
    
    if (!savedLoanType || savedLoanType !== 'investment') {
      router.push('/get-mortgage/step1');
      return;
    }
    
    setLoanType(savedLoanType);
    
    // If residency is already set, show investment questions, otherwise show residency questions
    if (savedResidencyStatus) {
      setShowResidencyStep(false);
      // Update session progress for investment step
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

  const investmentOptions = [
    {
      id: 'rental-income',
      title: 'Rental income',
      description: 'Generate monthly rental returns'
    },
    {
      id: 'capital-appreciation',
      title: 'Capital appreciation',
      description: 'Long-term property value growth'
    },
    {
      id: 'both-returns',
      title: 'Both rental and appreciation',
      description: 'Maximize overall returns'
    },
    {
      id: 'short-term-flip',
      title: 'Short-term flip',
      description: 'Buy, renovate, and resell'
    }
  ];

  const options = showResidencyStep ? residencyOptions : investmentOptions;

  const handleResidencySelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      const isUAEResident = optionId === 'uae-resident';
      localStorage.setItem('isUAEResident', isUAEResident.toString());
      localStorage.setItem('residencyStatus', optionId);
      updateLandingSession(2);
      // Show investment questions next
      setShowResidencyStep(false);
      setSelectedOption(''); // Reset selection for investment step
    }, 300);
  };

  const handleInvestmentSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      localStorage.setItem('investmentGoal', optionId);
      updateLandingSession(3);
      router.push('/get-mortgage/investment/step3');
    }, 300);
  };

  const handleOptionSelect = (optionId) => {
    if (showResidencyStep) {
      handleResidencySelect(optionId);
    } else {
      handleInvestmentSelect(optionId);
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
          : '📈 Investment Calculator • ROI projections included'
        }
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar 
          currentStep={showResidencyStep ? 2 : 3} 
          branch="investment" 
        />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          {showResidencyStep 
            ? 'Are you a UAE resident?'
            : 'What\'s your investment goal?'
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