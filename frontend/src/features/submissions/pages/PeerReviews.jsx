import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import PeerReviewsList from '../../dashboard/components/PeerReviewsList'
import QuickStats from '../../../components/QuickStats'
import '../../../styles/features/submissions/Submissions.css'

const PeerReviews = () => {
  const { user } = useAuth()
  const [peerReviews, setPeerReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('student')
  const [stats, setStats] = useState({
    submissions: 0,
    feedbacks: 0,
    peerReviews: 0,
  })

  const normalizeToArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  useEffect(() => {
    let intervalId = null
    let isMounted = true

    const loadDataSafely = async (options = { background: false }) => {
      if (isMounted) {
        await loadData(options)
      }
    }

    // Initial load: show full-page loading state
    loadDataSafely({ background: false })

    // Auto-refresh every 15 seconds in the background (no full-page flicker)
    intervalId = setInterval(() => {
      if (isMounted) {
        loadDataSafely({ background: true })
      }
    }, 15000)

    // Also refresh when page becomes visible (background refresh)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        loadDataSafely({ background: true })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadData = async ({ background = false } = {}) => {
    if (!background) {
      setLoading(true)
    }
    try {
      // Get user role
      try {
        const profileData = await api.get('/v1/user/profile')
        setUserRole(profileData.role || 'student')
      } catch (e) {
        // Keep default role
      }

      const reviewsRaw = await api.get('/v1/peer-reviews')
      // Normalize response into an array
      const reviewsArray = normalizeToArray(reviewsRaw)
      
      // Sort reviews: pending first, then completed
      const sortedReviews = [...reviewsArray].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1
        if (a.status !== 'pending' && b.status === 'pending') return 1
        // If both same status, sort by assigned_at (newest first)
        if (a.assigned_at && b.assigned_at) {
          try {
            const dateA = new Date(a.assigned_at)
            const dateB = new Date(b.assigned_at)
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
              return dateB - dateA
            }
          } catch (e) {
            // Invalid dates, skip sorting
          }
        }
        return 0
      })
      setPeerReviews(sortedReviews)
      
      // Calculate stats
      const pendingCount = reviewsArray.filter(r => r && r.status === 'pending').length
      const completedCount = reviewsArray.filter(r => r && r.status === 'completed').length
      
      // Removed console.log for security
      
      setStats({
        submissions: 0,
        feedbacks: completedCount,
        peerReviews: pendingCount,
      })
    } catch (error) {
      // Error already handled by API interceptor
      setPeerReviews([])
    } finally {
      if (!background) {
        setLoading(false)
      }
    }
  }

  // Refresh function that can be called after actions
  const handleRefresh = () => {
    loadData({ background: false })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect teachers to teacher dashboard (teachers don't do peer reviews)
  if (userRole === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h2>Peer Reviews 👥</h2>
            <p className="dashboard-subtitle">
              Review submissions from your peers and provide constructive feedback
            </p>
          </div>
          <QuickStats stats={stats} />
        </div>
      </div>

      <PeerReviewsList reviews={peerReviews} onRefresh={handleRefresh} />
    </div>
  )
}

export default PeerReviews

