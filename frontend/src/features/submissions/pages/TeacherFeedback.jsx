import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import QuickStats from '../../../components/QuickStats'
import FeedbackVisualization from '../components/FeedbackVisualization'
import '../../../styles/features/submissions/Submissions.css'

const TeacherFeedback = () => {
  const { user } = useAuth()
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    withFeedback: 0,
    withoutFeedback: 0,
  })

  useEffect(() => {
    loadData()
  }, [currentDepartment])

  const loadData = async () => {
    setLoading(true)
    try {
      const profileData = await api.get('/v1/user/profile')
      const teacherDepartment = profileData.department
      if (teacherDepartment && teacherDepartment !== currentDepartment) {
        setCurrentDepartment(teacherDepartment)
      }

      const params = teacherDepartment ? { department: teacherDepartment } : {}
      const data = await api.get('/v1/submissions', { params })
      setSubmissions(data)

      // Load feedback for each submission
      let withFeedbackCount = 0
      if (Array.isArray(data)) {
        for (const sub of data) {
          try {
            const subData = await api.get(`/v1/submission/${sub.id}`)
            if (subData.feedbacks && Array.isArray(subData.feedbacks) && subData.feedbacks.length > 0) {
              withFeedbackCount++
            }
          } catch (e) {
            // Skip errors
          }
        }
      }

      setStats({
        total: data.length,
        withFeedback: withFeedbackCount,
        withoutFeedback: data.length - withFeedbackCount,
      })
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleViewFeedback = async (submissionId) => {
    try {
      const subData = await api.get(`/v1/submission/${submissionId}`)
      setSelectedSubmission(subData)
      setFeedbacks(subData.feedbacks || [])
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(255, 169, 77, 0.1))',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(251, 146, 60, 0.3)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              💬 Review Feedback
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Review AI-generated and peer feedback for student submissions
            </p>
          </div>
          <QuickStats stats={{
            submissions: stats.total,
            feedbacks: stats.withFeedback,
            peerReviews: stats.withoutFeedback,
          }} />
        </div>
      </div>

      {/* Submissions with Feedback */}
      <div className="card">
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
        }}>
          Submissions with Feedback ({stats.withFeedback})
        </h3>

        {(!submissions || !Array.isArray(submissions) || submissions.length === 0) ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p>No submissions found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="submission-item"
                style={{
                  padding: '1.5rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onClick={() => handleViewFeedback(sub.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)'
                  e.currentTarget.style.borderColor = 'var(--primary-color)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      marginBottom: '0.5rem',
                      color: 'var(--text-color)',
                    }}>
                      {sub.title}
                    </h4>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}>
                      <span><strong>Student:</strong> {sub.user_name}</span> • <span><strong>Type:</strong> {sub.type}</span>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(251, 146, 60, 0.2)',
                      border: '1px solid rgba(251, 146, 60, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--primary-light)',
                      cursor: 'pointer',
                    }}
                  >
                    View Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
        onClick={() => {
          setSelectedSubmission(null)
          setFeedbacks([])
        }}
        >
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 'var(--shadow-xl)',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                Feedback for: {selectedSubmission.submission.title}
              </h3>
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  setFeedbacks([])
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '2rem' }}>
              {!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No feedback available for this submission yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {feedbacks.map((feedback, idx) => (
                    <div key={feedback.id || `feedback-${idx}-${feedback.created_at || ''}`} style={{
                      padding: '1.5rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                      }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          background: feedback.type === 'ai' 
                            ? 'rgba(251, 146, 60, 0.2)' 
                            : 'rgba(16, 185, 129, 0.2)',
                          color: feedback.type === 'ai' ? '#fb923c' : '#10b981',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                        }}>
                          {feedback.type || 'AI'} Feedback
                        </span>
                        {feedback.reviewer_name && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            by {feedback.reviewer_name}
                          </span>
                        )}
                      </div>
                      {feedback.scores && Object.keys(feedback.scores).length > 0 && (
                        <FeedbackVisualization
                          feedbackText={feedback.text || feedback.feedback_text || ''}
                          scores={feedback.scores}
                        />
                      )}
                      {(!feedback.scores || Object.keys(feedback.scores).length === 0) && (
                        <p style={{
                          color: 'var(--text-color)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                        }}>
                          {feedback.text || feedback.feedback_text || ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherFeedback

