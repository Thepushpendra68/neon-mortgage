/**
 * API Client for Mortgage Admin Dashboard
 * Handles authentication and API calls to the backend
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

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    // Use the backend server URL - Docker uses port 5000
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.neonmortgage.com' 
      : 'http://localhost:5000'
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('mortgage-admin-token')
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.makeRequest<{ token: string; user: User }>(
      '/api/mortgage-admin/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    )

    if (response.success && response.data) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('mortgage-admin-token', this.token)
        localStorage.setItem('mortgage-admin-user', JSON.stringify(response.data.user))
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
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/mortgage-admin/applications/export${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export types for use in components
export type { Application, ApplicationsResponse, User, ApiResponse }