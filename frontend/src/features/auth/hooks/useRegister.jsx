import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const DEPARTMENT_OPTIONS = [
  { value: 'General Studies', label: 'General Studies' },
  { value: 'Engineering & Computer Science', label: 'Engineering & Computer Science' },
  { value: 'Business & Economics', label: 'Business & Economics' },
  { value: 'Design & Creative Arts', label: 'Design & Creative Arts' },
  { value: 'Health & Life Sciences', label: 'Health & Life Sciences' },
  { value: 'Social Sciences & Humanities', label: 'Social Sciences & Humanities' },
]

/**
 * Hook for handling registration form state, validation, and submission
 * @returns {Object} Registration form state and handlers
 */
export const useRegister = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    department: 'General Studies',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
   * Generates a random secure password
   */
  const generateRandomPassword = () => {
    const length = 16
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const allChars = uppercase + lowercase + numbers + symbols

    // Ensure at least one character from each category
    let password = ''
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('')

    setFormData(prev => ({
      ...prev,
      password: password,
    }))
  }

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
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
      setError('Registration is limited to @metropolia.fi email addresses.')
      setLoading(false)
      return
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.department
      )
      if (result.success) {
        // Wait a bit to ensure auth state is fully updated
        setTimeout(() => {
          // Navigate based on role
          if (result.role === 'teacher') {
            navigate('/teacher-dashboard', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }, 300)
      } else {
        setError(result.error || 'Registration failed')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
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
      name: '',
      role: 'student',
      department: 'General Studies',
    })
    setError('')
    setLoading(false)
    setShowPassword(false)
  }

  return {
    formData,
    error,
    loading,
    showPassword,
    departmentOptions: DEPARTMENT_OPTIONS,
    handleChange,
    handleSubmit,
    resetForm,
    generateRandomPassword,
    togglePasswordVisibility,
    isMetropoliaEmail,
  }
}

