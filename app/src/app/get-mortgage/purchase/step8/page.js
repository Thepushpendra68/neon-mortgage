'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { validateLandingSession, updateLandingSession, getStepRequirements } from '@/utils/landingSession';
import { API_ENDPOINTS } from '@/utils/apiConfig';

export default function PurchaseStep8() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    contactMethod: 'email',
    bestTimeToCall: 'morning'
  });
  const [loanType, setLoanType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const savedPropertyStatus = localStorage.getItem('propertyStatus');
    const savedPropertyType = localStorage.getItem('propertyType');
    const savedBudgetRange = localStorage.getItem('budgetRange');
    const savedDownPayment = localStorage.getItem('downPayment');
    const savedMonthlyIncome = localStorage.getItem('monthlyIncome');
    const savedEmploymentStatus = localStorage.getItem('employmentStatus');
    if (!savedLoanType || savedLoanType !== 'new-purchase' || !savedPropertyStatus || !savedPropertyType || !savedBudgetRange || !savedDownPayment || !savedMonthlyIncome || !savedEmploymentStatus) {
      router.push('/get-mortgage/step1');
      return;
    }
    
    setLoanType(savedLoanType);
    // Update session progress
    updateLandingSession(9);
  }, [router, pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Collect all form data from localStorage and current form
      const applicationData = {
        // Step 1 data
        loanType: localStorage.getItem('loanType'),
        
        // Step 2 data (UAE residency - REQUIRED for SecureLandingApplication)
        isUAEResident: localStorage.getItem('isUAEResident') === 'true',
        residencyStatus: localStorage.getItem('residencyStatus'),
        
        // Step 3-7 data
        propertyStatus: localStorage.getItem('propertyStatus'),
        propertyType: localStorage.getItem('propertyType'),
        budgetRange: localStorage.getItem('budgetRange'),
        downPayment: localStorage.getItem('downPayment'),
        monthlyIncome: localStorage.getItem('monthlyIncome'),
        employmentStatus: localStorage.getItem('employmentStatus'),
        
        // Step 8 data (current form)
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        contactMethod: formData.contactMethod,
        bestTimeToCall: formData.bestTimeToCall
      };

      // Debug logging to check data
      console.log('🔍 Application Data being submitted:', applicationData);
      console.log('🔍 localStorage data:', {
        loanType: localStorage.getItem('loanType'),
        isUAEResident: localStorage.getItem('isUAEResident'),
        residencyStatus: localStorage.getItem('residencyStatus'),
        propertyStatus: localStorage.getItem('propertyStatus'),
        propertyType: localStorage.getItem('propertyType'),
        budgetRange: localStorage.getItem('budgetRange'),
        downPayment: localStorage.getItem('downPayment'),
        monthlyIncome: localStorage.getItem('monthlyIncome'),
        employmentStatus: localStorage.getItem('employmentStatus')
      });

      // Validate required fields before submission
      const requiredFields = ['loanType', 'isUAEResident', 'residencyStatus', 'fullName', 'email', 'phoneNumber'];
      const missingFields = requiredFields.filter(field => !applicationData[field]);
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        alert(`Missing required information: ${missingFields.join(', ')}. Please complete all steps before submitting.`);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ All required fields present, submitting to API...');

      // Submit to database
      const response = await fetch(API_ENDPOINTS.CREATE_LANDING_APPLICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });

      console.log('📡 API Response status:', response.status);
      const result = await response.json();
      console.log('📡 API Response data:', result);

      if (result.success) {
        console.log('✅ Application submitted successfully!');
        // Save application ID and form data to localStorage for completion page
        localStorage.setItem('applicationId', result.data.id);
        Object.entries(formData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        
        router.push('/get-mortgage/purchase/complete');
      } else {
        console.error('❌ API returned error:', result.message);
        throw new Error(result.message || 'Failed to submit application');
      }
      
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      
      // Fallback to localStorage if API fails
      Object.entries(formData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      alert('There was an issue submitting your application. Your data has been saved and we will contact you soon.');
      router.push('/get-mortgage/purchase/complete');
    } finally {
      setIsSubmitting(false);
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
        📋 Final Details • Secure your pre-approval today
      </div>
      
      <LandingHeader />

      <div className="page-container">
        {/* Progress Bar */}
        <ProgressBar currentStep={9} branch="new-purchase" />
        
        {/* Question */}
        <h1 className="question-text text-center mb-4">
          Almost done! Your details
        </h1>
        <p className="body-text-gray text-center mb-8">
          We&apos;ll use this information to prepare your personalized mortgage quote
        </p>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" style={{ marginBottom: '80px' }}>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter your email address"
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="+971 50 123 4567"
              pattern="^[+]?\d[\d\s-]{7,}$"
            />
          </div>

          <div>
            <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <select
              id="contactMethod"
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Email & Phone</option>
            </select>
          </div>

          <div>
            <label htmlFor="bestTimeToCall" className="block text-sm font-medium text-gray-700 mb-2">
              Best Time to Contact
            </label>
            <select
              id="bestTimeToCall"
              name="bestTimeToCall"
              value={formData.bestTimeToCall}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="morning">Morning (9AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 5PM)</option>
              <option value="evening">Evening (5PM - 8PM)</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary text-center"
            style={{ 
              marginTop: '40px',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Get My Mortgage Quote'}
          </button>
        </form>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/get-mortgage/purchase/step7')}
        className="btn-back"
        disabled={isSubmitting}
      >
        ← Back
      </button>

      <LandingFooter />
    </div>
  );
}