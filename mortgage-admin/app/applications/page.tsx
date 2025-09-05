'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Trash2,
  MessageSquare,
  FileText,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatDate, mapDatabaseApplicationToUI, getStatusColor, UIApplication } from '@/lib/utils'
import { dynamicApiClient, type Application as DatabaseApplication } from '@/lib/dynamic-api'
import { ApplicationViewModal } from '@/components/application-view-modal'
import { ApplicationEditModal } from '@/components/application-edit-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ApplicationsState {
  applications: UIApplication[]
  loading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  totalRecords: number
}

export default function ApplicationsPage() {
  const [state, setState] = useState<ApplicationsState>({
    applications: [],
    loading: true,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalRecords: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loanTypeFilter, setLoanTypeFilter] = useState('all')
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  // Fetch applications when filters change
  useEffect(() => {
    fetchApplications()
  }, [state.currentPage, statusFilter, loanTypeFilter, searchTerm])

  // Check authentication on component mount
  useEffect(() => {
    if (!dynamicApiClient.isAuthenticated()) {
      // Redirect to login or show authentication error
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Please log in to view applications' 
      }))
    }
  }, [])

  const fetchApplications = async () => {
    if (!dynamicApiClient.isAuthenticated()) {
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Map frontend filter values to backend expected values
      const backendLoanType = loanTypeFilter === 'all' ? undefined : 
        loanTypeFilter === 'purchase' ? 'new-purchase' : loanTypeFilter

      const response = await dynamicApiClient.getApplications({
        page: state.currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        loanType: backendLoanType,
        search: searchTerm || undefined
      })

      if (response.success && response.data) {
        // Map database applications to UI format
        const mappedApplications = response.data?.applications?.map(mapDatabaseApplicationToUI) || []
        
        setState(prev => ({
          ...prev,
          applications: mappedApplications,
          totalPages: response.data?.pagination?.total || 1,
          totalRecords: response.data?.pagination?.totalRecords || 0,
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Failed to fetch applications'
        }))
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }

  const handlePageChange = (newPage: number) => {
    setState(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleRefresh = () => {
    fetchApplications()
  }

  const handleExport = async () => {
    try {
      const response = await dynamicApiClient.exportApplications({
        format: 'csv',
        status: statusFilter === 'all' ? undefined : statusFilter,
        loanType: loanTypeFilter === 'all' ? undefined : loanTypeFilter
      })

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mortgage-applications.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      setState(prev => ({
        ...prev,
        error: 'Export failed. Please try again.'
      }))
    }
  }

  // Action handlers
  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setViewModalOpen(true)
  }

  const handleEditApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setEditModalOpen(true)
  }

  const handleAddNote = async (applicationId: string) => {
    const note = prompt('Enter a note for this application:')
    if (!note) return

    try {
      const response = await dynamicApiClient.addApplicationNote(applicationId, note)
      if (response.success) {
        fetchApplications() // Refresh the list
        alert('Note added successfully')
      } else {
        alert('Failed to add note: ' + (response.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note')
    }
  }

  const handleExportSingle = (applicationId: string) => {
    // For now, we'll just copy the application ID to clipboard
    navigator.clipboard.writeText(applicationId).then(() => {
      alert('Application ID copied to clipboard')
    }).catch(() => {
      alert('Failed to copy application ID')
    })
  }

  const onApplicationUpdated = () => {
    fetchApplications() // Refresh the list when an application is updated
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default'
      case 'New Lead': return 'secondary'
      case 'Contacted': return 'outline'
      case 'Qualified': return 'outline'
      case 'Proposal Sent': return 'outline'
      case 'Rejected': return 'destructive'
      case 'Archived': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">Manage and review mortgage applications</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={state.loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={state.loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={state.loading}>
              <Filter className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{state.error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New Lead">New Lead</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {/* Loan Type Filter */}
              <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="refinance">Refinance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Applications ({state.totalRecords})</span>
              <div className="text-sm font-normal text-gray-600">
                Page {state.currentPage} of {state.totalPages}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {state.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading applications...</span>
              </div>
            ) : state.applications.length === 0 && !state.error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-gray-400 mb-2">
                  <Search className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500 text-center max-w-md">
                  {searchTerm || statusFilter !== 'all' || loanTypeFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No mortgage applications have been submitted yet'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Loan Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {application.firstName[0]?.toUpperCase()}{application.lastName[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {application.firstName} {application.lastName}
                            </p>
                            <p className="text-sm text-gray-500">ID: {application._id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{application.email}</p>
                          <p className="text-sm text-gray-500">{application.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{application.loanAmount}</p>
                          <p className="text-sm text-gray-500">{application.loanType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-900">
                          {formatDate(application.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="View Details"
                            onClick={() => handleViewApplication(application._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit Status"
                            onClick={() => handleEditApplication(application._id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" title="More Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewApplication(application._id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditApplication(application._id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAddNote(application._id)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportSingle(application._id)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => window.open(`mailto:${application.email}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!state.loading && state.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((state.currentPage - 1) * 10) + 1} to {Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, state.currentPage - 1))}
                    disabled={state.currentPage === 1 || state.loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(state.totalPages, state.currentPage + 1))}
                    disabled={state.currentPage === state.totalPages || state.loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <ApplicationViewModal
          applicationId={selectedApplicationId}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
        />

        <ApplicationEditModal
          applicationId={selectedApplicationId}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onApplicationUpdated={onApplicationUpdated}
        />
      </div>
    </DashboardLayout>
  )
}