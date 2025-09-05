'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  DollarSign,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { dynamicApiClient } from '@/lib/dynamic-api'
import { mapDatabaseApplicationToUI, formatDate } from '@/lib/utils'

interface DashboardStats {
  totalApplications: number
  newLeadApplications: number
  contactedApplications: number
  qualifiedApplications: number
  approvedApplications: number
  rejectedApplications: number
  proposalSentApplications: number
  budgetRangeStats: Array<{_id: string, count: number}>
  recentApplications: number
  monthlyTrend: Array<{_id: {year: number, month: number}, count: number}>
}

interface DashboardState {
  stats: DashboardStats | null
  recentApplications: any[]
  loading: boolean
  error: string | null
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    stats: null,
    recentApplications: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    if (!dynamicApiClient.isAuthenticated()) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Please log in to view dashboard'
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Fetch dashboard stats
      const statsResponse = await dynamicApiClient.getDashboardStats()
      
      // Fetch recent applications
      const appsResponse = await dynamicApiClient.getApplications({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (statsResponse.success && appsResponse.success) {
        setState(prev => ({
          ...prev,
          stats: statsResponse.data,
          recentApplications: appsResponse.data?.applications ? 
            appsResponse.data.applications.slice(0, 3).map(mapDatabaseApplicationToUI) : [],
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: statsResponse.error || appsResponse.error || 'Failed to fetch dashboard data'
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatsCards = () => {
    if (!state.stats) return []

    return [
      {
        title: 'Total Applications',
        value: state.stats.totalApplications.toLocaleString(),
        change: '+12%',
        trend: 'up',
        icon: FileText,
        color: 'text-blue-600'
      },
      {
        title: 'New Leads',
        value: state.stats.newLeadApplications.toLocaleString(),
        change: '+5%',
        trend: 'up',
        icon: Clock,
        color: 'text-yellow-600'
      },
      {
        title: 'Contacted',
        value: state.stats.contactedApplications.toLocaleString(),
        change: '+3%',
        trend: 'up',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        title: 'Approved',
        value: state.stats.approvedApplications.toLocaleString(),
        change: '+8%',
        trend: 'up',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Qualified',
        value: state.stats.qualifiedApplications.toLocaleString(),
        change: '+12%',
        trend: 'up',
        icon: CheckCircle,
        color: 'text-purple-600'
      }
    ]
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new lead': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'qualified': return 'bg-purple-100 text-purple-800'
      case 'proposal sent': return 'bg-indigo-100 text-indigo-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  const stats = getStatsCards()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your mortgage applications.</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={state.loading}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Generate Report
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {state.loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-sm">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Applications</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : state.recentApplications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No recent applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {application.firstName[0]?.toUpperCase()}{application.lastName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.firstName} {application.lastName}</p>
                        <p className="text-sm text-gray-500">
                          {application.loanType} • {application.loanAmount} • {application._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getApplicationStatusColor(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDate(application.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                New Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Review and process new mortgage applications</p>
              <Button variant="outline" className="w-full">
                View Applications
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                Generate Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Create detailed reports and analytics</p>
              <Button variant="outline" className="w-full">
                Create Report
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                Bulk Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Perform bulk operations on applications</p>
              <Button variant="outline" className="w-full">
                Manage Bulk
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}