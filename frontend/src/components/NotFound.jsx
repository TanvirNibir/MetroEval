import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/components/Loading.css'

const NotFound = () => {
  const { user, loading } = useAuth()

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

  // If user is logged in, redirect to their dashboard
  if (user) {
    const dashboardPath = user.role === 'teacher' ? '/teacher-dashboard' : '/dashboard'
    return <Navigate to={dashboardPath} replace />
  }

  // If user is not logged in, redirect to home
  return <Navigate to="/" replace />
}

export default NotFound

