import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import FeedbackSection from '../components/FeedbackSection'
import QuickStats from '../../../components/QuickStats'
import '../../../styles/features/submissions/Submissions.css'

const Feedback = () => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState('student')
  const [stats, setStats] = useState({
    submissions: 0,
    feedbacks: 0,
    peerReviews: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get user role
      try {
        const profileData = await api.get('/v1/user/profile')
        setUserRole(profileData.role || 'student')
      } catch (e) {
        // Keep default role - error already handled by interceptor
      }

      const submissionsResponse = await api.get('/v1/submissions')
      
      // Backend returns {success: true, data: [...]} 
      // Axios interceptor returns response.data, so we get {success: true, data: [...]}
      let submissionsData = []
      if (Array.isArray(submissionsResponse)) {
        // Direct array response
        submissionsData = submissionsResponse
      } else if (submissionsResponse && Array.isArray(submissionsResponse.data)) {
        // Wrapped in {success: true, data: [...]}
        submissionsData = submissionsResponse.data
      } else if (submissionsResponse && typeof submissionsResponse === 'object') {
        // Try to find array property in response
        const arrayKeys = ['data', 'submissions', 'items', 'results']
        for (const key of arrayKeys) {
          if (Array.isArray(submissionsResponse[key])) {
            submissionsData = submissionsResponse[key]
            break
          }
        }
        // If still no array found, check all values
        if (submissionsData.length === 0) {
          const values = Object.values(submissionsResponse)
          const arrayValue = values.find(v => Array.isArray(v))
          if (arrayValue) {
            submissionsData = arrayValue
          }
        }
      }
      
      // Ensure we have an array
      if (!Array.isArray(submissionsData)) {
        // submissionsData is not an array, use empty array
        submissionsData = []
      }
      
      setSubmissions(submissionsData)
      
      // Calculate stats
      let feedbackCount = 0
      if (Array.isArray(submissionsData)) {
        for (const sub of submissionsData) {
          try {
            const subData = await api.get(`/v1/submission/${sub.id}`)
            if (subData && subData.feedbacks && Array.isArray(subData.feedbacks)) {
              feedbackCount += subData.feedbacks.length
            }
          } catch (e) {
            // Skip errors - already handled by API interceptor
          }
        }
      }
      
      setStats({
        submissions: submissionsData.length,
        feedbacks: feedbackCount,
        peerReviews: 0,
      })
    } catch (error) {
      setError(error.error || error.message || 'Failed to load feedback data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', background: '#fff', padding: '2rem' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    )
  }

  // Redirect teachers to teacher dashboard
  if (userRole === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '3rem',
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}></i>
          <p style={{ color: 'var(--text-color)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Error loading feedback
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
            {error}
          </p>
          <button className="btn btn-primary" onClick={loadData}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  try {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h2>Feedback & Reviews 💬</h2>
              <p className="dashboard-subtitle">
                View AI-generated feedback and peer reviews for your submissions
              </p>
            </div>
            {stats && <QuickStats stats={stats} />}
          </div>
        </div>

        {(!submissions || !Array.isArray(submissions) || submissions.length === 0) ? (
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '3rem',
          }}>
            <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              No submissions yet
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Submit an assignment to receive feedback
            </p>
          </div>
        ) : (submissions && Array.isArray(submissions) && submissions.length > 0) ? (
          <FeedbackSection submissions={submissions} onRefresh={loadData} />
        ) : (
          <div className="card">
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading submissions...</p>
          </div>
        )}
      </div>
    )
  } catch (renderError) {
    // Error rendering component - return error UI
    return (
      <div style={{ padding: '2rem', background: '#fff', color: '#333' }}>
        <h2>Error rendering Feedback page</h2>
        <p>{renderError.message}</p>
        <pre>{renderError.stack}</pre>
      </div>
    )
  }
}

export default Feedback

