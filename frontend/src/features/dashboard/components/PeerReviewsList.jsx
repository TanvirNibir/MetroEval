import React, { useState } from 'react'
import api from '../../../services/api'
import PeerReviewModal from '../../submissions/components/PeerReviewModal'

const PeerReviewsList = ({ reviews, onRefresh }) => {
  const [selectedReview, setSelectedReview] = useState(null)
  const [submissionData, setSubmissionData] = useState(null)
  const [loadingSubmission, setLoadingSubmission] = useState(false)

  const handleReviewClick = async (review) => {
    setLoadingSubmission(true)
    try {
      const data = await api.get(`/v1/submission/${review.submission_id}`)
      setSubmissionData(data)
      setSelectedReview(review)
    } catch (error) {
      // Error already handled by API interceptor
      // Still open modal even if submission load fails
      setSelectedReview(review)
    } finally {
      setLoadingSubmission(false)
    }
  }

  const handleReviewSuccess = () => {
    // Close modal first
    setSelectedReview(null)
    setSubmissionData(null)
    // Then refresh the list after a short delay to ensure backend has updated
    setTimeout(() => {
      if (onRefresh) {
        onRefresh()
      }
    }, 500) // Increased delay to ensure backend has updated
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        background: 'rgba(251, 146, 60, 0.2)',
        color: '#fb923c',
        border: '1px solid rgba(251, 146, 60, 0.3)',
      },
      completed: {
        background: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      },
      skipped: {
        background: 'rgba(148, 163, 184, 0.2)',
        color: '#94a3b8',
        border: '1px solid rgba(148, 163, 184, 0.3)',
      },
    }

    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        ...styles[status] || styles.pending,
      }}>
        {status}
      </span>
    )
  }

  return (
    <>
      <div className="card">
        <h3 style={{
          marginBottom: '1rem',
          color: 'var(--text-color)',
          fontSize: '1.25rem',
          fontWeight: '700',
        }}>
          <span style={{ marginRight: '0.5rem' }}>👥</span>
          Peer Reviews Assigned to Me
        </h3>
        <div className="peer-reviews-list">
          {!reviews || !Array.isArray(reviews) || reviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                No peer reviews assigned yet
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
                When peers submit assignments, you'll be matched to review them here.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem',
            }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    border: '1px solid var(--glass-border)',
                    transition: 'var(--transition)',
                    cursor: review.status === 'pending' ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => {
                    if (review.status === 'pending') {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                      e.currentTarget.style.borderColor = 'var(--primary-color)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (review.status === 'pending') {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 0.5rem 0',
                        color: 'var(--text-color)',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                      }}>
                        {review.submission_title}
                      </h4>
                      <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                      }}>
                        <span style={{ marginRight: '1rem' }}>
                          <strong>Submitted by:</strong> {review.submitted_by}
                        </span>
                        <span>
                          <strong>Type:</strong> {review.submission_type || 'N/A'}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>

                  {review.status === 'pending' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleReviewClick(review)}
                      disabled={loadingSubmission}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
                      }}
                    >
                      {loadingSubmission ? 'Loading...' : '📝 Review Now'}
                    </button>
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#10b981',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      fontWeight: '600',
                    }}>
                      ✅ Review Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedReview && (
        <PeerReviewModal
          review={selectedReview}
          submission={submissionData}
          onClose={() => {
            setSelectedReview(null)
            setSubmissionData(null)
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  )
}

export default PeerReviewsList

