'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

interface LoginState {
  username: string
  password: string
  loading: boolean
  error: string | null
  showPassword: boolean
}

export default function LoginPage() {
  const [state, setState] = useState<LoginState>({
    username: '',
    password: '',
    loading: false,
    error: null,
    showPassword: false
  })
  const { login } = useAuth()

  const handleInputChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState(prev => ({
      ...prev,
      [field]: e.target.value,
      error: null // Clear error when user starts typing
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!state.username.trim() || !state.password.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter both username and password'
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const success = await login({
        username: state.username.trim(),
        password: state.password
      })

      if (success) {
        // Success! The AuthProvider will handle the redirect
        // Keep loading state until redirect happens
        return
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Invalid username or password'
        }))
      }
    } catch (error) {
      console.error('Login error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'An error occurred during login. Please try again.'
      }))
    }
  }

  const handleDemo = () => {
    setState(prev => ({
      ...prev,
      username: 'mortgage-admin',
      password: 'admin123'
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-white text-xl font-bold">N</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Neon Mortgage Admin</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {state.error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{state.error}</p>
                </div>
              )}

              {/* Demo Credentials Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Demo Credentials:</strong>
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Username: <code className="bg-blue-100 px-1 rounded">mortgage-admin</code>
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Password: <code className="bg-blue-100 px-1 rounded">admin123</code>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemo}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Use Demo Credentials
                </Button>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={state.username}
                  onChange={handleInputChange('username')}
                  placeholder="Enter your username"
                  disabled={state.loading}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={state.showPassword ? 'text' : 'password'}
                    value={state.password}
                    onChange={handleInputChange('password')}
                    placeholder="Enter your password"
                    disabled={state.loading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {state.showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={state.loading}
              >
                {state.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 Neon Mortgage. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}