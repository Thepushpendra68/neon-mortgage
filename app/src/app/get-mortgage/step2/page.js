'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { updateLandingSession } from '@/utils/landingSession';

export default function Step2() {
  const [selectedOption, setSelectedOption] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mark as client-side to prevent SSR issues
    setIsClient(true);
    
    // Only validate session on client-side to prevent SSR redirects
    if (typeof window !== 'undefined') {
      // Check if user has completed step 1 (loan type selection)
      const savedLoanType = localStorage.getItem('loanType');
      if (!savedLoanType) {
        router.push('/get-mortgage/step1');
        return;
      }
      
      // Update session progress
      updateLandingSession(2);
    }
  }, [router]);

  // Show loading until client-side hydration
  if (!isClient) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--pure-white)' }}>
        <LandingHeader />
        <div className="page-container">
          <div className="text-center mt-20">Loading...</div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const options = [
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

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    // Auto-advance after selection with micro-interaction
    setTimeout(() => {
      const isUAEResident = optionId === 'uae-resident';
      localStorage.setItem('isUAEResident', isUAEResident.toString());
      localStorage.setItem('residencyStatus', optionId);
      
      // Update session progress for next step
      updateLandingSession(2);
      
      // Branch routing logic based on loan type
      const loanType = localStorage.getItem('loanType');
      let nextRoute = '';
      switch(loanType) {
        case 'new-purchase':
          nextRoute = '/get-mortgage/purchase/step2'; // Fixed: now correctly routes to purchase step2
          break;
        case 'refinance':
          nextRoute = '/get-mortgage/refinance/step2'; // Fixed: now correctly routes to refinance step2
          break;
        case 'investment':
          nextRoute = '/get-mortgage/investment/step2'; // Fixed: now correctly routes to investment step2
          break;
        default:
          nextRoute = '/get-mortgage/step3'; // fallback
      }
      
      router.push(nextRoute);
    }, 300);
  };

  return (
    <div className="min-h-screen page-enter" style={{ background: 'var(--pure-white)' }}>
      {/* Trust Banner */}
      <div className="trust-banner">
        🛡️ Privacy Protected • We never share your information with third parties
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={2} totalSteps={4} />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          Are you a UAE resident?
        </h1>
        
        <p className="body-text-gray text-center mb-8">
          This ensures we provide you with accurate rates and terms for your situation
        </p>
        
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
        onClick={() => router.push('/get-mortgage/step1')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}