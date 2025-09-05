// Landing page session validation utility

// Generate a unique session token for the landing flow
export const generateLandingSession = () => {
  const sessionId = `landing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sessionData = {
    id: sessionId,
    startTime: Date.now(),
    currentStep: 0,
    isValid: true
  };
  
  localStorage.setItem('landingSession', JSON.stringify(sessionData));
  return sessionId;
};

// Validate if user has a valid session and can access the requested step
export const validateLandingSession = (requiredStep, requiredLoanType = null) => {
  try {
    // Always allow access to step 1 (entry point)
    if (requiredStep === 1) {
      return { valid: true };
    }
    
    const sessionData = JSON.parse(localStorage.getItem('landingSession'));
    
    if (!sessionData || !sessionData.isValid) {
      return { valid: false, reason: 'No valid session' };
    }
    
    // Check session timeout (30 minutes)
    const sessionAge = Date.now() - sessionData.startTime;
    if (sessionAge > 30 * 60 * 1000) {
      clearLandingSession();
      return { valid: false, reason: 'Session expired' };
    }
    
    // For step 2 (residency), just check if step 1 is completed
    if (requiredStep === 2) {
      const loanType = localStorage.getItem('loanType');
      if (!loanType) {
        return { valid: false, reason: 'Step 1 not completed' };
      }
      return { valid: true };
    }
    
    // For steps 3+, check basic prerequisites first
    if (requiredStep > 2) {
      const loanType = localStorage.getItem('loanType');
      const residencyStatus = localStorage.getItem('residencyStatus');
      
      if (!loanType || !residencyStatus) {
        return { valid: false, reason: 'Basic prerequisites not met' };
      }
      
      // Check loan type if specified (for flow-specific steps)
      if (requiredLoanType && loanType !== requiredLoanType) {
        return { valid: false, reason: 'Invalid loan type for this flow' };
      }
      
      // For flow-specific steps, check if the user has progressed through the basic flow
      if (requiredLoanType) {
        // Check if user has completed the basic flow (steps 1-2)
        if (sessionData.currentStep < 2) {
          return { valid: false, reason: 'Basic flow not completed' };
        }
        
        // Prevent skipping steps within the flow
        const expectedStep = requiredStep;
        if (sessionData.currentStep < expectedStep - 1) {
          return { valid: false, reason: 'Cannot skip steps' };
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Session validation error:', error);
    // If there's any error accessing localStorage, allow step 1
    if (requiredStep === 1) {
      return { valid: true };
    }
    return { valid: false, reason: 'Session validation error' };
  }
};

// Update session with current step progress
export const updateLandingSession = (currentStep) => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('landingSession'));
    if (sessionData && sessionData.isValid) {
      // Only update if the new step is higher than current
      sessionData.currentStep = Math.max(sessionData.currentStep, currentStep);
      sessionData.lastUpdated = Date.now();
      localStorage.setItem('landingSession', JSON.stringify(sessionData));
    }
  } catch (error) {
    console.error('Error updating landing session:', error);
  }
};

// Recover session data if possible
export const recoverLandingSession = () => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('landingSession'));
    if (sessionData && sessionData.isValid) {
      // Check if session is still valid
      const sessionAge = Date.now() - sessionData.startTime;
      if (sessionAge <= 30 * 60 * 1000) {
        return sessionData;
      }
    }
    return null;
  } catch (error) {
    console.error('Session recovery error:', error);
    return null;
  }
};

// Check if session is about to expire
export const checkSessionExpiry = () => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('landingSession'));
    if (sessionData) {
      const timeLeft = 30 * 60 * 1000 - (Date.now() - sessionData.startTime);
      if (timeLeft < 5 * 60 * 1000) { // 5 minutes warning
        return Math.ceil(timeLeft / 60000); // minutes remaining
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Clear the landing session
export const clearLandingSession = () => {
  try {
    localStorage.removeItem('landingSession');
    // Also clear landing-related keys to avoid stale PII
    const landingKeys = [
      'loanType',
      'propertyStatus',
      'propertyType',
      'budgetRange',
      'downPayment',
      'monthlyIncome',
      'employmentStatus',
      'monthlyIncomeRefinance',
      'refinanceReason',
      'currentRate',
      'remainingBalance',
      'propertyValue',
      'investmentGoal',
      'investorExperience',
      'investmentBudget',
      'investmentBudgetRange',
      'investmentHorizon',
      'investmentIncomeSource',
      'investmentFinancingStructure',
      'investmentDownPayment',
      'isUAEResident',
      'residencyStatus',
      'fullName',
      'email',
      'phoneNumber',
      'contactMethod',
      'bestTimeToCall',
      'applicationId'
    ];
    landingKeys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // noop
  }
};

// Check if user has an active landing session
export const hasActiveLandingSession = () => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('landingSession'));
    if (!sessionData || !sessionData.isValid) return false;
    
    // Check timeout
    const sessionAge = Date.now() - sessionData.startTime;
    if (sessionAge > 30 * 60 * 1000) {
      clearLandingSession();
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Get current session step
export const getCurrentSessionStep = () => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('landingSession'));
    return sessionData?.currentStep || 0;
  } catch (error) {
    return 0;
  }
};

// Map step numbers to their required previous steps
// Fixed step numbering: Step 1=Loan Type, Step 2=Residency, Step 3+=Flow-specific
export const getStepRequirements = (pathname) => {
  const stepMappings = {
    // Main flow
    '/get-mortgage/step1': { step: 1, loanType: null },
    '/get-mortgage/step2': { step: 2, loanType: null }, // UAE Residency question
    '/get-mortgage/step3': { step: 3, loanType: null },
    
    // Purchase flow (corrected step numbering)
    '/get-mortgage/purchase/step2': { step: 3, loanType: 'new-purchase' }, // Property Status
    '/get-mortgage/purchase/step3': { step: 4, loanType: 'new-purchase' }, // Property Type
    '/get-mortgage/purchase/step4': { step: 5, loanType: 'new-purchase' }, // Budget Range
    '/get-mortgage/purchase/step5': { step: 6, loanType: 'new-purchase' }, // Down Payment
    '/get-mortgage/purchase/step6': { step: 7, loanType: 'new-purchase' }, // Monthly Income
    '/get-mortgage/purchase/step7': { step: 8, loanType: 'new-purchase' }, // Employment Status
    '/get-mortgage/purchase/step8': { step: 9, loanType: 'new-purchase' }, // Contact Info (final step)
    '/get-mortgage/purchase/complete': { step: 9, loanType: 'new-purchase' },
    
    // Refinance flow (corrected step numbering)
    '/get-mortgage/refinance/step2': { step: 3, loanType: 'refinance' },
    '/get-mortgage/refinance/step3': { step: 4, loanType: 'refinance' },
    '/get-mortgage/refinance/step4': { step: 5, loanType: 'refinance' },
    '/get-mortgage/refinance/step5': { step: 6, loanType: 'refinance' },
    '/get-mortgage/refinance/step6': { step: 7, loanType: 'refinance' },
    '/get-mortgage/refinance/step7': { step: 8, loanType: 'refinance' }, // Contact Info (final step)
    '/get-mortgage/refinance/complete': { step: 8, loanType: 'refinance' },
    
    // Investment flow (corrected step numbering)
    '/get-mortgage/investment/step2': { step: 3, loanType: 'investment' },
    '/get-mortgage/investment/step3': { step: 4, loanType: 'investment' },
    '/get-mortgage/investment/step4': { step: 5, loanType: 'investment' },
    '/get-mortgage/investment/step5': { step: 6, loanType: 'investment' },
    '/get-mortgage/investment/step6': { step: 7, loanType: 'investment' },
    '/get-mortgage/investment/step7': { step: 8, loanType: 'investment' },
    '/get-mortgage/investment/step8': { step: 9, loanType: 'investment' },
    '/get-mortgage/investment/step9': { step: 10, loanType: 'investment' }, // Contact Info (final step)
    '/get-mortgage/investment/complete': { step: 10, loanType: 'investment' }
  };
  
  return stepMappings[pathname] || { step: 1, loanType: null };
};