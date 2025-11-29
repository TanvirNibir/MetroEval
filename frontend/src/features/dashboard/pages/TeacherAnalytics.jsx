import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'

const TeacherAnalytics = () => {
  const { user } = useAuth()
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [performancePredictions, setPerformancePredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [timeRange, setTimeRange] = useState('all') // all, week, month

  useEffect(() => {
    loadAnalytics()
  }, [currentDepartment, timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const profileData = await api.get('/v1/user/profile')
      const teacherDepartment = profileData.department
      if (teacherDepartment && teacherDepartment !== currentDepartment) {
        setCurrentDepartment(teacherDepartment)
      }

      if (teacherDepartment) {
        const progress = await api.get(`/v1/teacher/progress/${encodeURIComponent(teacherDepartment)}`)
        setProgressData(progress)
      }
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const loadPerformancePredictions = async () => {
    try {
      setLoadingPredictions(true)
      const data = await api.get('/v1/performance-prediction')
      setPerformancePredictions(data)
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoadingPredictions(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Analytics...</p>
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
            📊 Department Analytics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Comprehensive insights and performance metrics for {currentDepartment || 'your department'}
          </p>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Time Range:</span>
          {['all', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '0.5rem 1rem',
                background: timeRange === range 
                  ? 'rgba(251, 146, 60, 0.3)' 
                  : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${timeRange === range ? 'var(--primary-color)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-sm)',
                color: timeRange === range ? 'var(--primary-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {progressData ? (
        <>
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(255, 169, 77, 0.05))',
              border: '1px solid rgba(251, 146, 60, 0.3)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
              }}>
                {progressData.total_submissions}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Total Submissions
              </div>
            </div>

            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}>
                {progressData.unique_students}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Active Students
              </div>
            </div>

            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(255, 169, 77, 0.05))',
              border: '1px solid rgba(251, 146, 60, 0.3)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: '#fb923c',
                marginBottom: '0.5rem',
              }}>
                {progressData.average_score.toFixed(1)}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Average Score
              </div>
            </div>

            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: '#ef4444',
                marginBottom: '0.5rem',
              }}>
                {progressData.pending_peer_reviews}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Pending Reviews
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
            }}>
              Submission Status Breakdown
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {Object.entries(progressData.status_breakdown || {}).map(([status, count]) => (
                <div key={status} style={{
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--primary-color)',
                    marginBottom: '0.5rem',
                  }}>
                    {count}
                  </div>
                  <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                  }}>
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Predictions */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
              }}>
                Performance Predictions
              </h3>
              <button
                onClick={loadPerformancePredictions}
                disabled={loadingPredictions}
                className="btn btn-primary"
              >
                {loadingPredictions ? 'Loading...' : '🔮 Load Predictions'}
              </button>
            </div>
            {performancePredictions && performancePredictions.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem',
              }}>
                {performancePredictions.slice(0, 10).map((prediction, index) => (
                  <div key={prediction.student_id || prediction.student_name || `prediction-${index}`} style={{
                    padding: '1rem',
                    background: prediction.predicted_score > 0.7
                      ? 'rgba(16, 185, 129, 0.1)'
                      : prediction.predicted_score > 0.5
                      ? 'rgba(251, 146, 60, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${
                      prediction.predicted_score > 0.7
                        ? 'rgba(16, 185, 129, 0.3)'
                        : prediction.predicted_score > 0.5
                        ? 'rgba(251, 146, 60, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {prediction.student_name || `Student ${index + 1}`}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                      {(prediction.predicted_score * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Predicted Score
                    </div>
                    {prediction.confidence && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Confidence: {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Click "Load Predictions" to see performance predictions
              </div>
            )}
          </div>

          {/* Peer Review Statistics */}
          <div className="card">
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
            }}>
              Peer Review Activity
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '0.5rem',
                }}>
                  {progressData.total_peer_reviews}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Total Peer Reviews
                </div>
              </div>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '0.5rem',
                }}>
                  {progressData.completed_peer_reviews}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Completed Reviews
                </div>
              </div>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fb923c',
                  marginBottom: '0.5rem',
                }}>
                  {progressData.pending_peer_reviews}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Pending Reviews
                </div>
              </div>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fb923c',
                  marginBottom: '0.5rem',
                }}>
                  {progressData.recent_submissions}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Submissions This Week
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{
          textAlign: 'center',
          padding: '3rem',
        }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No analytics data available yet.
          </p>
        </div>
      )}
    </div>
  )
}

export default TeacherAnalytics

