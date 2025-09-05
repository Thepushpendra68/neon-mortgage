/**
 * Currency Utilities for UAE Residency-based Localization
 * Handles dynamic currency formatting between AED and USD based on user's UAE residency status
 */

// Approximate AED to USD conversion rate
const AED_TO_USD_RATE = 0.27;

/**
 * Get currency configuration based on user's UAE residency status
 * @returns {Object} Currency configuration object
 */
export const getCurrencyConfig = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      isUAEResident: true,
      currency: 'AED',
      symbol: 'AED'
    };
  }

  const isUAEResident = localStorage.getItem('isUAEResident') === 'true';
  return {
    isUAEResident,
    currency: isUAEResident ? 'AED' : 'USD',
    symbol: isUAEResident ? 'AED' : '$'
  };
};

/**
 * Convert AED amount to USD
 * @param {string|number} aedAmount - Amount in AED
 * @returns {number} Amount in USD
 */
export const convertAEDtoUSD = (aedAmount) => {
  const numericAmount = typeof aedAmount === 'string' 
    ? parseFloat(aedAmount.replace(/[^\d.]/g, '')) 
    : aedAmount;
  
  return Math.round(numericAmount * AED_TO_USD_RATE / 1000) * 1000;
};

/**
 * Format currency amount based on user's residency status
 * @param {string|number} aedAmount - Base amount in AED
 * @param {boolean} includeSymbol - Whether to include currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (aedAmount, includeSymbol = true) => {
  const config = getCurrencyConfig();
  
  if (config.isUAEResident) {
    return includeSymbol ? `AED ${aedAmount}` : aedAmount.toString();
  } else {
    const usdAmount = convertAEDtoUSD(aedAmount);
    const formattedAmount = usdAmount.toLocaleString();
    return includeSymbol ? `$${formattedAmount}` : formattedAmount;
  }
};

/**
 * Get budget range options with localized currency
 * @returns {Array} Array of budget range options
 */
export const getBudgetRanges = () => {
  const config = getCurrencyConfig();
  
  if (config.isUAEResident) {
    return [
      {
        id: 'under-1m',
        title: 'Under AED 1M',
        description: 'Starter homes and apartments'
      },
      {
        id: '1m-2m',
        title: 'AED 1M - 2M',
        description: 'Mid-range properties'
      },
      {
        id: '2m-5m',
        title: 'AED 2M - 5M',
        description: 'Premium properties'
      },
      {
        id: 'above-5m',
        title: 'Above AED 5M',
        description: 'Luxury properties'
      }
    ];
  } else {
    return [
      {
        id: 'under-1m',
        title: 'Under $270K',
        description: 'Starter homes and apartments'
      },
      {
        id: '1m-2m',
        title: '$270K - $540K',
        description: 'Mid-range properties'
      },
      {
        id: '2m-5m',
        title: '$540K - $1.35M',
        description: 'Premium properties'
      },
      {
        id: 'above-5m',
        title: 'Above $1.35M',
        description: 'Luxury properties'
      }
    ];
  }
};

/**
 * Get income range options with localized currency
 * @returns {Array} Array of income range options
 */
export const getIncomeRanges = () => {
  const config = getCurrencyConfig();
  
  if (config.isUAEResident) {
    return [
      {
        id: 'under-15k',
        title: 'Under AED 15K',
        description: 'Entry-level income range'
      },
      {
        id: '15k-30k',
        title: 'AED 15K - 30K',
        description: 'Mid-level income range'
      },
      {
        id: '30k-50k',
        title: 'AED 30K - 50K',
        description: 'High income range'
      },
      {
        id: 'above-50k',
        title: 'Above AED 50K',
        description: 'Premium income range'
      }
    ];
  } else {
    return [
      {
        id: 'under-15k',
        title: 'Under $4K',
        description: 'Entry-level income range'
      },
      {
        id: '15k-30k',
        title: '$4K - $8K',
        description: 'Mid-level income range'
      },
      {
        id: '30k-50k',
        title: '$8K - $13.5K',
        description: 'High income range'
      },
      {
        id: 'above-50k',
        title: 'Above $13.5K',
        description: 'Premium income range'
      }
    ];
  }
};

