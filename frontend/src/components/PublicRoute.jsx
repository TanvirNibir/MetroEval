import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/components/Loading.css'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Allow logged-in users to access public pages (they can navigate back)
  // Only redirect if they're trying to access login/register while already logged in
  if (user && (location.pathname === '/login' || location.pathname === '/register')) {
    const dashboardPath = user.role === 'teacher' ? '/teacher-dashboard' : '/dashboard'
    return <Navigate to={dashboardPath} replace />
  }

  // Show public page (works for both logged-in and logged-out users)
  return children
}

export default PublicRoute

