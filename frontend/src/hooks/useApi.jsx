import { useState, useCallback } from 'react'
import api from '../services/api'

/**
 * Hook for making API calls with loading and error states
 * @param {Function} apiCall - The API function to call
 * @returns {Object} API call state and execute function
 */
export const useApi = (apiCall) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall(...args)
      setData(result)
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * Hook for making a GET request
 */
export const useGet = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get(url, options)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch data'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    fetchData,
    refetch: fetchData,
  }
}

/**
 * Hook for making POST/PUT/DELETE requests
 */
export const useMutation = (mutationFn) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(...args)
      setData(result)
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Operation failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [mutationFn])

  const reset = useCallback(() => {
    setError(null)
    setData(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  }
}

