'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateLandingSession } from '@/utils/landingSession';

export default function Step3() {
  const router = useRouter();

  useEffect(() => {
    // Validate that user has completed steps 1 and 2
    const validation = validateLandingSession(3);
    if (!validation.valid) {
      router.push('/get-mortgage');
      return;
    }

    // Get loan type and residency status from localStorage
    const loanType = localStorage.getItem('loanType');
    const residencyStatus = localStorage.getItem('residencyStatus');
    
    if (!loanType || !residencyStatus) {
      router.push('/get-mortgage/step1');
      return;
    }

    // Redirect to appropriate flow based on loan type
    // Note: Now correctly routes to step2 in each flow (which is step3 in the overall sequence)
    switch (loanType) {
      case 'new-purchase':
        router.push('/get-mortgage/purchase/step2'); // Fixed: now correctly routes to purchase step2
        break;
      case 'refinance':
        router.push('/get-mortgage/refinance/step2'); // Fixed: now correctly routes to refinance step2
        break;
      case 'investment':
        router.push('/get-mortgage/investment/step2'); // Fixed: now correctly routes to investment step2
        break;
      default:
        router.push('/get-mortgage/step1');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pure-white)' }}>
      <div className="heading-medium">Redirecting...</div>
    </div>
  );
}