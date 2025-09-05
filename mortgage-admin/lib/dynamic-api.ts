/**
 * Dynamic API Client with Service Discovery
 * Automatically discovers backend URLs and handles connection fallbacks
 */

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface User {
  id: string
  username: string
  role: string
  email: string
}

interface Application {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  loanType: 'new-purchase' | 'refinance' | 'investment'
  budgetRange: string
  monthlyIncome: string
  status: string
  createdAt: string
  lastUpdated?: string
  currencyDisplayed: 'AED' | 'USD'
  isUAEResident: boolean
  // Additional fields from the database model
  residencyStatus?: string
  propertyStatus?: string
  propertyType?: string
  downPayment?: string
  employmentStatus?: string
  contactMethod?: string
  bestTimeToCall?: string
}

interface ApplicationsResponse {
  applications: Application[]
  pagination: {
    current: number
    total: number
    hasNext: boolean
    hasPrev: boolean
    totalRecords: number
  }
}

interface ServiceDiscovery {
  active: string[]
  fallbacks: string[]
  recommended: string
  timestamp: string
}

class DynamicApiClient {
  private currentBaseUrl: string | null = null
  private token: string | null = null
  private fallbackUrls: string[] = []
  private lastDiscovery: number = 0
  private discoveryCache: ServiceDiscovery | null = null

  constructor() {
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('mortgage-admin-token')
    }
  }

  // Discover backend URLs dynamically
  private async discoverBackend(): Promise<string[]> {
    console.log('🔍 Starting backend discovery...');
    const now = Date.now()
    
    // Use cached discovery if less than 30 seconds old
    if (this.discoveryCache && (now - this.lastDiscovery) < 30000) {
      return [...this.discoveryCache.active, ...this.discoveryCache.fallbacks]
    }

    const possibleUrls = [
      // Current known URLs
      this.currentBaseUrl,
      // Check environment variables first
      process.env.NEXT_PUBLIC_FALLBACK_BACKEND_URL,
      // Service registry ports (aligned with actual service configuration)
      'http://localhost:5000',  // Primary backend port (from service registry)
      'http://localhost:5001',  // First fallback
      'http://localhost:5002',  // Second fallback
      'http://localhost:5003',  // Third fallback
      // Legacy development ports (lower priority)
      'http://localhost:4011',
      'http://localhost:4012',
      'http://localhost:4013',
      'http://localhost:4014',
      'http://localhost:4015',
      // Production URL
      process.env.NODE_ENV === 'production' ? 'https://www.neonmortgage.com' : null
    ].filter(Boolean) as string[]

    // Try to get backend URLs from service discovery
    for (const baseUrl of possibleUrls) {
      try {
        // Create timeout using AbortController for better browser compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${baseUrl}/api/system/backend-urls`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            this.discoveryCache = result.data
            this.lastDiscovery = now
            this.currentBaseUrl = result.data.recommended
            
            console.log('🔍 Backend discovered:', result.data.recommended)
            return [...result.data.active, ...result.data.fallbacks]
          }
        }
      } catch (error) {
        console.log(`🔄 Discovery failed for ${baseUrl}:`, error instanceof Error ? error.message : 'Unknown error');
        // Continue to next URL
        continue
      }
    }

    // Fallback to static list
    console.warn('⚠️ Service discovery failed, using static fallback URLs')
    return possibleUrls
  }

  // Make API request with automatic backend discovery and fallback
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    console.log(`🌐 Making request to ${endpoint}...`)
    // Discover available backends
    const backendUrls = await this.discoverBackend()
    console.log(`🔍 Discovered backend URLs:`, backendUrls)
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    }

    let lastError: Error | null = null

    // Try each backend URL until one succeeds
    for (const baseUrl of backendUrls) {
      try {
        const url = `${baseUrl}${endpoint}`
        console.log(`🔗 Trying URL: ${url}`)
        // Create timeout using AbortController for better browser compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);

        const data = await response.json()

        if (!response.ok) {
          console.log(`❌ Request failed with status ${response.status}:`, data)
          // If this is a client error (4xx), don't retry other URLs
          if (response.status >= 400 && response.status < 500) {
            return {
              success: false,
              error: data.message || `Client error: ${response.status}`
            }
          }
          // Server error (5xx), try next URL
          throw new Error(data.message || `Server error: ${response.status}`)
        }

        // Success! Update current base URL and return
        this.currentBaseUrl = baseUrl
        console.log(`✅ API request successful via ${baseUrl}`)
        return data

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.warn(`🔄 Failed to connect to ${baseUrl}:`, lastError.message)
        continue
      }
    }

    // All URLs failed
    console.error('❌ All backend URLs failed:', lastError?.message)
    return {
      success: false,
      error: lastError?.message || 'All backend services unavailable'
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    console.log('📡 API Client: Starting login request...')
    const response = await this.makeRequest<{ token: string; user: User }>(
      '/api/mortgage-admin/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    )

    console.log('📡 API Client: Login response received:', response)

    if (response.success && response.data) {
      console.log('💾 API Client: Storing token and user data...')
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('mortgage-admin-token', this.token)
        localStorage.setItem('mortgage-admin-user', JSON.stringify(response.data.user))
        console.log('💾 API Client: Data stored in localStorage')
      }
    }

    return response
  }

  logout(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mortgage-admin-token')
      localStorage.removeItem('mortgage-admin-user')
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('mortgage-admin-user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/mortgage-admin/dashboard/stats')
  }

  // Applications methods
  async getApplications(params: {
    page?: number
    limit?: number
    status?: string
    loanType?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<ApiResponse<ApplicationsResponse>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/mortgage-admin/applications${queryString ? `?${queryString}` : ''}`
    
    return this.makeRequest<ApplicationsResponse>(endpoint)
  }

  async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    return this.makeRequest<Application>(`/api/mortgage-admin/applications/${id}`)
  }

  async updateApplicationStatus(
    id: string, 
    status: string, 
    notes?: string
  ): Promise<ApiResponse<Application>> {
    return this.makeRequest<Application>(
      `/api/mortgage-admin/applications/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      }
    )
  }

  async addApplicationNote(
    id: string, 
    note: string
  ): Promise<ApiResponse<Application>> {
    return this.makeRequest<Application>(
      `/api/mortgage-admin/applications/${id}/notes`,
      {
        method: 'POST',
        body: JSON.stringify({ note }),
      }
    )
  }

  async exportApplications(params: {
    format?: 'csv' | 'json'
    status?: string
    loanType?: string
  } = {}): Promise<Response> {
    // For file downloads, we need to handle this differently
    const backendUrls = await this.discoverBackend()
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/mortgage-admin/applications/export${queryString ? `?${queryString}` : ''}`
    
    for (const baseUrl of backendUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);

        if (response.ok) {
          this.currentBaseUrl = baseUrl
          return response
        }
      } catch (error) {
        continue
      }
    }

    throw new Error('Export failed: All backend services unavailable')
  }

  // Get current backend status for debugging
  async getBackendStatus(): Promise<{
    current: string | null
    discovered: string[]
    cache: ServiceDiscovery | null
  }> {
    const discovered = await this.discoverBackend()
    return {
      current: this.currentBaseUrl,
      discovered,
      cache: this.discoveryCache
    }
  }
}

// Create singleton instance
export const dynamicApiClient = new DynamicApiClient()

// Export types for use in components
export type { Application, ApplicationsResponse, User, ApiResponse }