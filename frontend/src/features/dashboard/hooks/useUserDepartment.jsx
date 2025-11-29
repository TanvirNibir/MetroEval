import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'

const DEFAULT_DEPARTMENT = 'General Studies'

/**
 * Hook to get and manage user department.
 * Uses AuthContext as the source of truth to avoid redundant API calls.
 * Automatically syncs with server when department is updated.
 */
export const useUserDepartment = () => {
  const { user, checkAuth } = useAuth()
  // Initialize from user context if available, otherwise use default
  const [department, setDepartmentState] = useState(
    user?.department || DEFAULT_DEPARTMENT
  )
  const [loading, setLoading] = useState(!user)

  // Sync with user context when it changes
  useEffect(() => {
    if (user?.department) {
      setDepartmentState(user.department)
      setLoading(false)
    } else if (user && !user.department) {
      // User is loaded but has no department - use default
      setDepartmentState(DEFAULT_DEPARTMENT)
      setLoading(false)
    } else if (!user) {
      // User not loaded yet
      setLoading(true)
    }
  }, [user])

  /**
   * Update department locally and sync to server.
   * After updating, refreshes auth context to keep data in sync.
   */
  const setDepartment = async (newDepartment, skipSync = false) => {
    const previousDepartment = department
    setDepartmentState(newDepartment)
    
    if (!skipSync && user) {
      try {
        await api.post('/v1/user/department', { department: newDepartment })
        // Refresh auth context to sync with server
        await checkAuth()
      } catch (error) {
        // Error already handled by API interceptor
        // Revert on error
        setDepartmentState(previousDepartment)
        throw error
      }
    }
  }

  return {
    department,
    loading,
    setDepartment,
  }
}

