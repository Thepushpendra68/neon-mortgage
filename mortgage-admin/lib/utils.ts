import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency: 'AED' | 'USD' = 'AED'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat(currency === 'AED' ? 'en-AE' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'New Lead': 'bg-yellow-100 text-yellow-800',
    'Contacted': 'bg-blue-100 text-blue-800',
    'Qualified': 'bg-purple-100 text-purple-800',
    'Proposal Sent': 'bg-indigo-100 text-indigo-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Archived': 'bg-gray-100 text-gray-800',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

// Map database application fields to frontend expectations
export interface DatabaseApplication {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  loanType: 'new-purchase' | 'refinance' | 'investment'
  budgetRange: string
  monthlyIncome?: string
  status: string
  createdAt: string
  lastUpdated?: string
  currencyDisplayed: 'AED' | 'USD'
  isUAEResident: boolean
  residencyStatus?: string
  propertyStatus?: string
  propertyType?: string
  downPayment?: string
  employmentStatus?: string
  contactMethod?: string
  bestTimeToCall?: string
}

export interface UIApplication {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  loanType: string
  loanAmount: string
  status: string
  createdAt: string
  lastUpdated?: string
}

export function mapDatabaseApplicationToUI(dbApp: DatabaseApplication): UIApplication {
  // Split fullName into firstName and lastName
  const nameParts = dbApp.fullName.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Map loan type to display format
  const loanTypeMap: Record<string, string> = {
    'new-purchase': 'Purchase',
    'refinance': 'Refinance',
    'investment': 'Investment'
  }

  // Convert budget range to display amount
  const loanAmount = mapBudgetRangeToAmount(dbApp.budgetRange, dbApp.currencyDisplayed)

  // Map database status to UI status
  const status = mapDatabaseStatusToUI(dbApp.status)

  return {
    _id: dbApp._id,
    firstName,
    lastName,
    email: dbApp.email,
    phone: dbApp.phoneNumber,
    loanType: loanTypeMap[dbApp.loanType] || dbApp.loanType,
    loanAmount,
    status,
    createdAt: dbApp.createdAt,
    lastUpdated: dbApp.lastUpdated
  }
}

function mapBudgetRangeToAmount(budgetRange: string, currency: 'AED' | 'USD'): string {
  const budgetMap: Record<string, Record<'AED' | 'USD', string>> = {
    'under-1m': {
      AED: 'Under AED 1M',
      USD: 'Under $270K'
    },
    '1m-2m': {
      AED: 'AED 1M - 2M',
      USD: '$270K - 540K'
    },
    '2m-5m': {
      AED: 'AED 2M - 5M',
      USD: '$540K - 1.4M'
    },
    'above-5m': {
      AED: 'Above AED 5M',
      USD: 'Above $1.4M'
    }
  }

  return budgetMap[budgetRange]?.[currency] || `${budgetRange} (${currency})`
}

function mapDatabaseStatusToUI(dbStatus: string): string {
  // Return database status as-is since frontend now uses database statuses directly
  return dbStatus
}

export function formatLoanType(loanType: string): string {
  const loanTypeMap: Record<string, string> = {
    'new-purchase': 'New Purchase',
    'refinance': 'Refinance',
    'investment': 'Investment Property'
  }
  
  return loanTypeMap[loanType] || loanType
}