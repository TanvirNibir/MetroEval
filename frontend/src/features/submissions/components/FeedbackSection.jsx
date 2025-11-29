import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import FeedbackVisualization from './FeedbackVisualization'
import FeedbackReactions from './FeedbackReactions'

const FeedbackSection = ({ submissions, onRefresh }) => {
  // Handle missing props
  if (!submissions) {
    return (
      <div className="card">
        <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
          No submissions data available
        </p>
      </div>
    )
  }

  const [selectedSubmissionId, setSelectedSubmissionId] = useState('')
  const [submissionDetails, setSubmissionDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Load submission details when selection changes
  useEffect(() => {
    if (selectedSubmissionId) {
      loadSubmissionDetails(selectedSubmissionId)
    } else {
      setSubmissionDetails(null)
    }
  }, [selectedSubmissionId])

  const loadSubmissionDetails = async (submissionId) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get(`/v1/submission/${submissionId}`)
      setSubmissionDetails(data)
    } catch (err) {
      setError(err.error || 'Error loading submission details')
      setSubmissionDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFeedback = async () => {
    if (!selectedSubmissionId) return

    setGenerating(true)
    setError('')

    try {
      const response = await api.post('/v1/generate-feedback', {
        submission_id: selectedSubmissionId, // Keep as string (MongoDB ObjectId)
        force: true,
      })

      if (response.success) {
        // Reload submission details to show new feedback
        await loadSubmissionDetails(selectedSubmissionId)
        onRefresh()
      } else {
        setError('Error generating feedback')
      }
    } catch (err) {
      setError(err.error || 'Error generating feedback')
    } finally {
      setGenerating(false)
    }
  }

  const formatFeedbackText = (text) => {
    if (!text) return ''

    // Simple formatting - split by newlines and add paragraphs
    const lines = (text || '').split('\n').filter((line) => line.trim())
    return (
      <div className="feedback-text">
        {lines.map((line, index) => (
          <p key={`line-${index}-${line.substring(0, 10)}`} style={{ marginBottom: '0.5rem' }}>
            {line.startsWith('**') && line.endsWith('**') ? (
              <strong>{line.replace(/\*\*/g, '')}</strong>
            ) : line.startsWith('•') || line.startsWith('-') || line.startsWith('*') ? (
              <li style={{ marginLeft: '1.5rem' }}>{line.replace(/^[•\-\*]\s*/, '')}</li>
            ) : (
              line
            )}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <h3>
          <i className="fas fa-robot"></i> View & Generate Feedback
        </h3>
        <p className="text-muted">Select a submission to view existing feedback or generate new AI feedback</p>
        <div className="feedback-section-content">
          <div className="feedback-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <select
              className="form-control"
              value={selectedSubmissionId}
              onChange={(e) => setSelectedSubmissionId(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Select a submission...</option>
              {submissions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title} ({sub.type}) - {sub.status}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleGenerateFeedback}
              disabled={!selectedSubmissionId || generating}
            >
              <i className="fas fa-magic"></i> {generating ? 'Generating...' : 'Generate New Feedback'}
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}

          {loading && selectedSubmissionId && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading feedback...</p>
            </div>
          )}

          {submissionDetails && !loading && (
            <div className="submission-feedback-view">
              <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-color)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{submissionDetails.submission.title}</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span className="badge badge-primary">{submissionDetails.submission.type}</span>
                  <span className={`submission-status status-${submissionDetails.submission.status}`}>
                    {submissionDetails.submission.status}
                  </span>
                </div>
              </div>

              {submissionDetails.feedbacks && Array.isArray(submissionDetails.feedbacks) && submissionDetails.feedbacks.length > 0 ? (
                <div className="feedbacks-list">
                  <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: '700' }}>
                    <span style={{ marginRight: '0.5rem' }}>💬</span>
                    Feedback ({submissionDetails.feedbacks.length})
                  </h4>
                  {submissionDetails.feedbacks.map((fb, index) => (
                    <div key={fb.id || `feedback-${index}-${fb.created_at || ''}`} style={{ marginBottom: '1.5rem' }}>
                      {fb.type === 'ai' ? (
                        <div>
                        <FeedbackVisualization feedback={fb} />
                          <FeedbackReactions feedbackId={fb.id} />
                        </div>
                      ) : (
                        <div className="card feedback-item" style={{ 
                          background: 'var(--glass-bg)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid var(--glass-border)',
                        }}>
                          <div className="feedback-header" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '2px solid var(--border-light)',
                          }}>
                            <div>
                              <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>👤</span> Peer Feedback
                              </strong>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                By: {fb.reviewer_name || 'Peer Reviewer'}
                              </div>
                            </div>
                          </div>
                          <div className="feedback-content" style={{ 
                            lineHeight: '1.7',
                            color: 'var(--text-color)',
                          }}>
                            {formatFeedbackText(fb.text || fb.feedback_text || '')}
                          </div>
                          <FeedbackReactions feedbackId={fb.id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  background: 'var(--bg-color)',
                  border: '2px dashed var(--border-color)',
                }}>
                  <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    No feedback yet
                  </p>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                    Click "Generate New Feedback" to get AI feedback for this submission
                  </p>
                </div>
              )}

              {submissionDetails.peer_reviews && Array.isArray(submissionDetails.peer_reviews) && submissionDetails.peer_reviews.length > 0 && (
                <div className="peer-reviews-section" style={{ marginTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
                    <i className="fas fa-users" style={{ marginRight: '0.5rem' }}></i>
                    Peer Reviews ({submissionDetails.peer_reviews.length})
                  </h4>
                  {submissionDetails.peer_reviews.map((pr) => (
                    <div key={pr.id || `peer-review-${pr.created_at || ''}`} className="card" style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>{pr.reviewer_name}</strong></span>
                        <span className={`submission-status status-${pr.status}`}>{pr.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedSubmissionId && (
            <div className="card" style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: 'var(--bg-color)',
              border: '2px dashed var(--border-color)',
            }}>
              <i className="fas fa-hand-pointer" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                Select a submission above to view feedback
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedbackSection

