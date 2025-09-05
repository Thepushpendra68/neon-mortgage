"use client"

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dynamicApiClient, type Application } from '@/lib/dynamic-api'
import { formatDate } from '@/lib/utils'
import { 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Home, 
  MapPin,
  Calendar,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface ApplicationViewModalProps {
  applicationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplicationViewModal({ applicationId, open, onOpenChange }: ApplicationViewModalProps) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && applicationId) {
      fetchApplication()
    }
  }, [open, applicationId])

  const fetchApplication = async () => {
    if (!applicationId) return

    setLoading(true)
    setError(null)

    try {
      const response = await dynamicApiClient.getApplicationById(applicationId)
      if (response.success && response.data) {
        setApplication(response.data)
      } else {
        setError(response.error || 'Failed to fetch application details')
      }
    } catch (err) {
      setError('Failed to fetch application details')
      console.error('Error fetching application:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary'
      case 'in-review': return 'outline'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  const formatLoanType = (loanType: string) => {
    switch (loanType) {
      case 'new-purchase': return 'New Purchase'
      case 'refinance': return 'Refinance'
      case 'investment': return 'Investment Property'
      default: return loanType
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Details
            {application && (
              <Badge variant={getStatusBadgeVariant(application.status)} className="ml-2">
                {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
              </Badge>
            )}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading application details...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Application</h3>
              <p className="text-gray-500 text-center">{error}</p>
            </div>
          ) : application ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{application.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">UAE Resident</label>
                    <p className="text-gray-900">{application.isUAEResident ? 'Yes' : 'No'}</p>
                  </div>
                  {application.residencyStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Residency Status</label>
                      <p className="text-gray-900">{application.residencyStatus}</p>
                    </div>
                  )}
                  {application.employmentStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Employment Status</label>
                      <p className="text-gray-900">{application.employmentStatus}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-gray-900">{application.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </label>
                    <p className="text-gray-900">{application.phoneNumber}</p>
                  </div>
                  {application.contactMethod && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Contact Method</label>
                      <p className="text-gray-900">{application.contactMethod}</p>
                    </div>
                  )}
                  {application.bestTimeToCall && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Best Time to Call</label>
                      <p className="text-gray-900">{application.bestTimeToCall}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Loan Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loan Type</label>
                    <p className="text-gray-900">{formatLoanType(application.loanType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loan Amount</label>
                    <p className="text-gray-900">{application.budgetRange} {application.currencyDisplayed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Income</label>
                    <p className="text-gray-900">{application.monthlyIncome} {application.currencyDisplayed}</p>
                  </div>
                  {application.downPayment && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Down Payment</label>
                      <p className="text-gray-900">{application.downPayment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Information */}
              {(application.propertyStatus || application.propertyType) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.propertyStatus && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Property Status</label>
                        <p className="text-gray-900">{application.propertyStatus}</p>
                      </div>
                    )}
                    {application.propertyType && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Property Type</label>
                        <p className="text-gray-900">{application.propertyType}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Application Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                    <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                  </div>
                  {application.lastUpdated && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">{formatDate(application.lastUpdated)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Application ID</label>
                    <p className="text-gray-900 font-mono text-sm">{application._id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}