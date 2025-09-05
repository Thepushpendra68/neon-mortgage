'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { updateLandingSession } from '@/utils/landingSession';

export default function Step1() {
  const [selectedOption, setSelectedOption] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mark as client-side to prevent SSR issues
    setIsClient(true);
    
    // Step 1 is always accessible as entry point - no validation needed
    // Just update session progress when mounted
    if (typeof window !== 'undefined') {
      updateLandingSession(1);
    }
  }, []);

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
      id: 'new-purchase',
      title: 'New Purchase',
      description: 'I want to buy a new property'
    },
    {
      id: 'refinance',
      title: 'Refinance',
      description: 'I want to refinance my existing mortgage'
    },
    {
      id: 'investment',
      title: 'Investment Property',
      description: 'I want to buy an investment property'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    // Auto-advance after selection with micro-interaction
    setTimeout(() => {
      localStorage.setItem('loanType', optionId);
      
      // Update session progress
      updateLandingSession(2);
      
      // All flows now go to residency question first
      router.push('/get-mortgage/step2');
    }, 300);
  };

  return (
    <div className="min-h-screen page-enter" style={{ background: 'var(--pure-white)' }}>
      {/* Trust Banner */}
      <div className="trust-banner">
        🔒 Secured Application • Your data is protected with bank-level encryption
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={1} totalSteps={4} />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          What type of mortgage do you need?
        </h1>
        <p className="body-text-gray text-center mb-8">
          Choose the option that best describes your mortgage needs
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
        onClick={() => router.push('/get-mortgage')}
        className="btn-back"
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}