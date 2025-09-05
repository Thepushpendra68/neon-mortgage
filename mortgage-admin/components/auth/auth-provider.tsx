'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { dynamicApiClient, type User } from '@/lib/dynamic-api'
import { LoadingScreen } from './loading-screen'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: { username: string; password: string }) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user && dynamicApiClient.isAuthenticated()

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initAuth = () => {
      if (dynamicApiClient.isAuthenticated()) {
        const storedUser = dynamicApiClient.getUser()
        if (storedUser) {
          setUser(storedUser)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  useEffect(() => {
    // Skip redirects while loading
    if (loading) return
    
    // Redirect unauthenticated users to login page
    if (!isAuthenticated && pathname !== '/login') {
      console.log('🔄 Redirecting unauthenticated user to login')
      router.replace('/login')
    } 
    // Redirect authenticated users away from login page
    else if (isAuthenticated && pathname === '/login') {
      console.log('🔄 Redirecting authenticated user to dashboard')
      router.replace('/')
    }
  }, [loading, isAuthenticated, pathname, router])

  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log('🔐 Starting login process...')
      const response = await dynamicApiClient.login(credentials)
      console.log('🔐 Login response:', response)
      
      if (response.success && response.data) {
        console.log('✅ Login successful, setting user and redirecting...')
        setUser(response.data.user)
        
        // Force a page reload to the dashboard to handle base path issues
        console.log('🔄 Redirecting to dashboard with page reload...')
        window.location.href = '/mortgage-admin/'
        
        return true
      }
      console.log('❌ Login failed:', response.error || 'Unknown error')
      return false
    } catch (error) {
      console.error('❌ Login error:', error)
      return false
    }
  }

  const logout = () => {
    dynamicApiClient.logout()
    setUser(null)
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  }

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}