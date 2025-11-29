import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import QuickStats from '../../../components/QuickStats'
import '../../../styles/features/submissions/Submissions.css'

const TeacherPeerReviews = () => {
  const { user } = useAuth()
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [peerReviews, setPeerReviews] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  })
  const [batchReviewsData, setBatchReviewsData] = useState({}) // Store batch reviews data

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

      // Load peer reviews for all submissions using batch endpoint (performance improvement)
      if (Array.isArray(data) && data.length > 0) {
        try {
          const submissionIds = data.map(sub => sub.id)
          const batchReviews = await api.post('/v1/submissions/peer-reviews/batch', {
            submission_ids: submissionIds
          })
          
          // Store batch reviews data for use in modal
          if (batchReviews && typeof batchReviews === 'object') {
            setBatchReviewsData(batchReviews)
            
            // Calculate simple stats
            let totalReviews = 0
            let pendingCount = 0
            let completedCount = 0
            
            Object.values(batchReviews).forEach((reviews) => {
              if (Array.isArray(reviews)) {
                totalReviews += reviews.length
                reviews.forEach(review => {
                  if (review.status === 'pending') pendingCount++
                  if (review.status === 'completed') completedCount++
                })
              }
            })
            
            setStats({
              total: totalReviews,
              pending: pendingCount,
              completed: completedCount,
            })
          }
        } catch (e) {
          // Fallback to individual requests if batch fails
          console.warn('Batch peer reviews failed, falling back to individual requests', e)
          setBatchReviewsData({})
        }
      } else {
        setBatchReviewsData({})
        setStats({ total: 0, pending: 0, completed: 0 })
      }
    } catch (error) {
      setError(error.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewPeerReviews = async (submissionId) => {
    try {
      const subData = await api.get(`/v1/submission/${submissionId}`)
      // Use cached batch data if available, otherwise fetch
      const reviews = batchReviewsData[submissionId] || await api.get(`/v1/submission/${submissionId}/peer-reviews`)
      setSelectedSubmission(subData)
      setPeerReviews(Array.isArray(reviews) ? reviews : [])
    } catch (error) {
      setError(error.error || 'Failed to load peer reviews')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Peer Reviews...</p>
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
              👥 Peer Reviews Overview
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Monitor peer review activity for student submissions
            </p>
          </div>
          <QuickStats stats={{
            submissions: stats.total,
            feedbacks: stats.pending,
            peerReviews: stats.completed,
          }} />
        </div>
      </div>

      {/* Submissions with Peer Reviews */}
      <div className="card">
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
        }}>
          Submissions ({submissions.length})
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
                onClick={() => handleViewPeerReviews(sub.id)}
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
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}>
                      <span><strong>Student:</strong> {sub.user_name}</span>
                      <span><strong>Type:</strong> {sub.type}</span>
                      {batchReviewsData[sub.id] && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          background: 'rgba(251, 146, 60, 0.2)',
                          color: '#fb923c',
                        }}>
                          {batchReviewsData[sub.id].length} review{batchReviewsData[sub.id].length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Peer Reviews Management Modal */}
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
          setPeerReviews([])
        }}
        >
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            maxWidth: '900px',
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
                Peer Reviews: {selectedSubmission.submission?.title || 'Loading...'}
              </h3>
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  setPeerReviews([])
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
              {peerReviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No peer reviews assigned for this submission yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {peerReviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.5rem',
                          }}>
                            <strong style={{ color: 'var(--text-color)' }}>
                              Reviewer: {review.reviewer_name}
                            </strong>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: review.status === 'completed' 
                                ? 'rgba(16, 185, 129, 0.2)' 
                                : 'rgba(251, 146, 60, 0.2)',
                              color: review.status === 'completed' ? '#10b981' : '#fb923c',
                              border: `1px solid ${review.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`,
                            }}>
                              {review.status}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-light)',
                            marginTop: '0.5rem',
                          }}>
                            <div>Assigned: {review.assigned_at ? (() => { try { return new Date(review.assigned_at).toLocaleString() } catch { return 'N/A' } })() : 'N/A'}</div>
                            {review.completed_at && (
                              <div>Completed: {(() => { try { return new Date(review.completed_at).toLocaleString() } catch { return 'N/A' } })()}</div>
                            )}
                            {!review.completed_at && (
                              <div style={{ color: '#fb923c', fontWeight: '600' }}>⏳ Pending review</div>
                            )}
                          </div>
                          {review.status === 'completed' && review.feedback_text && (
                            <div style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem',
                              background: 'rgba(0, 0, 0, 0.2)',
                              borderRadius: 'var(--radius-sm)',
                              borderLeft: '3px solid var(--primary-color)',
                            }}>
                              <div style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem',
                              }}>
                                Review Feedback:
                              </div>
                              <div style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-color)',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '150px',
                                overflowY: 'auto',
                              }}>
                                {review.feedback_text}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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

export default TeacherPeerReviews

