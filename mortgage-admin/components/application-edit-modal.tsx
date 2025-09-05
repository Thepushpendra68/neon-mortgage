"use client"

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dynamicApiClient, type Application } from '@/lib/dynamic-api'
import { 
  Edit3, 
  Save,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface ApplicationEditModalProps {
  applicationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplicationUpdated?: () => void
}

export function ApplicationEditModal({ 
  applicationId, 
  open, 
  onOpenChange,
  onApplicationUpdated 
}: ApplicationEditModalProps) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && applicationId) {
      fetchApplication()
    } else {
      // Reset form when modal closes
      setStatus('')
      setNotes('')
      setError(null)
      setSuccess(null)
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
        setStatus(response.data.status)
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

  const handleSave = async () => {
    if (!applicationId || !application) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await dynamicApiClient.updateApplicationStatus(
        applicationId,
        status,
        notes || undefined
      )

      if (response.success) {
        setSuccess('Application updated successfully')
        setApplication(response.data || application)
        onApplicationUpdated?.()
        
        // Auto close after 1.5 seconds
        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
      } else {
        setError(response.error || 'Failed to update application')
      }
    } catch (err) {
      setError('Failed to update application')
      console.error('Error updating application:', err)
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600'
      case 'New Lead': return 'text-yellow-600'
      case 'Contacted': return 'text-blue-600'
      case 'Qualified': return 'text-purple-600'
      case 'Proposal Sent': return 'text-indigo-600'
      case 'Rejected': return 'text-red-600'
      case 'Archived': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const statusOptions = [
    { value: 'New Lead', label: 'New Lead' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal Sent', label: 'Proposal Sent' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Archived', label: 'Archived' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Application
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading application...</span>
            </div>
          ) : error && !application ? (
            <div className="flex flex-col items-center justify-center h-32">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-red-600 text-center">{error}</p>
            </div>
          ) : application ? (
            <div className="space-y-6">
              {/* Application Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Applicant Name</Label>
                    <p className="font-medium">{application.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="font-medium">{application.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Phone</Label>
                    <p className="font-medium">{application.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Loan Type</Label>
                    <p className="font-medium">{application.loanType}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Update Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className={getStatusBadgeColor(option.value)}>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Add notes about this status change..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Status messages */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={saving || status === application.status}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
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