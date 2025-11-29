import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import QuickStats from '../../../components/QuickStats'
import '../../../styles/features/dashboard/TeacherDashboard.css'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReviews: 0,
    studentsCount: 0,
    avgScore: 0,
  })
  const [progressData, setProgressData] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submissionPeerReviews, setSubmissionPeerReviews] = useState([])

  useEffect(() => {
    loadSubmissions()
  }, [currentDepartment])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      // Get user profile to get teacher's department
      try {
        const profileData = await api.get('/v1/user/profile')
        const teacherDepartment = profileData.department
        setUserInfo({
          name: profileData.name,
          avatar_url: profileData.avatar_url,
          department: teacherDepartment,
        })
        // Set department from profile (teachers can't change it)
        if (teacherDepartment && teacherDepartment !== currentDepartment) {
          setCurrentDepartment(teacherDepartment)
        } else if (!currentDepartment && teacherDepartment) {
          setCurrentDepartment(teacherDepartment)
        }
      } catch (e) {
        // Error already handled by API interceptor
      }

      // Pass department as query parameter to filter submissions
      const params = currentDepartment ? { department: currentDepartment } : {}
      const data = await api.get('/v1/submissions', { params })
      setSubmissions(data)
      
      // Load progress data for the department
      if (currentDepartment) {
        try {
          const progress = await api.get(`/v1/teacher/progress/${encodeURIComponent(currentDepartment)}`)
          setProgressData(progress)
          setStats({
            totalSubmissions: progress.total_submissions,
            pendingReviews: progress.pending_peer_reviews,
            studentsCount: progress.unique_students,
            avgScore: progress.average_score,
          })
        } catch (e) {
          // Error already handled by API interceptor
          // Fallback to manual calculation
          const uniqueStudents = new Set(data.map(s => s.user_name))
          const pendingCount = data.filter(s => s.status === 'pending' || s.status === 'submitted').length
          setStats({
            totalSubmissions: data.length,
            pendingReviews: pendingCount,
            studentsCount: uniqueStudents.size,
            avgScore: 0,
          })
        }
      }
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }


  const handleViewSubmission = async (submissionId) => {
    try {
      const subData = await api.get(`/v1/submission/${submissionId}`)
      setSelectedSubmission(subData)
      
      // Load peer reviews for this submission
      const reviews = await api.get(`/v1/submission/${submissionId}/peer-reviews`)
      setSubmissionPeerReviews(reviews)
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  // Removed delete peer review functionality - teachers should only monitor, not delete

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="dashboard">
      {/* Teacher Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(255, 169, 77, 0.1))',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(251, 146, 60, 0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.2), transparent)',
          borderRadius: '50%',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              {userInfo?.avatar_url || user?.avatar_url ? (
                <img
                  src={userInfo?.avatar_url || user?.avatar_url}
                  alt={userInfo?.name || user?.name || 'Teacher'}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid var(--primary-color)',
                    boxShadow: 'var(--glow-primary)',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: 'var(--glow-primary)',
                }}>
                  👨‍🏫
                </div>
              )}
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  margin: 0,
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {getGreeting()}, {userInfo?.name || user?.name || 'Teacher'}! 👋
                </h2>
                <p style={{
                  color: 'var(--text-muted)',
                  margin: '0.5rem 0 0 0',
                  fontSize: '1rem',
                }}>
                  Teacher Dashboard - Manage and review student submissions
                </p>
                {currentDepartment && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <span className="badge badge-primary" style={{
                      fontSize: '0.9rem',
                      padding: '0.5rem 1rem',
                      background: 'rgba(251, 146, 60, 0.2)',
                      color: 'var(--primary-light)',
                      border: '1px solid rgba(251, 146, 60, 0.4)',
                    }}>
                      <i className="fas fa-building" style={{ marginRight: '0.5rem' }}></i>
                      {currentDepartment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <QuickStats stats={{
            submissions: stats.totalSubmissions,
            feedbacks: stats.pendingReviews,
            peerReviews: stats.studentsCount,
          }} />
        </div>
      </div>


      {/* Progress Overview Section */}
      {progressData && (
        <div className="card" style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          marginBottom: '2rem',
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <i className="fas fa-chart-line"></i>
            Department Progress Overview
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(251, 146, 60, 0.2)',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem',
              }}>
                {progressData.total_submissions}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Total Submissions
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}>
                {progressData.unique_students}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Active Students
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(251, 146, 60, 0.2)',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#fb923c',
                marginBottom: '0.5rem',
              }}>
                {progressData.average_score.toFixed(1)}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Average Score
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#ef4444',
                marginBottom: '0.5rem',
              }}>
                {progressData.pending_peer_reviews}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Pending Reviews
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}>
                {progressData.completed_peer_reviews}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Completed Reviews
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(251, 146, 60, 0.2)',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#fb923c',
                marginBottom: '0.5rem',
              }}>
                {progressData.recent_submissions}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                This Week
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <Link
          to="/teacher-submissions"
          className="card"
          style={{
            textDecoration: 'none',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            transition: 'var(--transition)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.borderColor = 'var(--primary-color)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          }}
        >
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
          }}>📚</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
          }}>
            View All Submissions
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            margin: 0,
          }}>
            Browse and manage all student submissions across departments
          </p>
        </Link>

        <Link
          to="/teacher-feedback"
          className="card"
          style={{
            textDecoration: 'none',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            transition: 'var(--transition)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.borderColor = 'var(--primary-color)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          }}
        >
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
          }}>💬</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
          }}>
            Review Feedback
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            margin: 0,
          }}>
            Review AI-generated feedback and provide additional insights
          </p>
        </Link>

        <div className="card" style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
          }}>📊</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
          }}>
            Department Analytics
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            margin: 0,
          }}>
            {stats.studentsCount} students | {stats.totalSubmissions} submissions | Avg: {stats.avgScore.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <i className="fas fa-folder-open"></i>
            Submissions from {currentDepartment}
          </h3>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            <span className="badge badge-primary" style={{
              background: 'rgba(251, 146, 60, 0.2)',
              color: 'var(--primary-light)',
              border: '1px solid rgba(251, 146, 60, 0.4)',
            }}>
              Total: {stats.totalSubmissions}
            </span>
            <span className="badge badge-primary" style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
            }}>
              Pending: {stats.pendingReviews}
            </span>
          </div>
        </div>
        <div className="submissions-list">
          {(!submissions || !Array.isArray(submissions) || submissions.length === 0) ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>
                No submissions found for {currentDepartment} department yet.
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Students will appear here once they submit assignments.
              </p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="submission-item"
                style={{
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)'
                  e.currentTarget.style.borderColor = 'var(--primary-color)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => handleViewSubmission(sub.id)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      marginBottom: '0.75rem',
                      color: 'var(--text-color)',
                    }}>
                      {sub.title}
                    </h4>
                    <div className="submission-meta" style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}>
                      <span><strong>Type:</strong> {sub.type}</span>
                      <span><strong>Student:</strong> {sub.user_name}</span>
                      <span><strong>Department:</strong> {sub.department}</span>
                      <span><strong>Date:</strong> {sub.created_at ? (() => { try { return new Date(sub.created_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <span className={`submission-status status-${sub.status}`} style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                    }}>
                      {sub.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewSubmission(sub.id)
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(251, 146, 60, 0.2)',
                        border: '1px solid rgba(251, 146, 60, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--primary-light)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 146, 60, 0.3)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submission Details Modal */}
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
          setSubmissionPeerReviews([])
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
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
              }}>
                {selectedSubmission.submission.title}
              </h3>
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  setSubmissionPeerReviews([])
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
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
            
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Student Information</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  <strong>Student:</strong> {selectedSubmission.submission.user_name}<br/>
                  <strong>Type:</strong> {selectedSubmission.submission.type}<br/>
                  <strong>Status:</strong> {selectedSubmission.submission.status}<br/>
                  <strong>Submitted:</strong> {selectedSubmission.submission.created_at ? (() => { try { return new Date(selectedSubmission.submission.created_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Submission Content</h4>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'auto',
                  maxHeight: '300px',
                  fontSize: '0.875rem',
                  color: 'var(--text-color)',
                }}>
                  {selectedSubmission.submission.content}
                </pre>
              </div>

              {/* Peer Reviews Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
                  Peer Reviews ({submissionPeerReviews.length})
                </h4>
                {submissionPeerReviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No peer reviews assigned yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {submissionPeerReviews.map((review) => (
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
                            {review.feedback_text && (
                              <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                marginTop: '0.5rem',
                                whiteSpace: 'pre-wrap',
                              }}>
                                {review.feedback_text}
                              </p>
                            )}
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-light)',
                              marginTop: '0.5rem',
                            }}>
                              Assigned: {review.assigned_at ? (() => { try { return new Date(review.assigned_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}
                              {review.completed_at && (
                                <> | Completed: {(() => { try { return new Date(review.completed_at).toLocaleString() } catch { return 'Invalid Date' } })()}</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Feedback Section */}
              {selectedSubmission.feedbacks && Array.isArray(selectedSubmission.feedbacks) && selectedSubmission.feedbacks.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
                    AI Feedback ({selectedSubmission.feedbacks.length})
                  </h4>
                  {selectedSubmission.feedbacks.map((feedback, idx) => (
                    <div
                      key={feedback.id || `feedback-${idx}-${feedback.created_at || ''}`}
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(251, 146, 60, 0.2)',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                      }}>
                        <strong style={{ color: 'var(--text-color)' }}>
                          {feedback.reviewer_name || 'AI Assistant'}
                        </strong>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          background: 'rgba(251, 146, 60, 0.2)',
                          color: '#fb923c',
                        }}>
                          {feedback.type || 'AI'}
                        </span>
                      </div>
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '0.5rem',
                      }}>
                        {feedback.text}
                      </p>
                      {feedback.scores && Object.keys(feedback.scores).length > 0 && (
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginTop: '0.75rem',
                        }}>
                          {Object.entries(feedback.scores).map(([key, value]) => (
                            <div key={key} style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                            }}>
                              <strong>{key.replace(/_/g, ' ')}:</strong> {(value * 100).toFixed(0)}%
                            </div>
                          ))}
                        </div>
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

export default TeacherDashboard

