import axios from 'axios'

// Get API URL from environment variable or use relative path for same-domain
// In production, this should be set to the backend URL
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for Flask-Login session cookies
})

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const publicPaths = ['/', '/about', '/login', '/register']
    const currentPath = window.location.pathname
    
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on a public page
      if (!publicPaths.includes(currentPath)) {
        // Small delay to avoid race conditions
        setTimeout(() => {
          if (!publicPaths.includes(window.location.pathname)) {
            window.location.href = '/login'
          }
        }, 100)
      }
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export default api

