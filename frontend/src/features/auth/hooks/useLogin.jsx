import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

/**
 * Hook for handling login form state, validation, and submission
 * @returns {Object} Login form state and handlers
 */
export const useLogin = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Validates if email is a Metropolia email address
   */
  const isMetropoliaEmail = (value) => {
    return value.trim().toLowerCase().endsWith('@metropolia.fi')
  }

  /**
   * Updates form data
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handles form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate Metropolia email
    if (!isMetropoliaEmail(formData.email)) {
      setError('Login is restricted to @metropolia.fi email addresses.')
      setLoading(false)
      return
    }

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        // Navigate based on role
        if (result.role === 'teacher') {
          navigate('/teacher-dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Resets the form to initial state
   */
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
    })
    setError('')
    setLoading(false)
  }

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    isMetropoliaEmail,
  }
}

