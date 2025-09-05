/**
 * API Configuration for Neon Mortgage Application
 * Handles different environments and API endpoints
 */

// Determine the current environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Simplified API base URL
const getApiBaseUrl = () => {
  if (!isDevelopment) {
    return ''; // Production: Same domain
  }
  
  // Development: Fixed port - no more dynamic discovery
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

// API base URL configuration
export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Landing application endpoints
  CREATE_LANDING_APPLICATION: `${API_BASE_URL}/api/landing/application/create`,
  
  // Health check
  HEALTH_CHECK: `${API_BASE_URL}/health`,
};

// Debug logging
console.log('🔧 API Configuration:', {
  isDevelopment,
  apiBaseUrl: API_BASE_URL,
  createApplicationEndpoint: API_ENDPOINTS.CREATE_LANDING_APPLICATION,
  nodeEnv: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
};

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  isDevelopment,
  apiBaseUrl: API_BASE_URL,
  nodeEnv: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
