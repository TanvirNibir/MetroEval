import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Always check auth status to determine if user is logged in
    // This is needed for PublicRoute to work correctly
    checkAuth()
  }, [location.pathname])

  const checkAuth = async () => {
    setLoading(true)
    try {
      // Fetch full user profile to get all user information
      const profileData = await api.get('/v1/user/profile')
      if (profileData.id) {
        setUser({ authenticated: true, ...profileData })
      } else {
        setUser(null)
      }
    } catch (error) {
      // User is not authenticated - set user to null
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      // Use a custom axios instance without Content-Type header for FormData
      const response = await api.post('/v1/login', formData, {
        headers: {
          'Content-Type': undefined, // Let axios set it automatically for FormData
        },
      })
      
      if (response.success) {
        await checkAuth()
        return { success: true, role: response.role, user: response.user }
      } else {
        return { success: false, error: response.error || 'Invalid credentials' }
      }
    } catch (error) {
      // Error already logged by API interceptor
      const errorMessage = error.error || error.message || 'Login failed. Please check your connection.'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email, password, name, role, department) => {
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('name', name)
      formData.append('role', role)
      formData.append('department', department)

      // Use a custom axios instance without Content-Type header for FormData
      const response = await api.post('/v1/register', formData, {
        headers: {
          'Content-Type': undefined, // Let axios set it automatically for FormData
        },
      })
      
      if (response.success) {
        // Wait for checkAuth to complete and set user state
        await checkAuth()
        // Give a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        return { success: true, role: response.role, user: response.user }
      } else {
        return { success: false, error: response.error || 'Registration failed' }
      }
    } catch (error) {
      // Error already logged by API interceptor
      const errorMessage = error.error || error.message || 'Registration failed. Please check your connection.'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await api.get('/v1/logout')
      setUser(null)
    } catch (error) {
      // Error already logged by API interceptor
      // Still set user to null even if logout fails
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