/**
 * Get property value ranges for refinance/investment flows
 * @returns {Array} Array of property value options
 */
export const getPropertyValueRanges = () => {
  const config = getCurrencyConfig();
  
  if (config.isUAEResident) {
    return [
      {
        id: 'under-2m',
        title: 'Under AED 2M',
        description: 'Modest property value'
      },
      {
        id: '2m-5m',
        title: 'AED 2M - 5M',
        description: 'Mid-range property value'
      },
      {
        id: '5m-10m',
        title: 'AED 5M - 10M',
        description: 'High-end property value'
      },
      {
        id: 'above-10m',
        title: 'Above AED 10M',
        description: 'Premium property value'
      }
    ];
  } else {
    return [
      {
        id: 'under-2m',
        title: 'Under $540K',
        description: 'Modest property value'
      },
      {
        id: '2m-5m',
        title: '$540K - $1.35M',
        description: 'Mid-range property value'
      },
      {
        id: '5m-10m',
        title: '$1.35M - $2.7M',
        description: 'High-end property value'
      },
      {
        id: 'above-10m',
        title: 'Above $2.7M',
        description: 'Premium property value'
      }
    ];
  }
};

/**
 * Check if user has selected residency status
 * @returns {boolean} True if residency status is set
 */
export const hasResidencyStatus = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isUAEResident') !== null;
};

/**
 * Clear residency status (used when restarting flow)
 */
export const clearResidencyStatus = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('isUAEResident');
  localStorage.removeItem('residencyStatus');
};

/**
 * Get refinance mortgage balance ranges with localized currency
 * @returns {Array} Array of mortgage balance options
 */
export const getRefinanceBalanceRanges = () => {
  const config = getCurrencyConfig();
  
  if (config.isUAEResident) {
    return [
      {
        id: 'under-500k',
        title: 'Under AED 500K',
        description: 'Small remaining balance'
      },
      {
        id: '500k-1m',
        title: 'AED 500K - 1M',
        description: 'Mid-range balance'
      },
      {
        id: '1m-2m',
        title: 'AED 1M - 2M',
        description: 'Large balance'
      },
      {
        id: 'above-2m',
        title: 'Above AED 2M',
        description: 'Premium mortgage balance'
      }
    ];
  } else {
    return [
      {
        id: 'under-500k',
        title: 'Under $135K',
        description: 'Small remaining balance'
      },
      {
        id: '500k-1m',
        title: '$135K - $270K',
        description: 'Mid-range balance'
      },
      {
        id: '1m-2m',
        title: '$270K - $540K',
        description: 'Large balance'
      },
      {
        id: 'above-2m',
        title: 'Above $540K',
        description: 'Premium mortgage balance'
      }
    ];
  }
};

/**
 * Get investment budget ranges with localized currency
 * @returns {Array} Array of investment budget options
 */
export const getInvestmentBudgetRanges = () => {
  const config = getCurrencyConfig();
  
  if (config.isUAEResident) {
    return [
      {
        id: 'under-1m',
        title: 'Under AED 1M',
        description: 'Entry properties'
      },
      {
        id: '1m-2m',
        title: 'AED 1M - 2M',
        description: 'Mid-range'
      },
      {
        id: '2m-5m',
        title: 'AED 2M - 5M',
        description: 'Premium'
      },
      {
        id: 'above-5m',
        title: 'Above AED 5M',
        description: 'Luxury investments'
      }
    ];
  } else {
    return [
      {
        id: 'under-1m',
        title: 'Under $270K',
        description: 'Entry properties'
      },
      {
        id: '1m-2m',
        title: '$270K - $540K',
        description: 'Mid-range'
      },
      {
        id: '2m-5m',
        title: '$540K - $1.35M',
        description: 'Premium'
      },
      {
        id: 'above-5m',
        title: 'Above $1.35M',
        description: 'Luxury investments'
      }
    ];
  }
};