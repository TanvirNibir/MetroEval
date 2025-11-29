import { useState } from 'react'

/**
 * Generic form hook for managing form state and validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function that returns errors object
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles input change events
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setValues(prev => ({
      ...prev,
      [name]: newValue,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  /**
   * Handles input blur events (for touched state)
   */
  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }))

    // Validate on blur if validator is provided
    if (validate) {
      const validationErrors = validate(values)
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name],
        }))
      }
    }
  }

  /**
   * Sets a field value programmatically
   */
  const setValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Sets multiple field values at once
   */
  const updateValues = (newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }))
  }

  /**
   * Validates the entire form
   */
  const validateForm = () => {
    if (!validate) return true
    
    const validationErrors = validate(values)
    setErrors(validationErrors)
    setTouched(
      Object.keys(values).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
    )
    
    return Object.keys(validationErrors).length === 0
  }

  /**
   * Resets the form to initial values
   */
  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async (onSubmit) => {
    return async (e) => {
      e.preventDefault()
      
      // Validate form
      if (validate && !validateForm()) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values, { setErrors, resetForm })
      } catch (error) {
        // Error already handled by API interceptor
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    updateValues,
    validateForm,
    resetForm,
    setIsSubmitting,
  }
}

