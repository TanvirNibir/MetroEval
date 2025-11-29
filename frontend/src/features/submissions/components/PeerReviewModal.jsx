import React, { useState, useEffect } from 'react'
import api from '../../../services/api'

const PeerReviewModal = ({ review, submission, onClose, onSuccess }) => {
  const [feedback, setFeedback] = useState('')
  const [scores, setScores] = useState({
    correctness: 75,
    quality: 75,
    completeness: 75,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submissionData, setSubmissionData] = useState(submission)
  const [loadingSubmission, setLoadingSubmission] = useState(false)

  useEffect(() => {
    // Use provided submission if available
    if (submission) {
      setSubmissionData(submission)
    } else if (review?.submission_id && !submissionData) {
      // Load submission details if not provided
      loadSubmission()
    }
  }, [review, submission])

  const loadSubmission = async () => {
    if (!review?.submission_id) return
    
    setLoadingSubmission(true)
    setError('')
    try {
      const data = await api.get(`/v1/submission/${review.submission_id}`)
      setSubmissionData(data)
    } catch (err) {
      setError('Failed to load submission details. You can still submit a review.')
      // Don't block the modal - allow review even if submission load fails
    } finally {
      setLoadingSubmission(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate feedback
    if (!feedback.trim()) {
      setError('Please provide feedback before submitting.')
      return
    }
    
    setSubmitting(true)
    setError('')

    try {
      const response = await api.post(`/v1/peer-review/${review.id}/submit`, {
        feedback: feedback.trim(),
        scores: {
          correctness: scores.correctness / 100,
          quality: scores.quality / 100,
          completeness: scores.completeness / 100,
        },
      })

      if (response.success !== false) {
        // Success - call onSuccess callback to refresh the list
        if (onSuccess) {
          onSuccess()
        }
        // Small delay to ensure backend has updated
        setTimeout(() => {
          onClose()
        }, 200)
      } else {
        setError(response.error || 'Failed to submit review')
        setSubmitting(false)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.error || 'Failed to submit review. Please try again.')
      setSubmitting(false)
    }
  }

  if (!review) return null

  const displaySubmission = submissionData || {}

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-xl)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid var(--border-color)',
        }}>
          <h2 style={{
            margin: 0,
            color: 'var(--text-color)',
            fontSize: '1.5rem',
            fontWeight: '700',
          }}>
            <span style={{ marginRight: '0.5rem' }}>👥</span>
            Peer Review
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Submission Info */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: 'var(--text-color)',
            fontSize: '1.1rem',
            fontWeight: '700',
          }}>
            {displaySubmission.submission?.title || review.submission_title || 'Peer Review'}
          </h3>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '0.75rem',
          }}>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}>
              <strong>Submitted by:</strong> {review.submitted_by || displaySubmission.submission?.user_name || 'Unknown'}
            </span>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}>
              <strong>Type:</strong> {displaySubmission.submission?.type || review.submission_type || 'N/A'}
            </span>
          </div>
          {loadingSubmission && (
            <div style={{
              padding: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}>
              Loading submission details...
            </div>
          )}
          {displaySubmission.submission?.task_description && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(251, 146, 60, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '3px solid var(--primary-color)',
            }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--primary-color)',
                marginBottom: '0.5rem',
              }}>
                Assignment Task:
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-color)',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
              }}>
                {displaySubmission.submission.task_description}
              </div>
            </div>
          )}
        </div>

        {/* Submission Content */}
        {displaySubmission.submission?.content && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Submission Content:
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: 'var(--text-color)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              fontFamily: 'monospace',
            }}>
              {displaySubmission.submission.content}
            </div>
          </div>
        )}
        
        {!displaySubmission.submission?.content && !loadingSubmission && (
          <div style={{
            padding: '1rem',
            background: 'rgba(251, 146, 60, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            marginBottom: '1.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            Submission content not available. You can still provide feedback based on the assignment title.
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit}>
          {/* Scores */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              marginBottom: '1rem',
              color: 'var(--text-color)',
              fontSize: '1rem',
              fontWeight: '700',
            }}>
              📊 Scoring
            </h4>
            {['correctness', 'quality', 'completeness'].map((key) => (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                  <label style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                    textTransform: 'capitalize',
                  }}>
                    {key.replace('_', ' ')}
                  </label>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'var(--primary-color)',
                  }}>
                    {scores[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores[key]}
                  onChange={(e) => setScores({
                    ...scores,
                    [key]: parseFloat(e.target.value), // Use parseFloat for decimal scores
                  })}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-light)',
                  marginTop: '0.25rem',
                }}>
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Text */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text-color)',
            }}>
              💬 Feedback Comments
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback... What went well? What could be improved? Any suggestions?"
              required
              rows={6}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'var(--text-color)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'vertical',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            />
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.5rem',
            }}>
              Be constructive and specific. Focus on both strengths and areas for improvement.
            </div>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !feedback.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PeerReviewModal

