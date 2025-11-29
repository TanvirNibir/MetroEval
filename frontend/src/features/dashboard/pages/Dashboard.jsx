import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import { useUserDepartment } from '../hooks/useUserDepartment'
import ProgressOverview from '../../../components/ProgressOverview'
import QuickStats from '../../../components/QuickStats'
import DepartmentSelector from '../components/DepartmentSelector'
import TimeTracking from '../../../components/TimeTracking'
import Deadlines from '../components/Deadlines'

const DEPARTMENT_OPTIONS = [
  { value: 'General Studies', label: 'General Studies' },
  { value: 'Engineering & Computer Science', label: 'Engineering & Computer Science' },
  { value: 'Business & Economics', label: 'Business & Economics' },
  { value: 'Design & Creative Arts', label: 'Design & Creative Arts' },
  { value: 'Health & Life Sciences', label: 'Health & Life Sciences' },
  { value: 'Social Sciences & Humanities', label: 'Social Sciences & Humanities' },
]

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const { department: currentDepartment, setDepartment: setCurrentDepartment } = useUserDepartment()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [userRole, setUserRole] = useState('student')
  const [stats, setStats] = useState({
    submissions: 0,
    feedbacks: 0,
    peerReviews: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  
  const normalizeToArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }
  
  // Use useCallback to memoize loadData so it can be safely used in useEffect
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Get user profile to get role
      let profileData = null
      try {
        profileData = await api.get('/v1/user/profile')
        const role = profileData.role || 'student'
        setUserRole(role)
        setUserInfo({ 
          department: profileData.department || currentDepartment,
          role: role,
          name: profileData.name,
          avatar_url: profileData.avatar_url,
        })
        if (profileData.department && profileData.department !== currentDepartment) {
          // Update without syncing since this is coming from server
          setCurrentDepartment(profileData.department, true)
        }
        
        // Redirect teachers to teacher dashboard
        if (role === 'teacher') {
          // Will redirect via return statement below
        }
      } catch (e) {
        // Error already handled by API interceptor
        // If profile fails, use user from auth context
        if (user) {
          setUserRole(user.role || 'student')
          setUserInfo({ 
            department: user.department || currentDepartment,
            role: user.role || 'student',
            name: user.name,
            avatar_url: user.avatar_url,
          })
          // Update from user context without syncing
          if (user.department && user.department !== currentDepartment) {
            setCurrentDepartment(user.department, true)
          }
        }
      }

      // Fetch submissions and peer reviews
      let submissionsData = []
      let reviewsData = []
      
      try {
        const submissionsRaw = await api.get('/v1/submissions')
        submissionsData = normalizeToArray(submissionsRaw)
      } catch (e) {
        submissionsData = [] // Ensure it's an array
      }
      
      try {
        const reviewsRaw = await api.get('/v1/peer-reviews')
        reviewsData = normalizeToArray(reviewsRaw)
      } catch (e) {
        reviewsData = [] // Ensure it's an array
      }
      
      setSubmissions(submissionsData)
      
      // Calculate stats and recent activity
      let feedbackCount = 0
      const activity = []
      
      // Get recent submissions
      const recentSubs = Array.isArray(submissionsData) ? submissionsData.slice(0, 3).map(sub => ({
        type: 'submission',
        title: sub.title,
        date: sub.created_at,
        status: sub.status,
        icon: '📝',
        color: '#6366f1',
      })) : []
      activity.push(...recentSubs)
      
      // Get pending peer reviews
      const pendingReviews = Array.isArray(reviewsData) ? reviewsData.filter(r => r.status === 'pending').slice(0, 2) : []
      if (Array.isArray(pendingReviews)) {
        pendingReviews.forEach(review => {
          activity.push({
            type: 'peer_review',
            title: `Review: ${review.submission_title}`,
            date: review.assigned_at,
            status: 'pending',
            icon: '👥',
            color: '#f59e0b',
          })
        })
      }
      
      if (Array.isArray(submissionsData)) {
        for (const sub of submissionsData) {
          try {
            const subData = await api.get(`/v1/submission/${sub.id}`)
            if (subData.feedbacks && Array.isArray(subData.feedbacks) && subData.feedbacks.length > 0) {
              feedbackCount += subData.feedbacks.length
              // Add recent feedback to activity
              const latestFeedback = subData.feedbacks[subData.feedbacks.length - 1]
              if (latestFeedback && !activity.find(a => a.title === `Feedback: ${sub.title}`)) {
                activity.push({
                  type: 'feedback',
                  title: `Feedback: ${sub.title}`,
                  date: latestFeedback.created_at || sub.created_at,
                  status: 'completed',
                  icon: '💬',
                  color: '#10b981',
                })
              }
            }
          } catch (e) {
            // Skip errors
          }
        }
      }
      
      // Sort activity by date
      activity.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentActivity(activity.slice(0, 5))
      
      // Count only pending peer reviews for the badge
      const pendingReviewsCount = reviewsData ? reviewsData.filter(r => r && r.status === 'pending').length : 0
      
      const newStats = {
        submissions: Array.isArray(submissionsData) ? submissionsData.length : 0,
        feedbacks: feedbackCount,
        peerReviews: pendingReviewsCount, // Only count pending reviews
      }
      
      setStats(newStats)
    } catch (error) {
      // Error already handled by API interceptor
      // Even if there's an error, show the dashboard with empty data
    } finally {
      setLoading(false)
    }
  }, [user, currentDepartment]) // Dependencies for loadData

  // Initial load + reload when dependencies for loadData change
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDepartmentChange = async (department) => {
    // Only allow teachers to change department
    if (userInfo && userInfo.role === 'student') {
      return // Students cannot change their department
    }
    try {
      await setCurrentDepartment(department)
      loadData()
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently'
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch (e) {
      return 'Invalid Date'
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  // If no user, PrivateRoute will handle redirect
  if (!user) {
    return null
  }

  // Show loading only on very first load when we have no user info yet
  // Once we have user info, show the dashboard even if data is still loading
  if (loading && !userInfo && (!submissions || !Array.isArray(submissions) || submissions.length === 0)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Dashboard Data...</p>
        </div>
      </div>
    )
  }

  // Redirect teachers to teacher dashboard
  if (userRole === 'teacher' || userInfo?.role === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />
  }

  const pendingReviews = stats.peerReviews > 0

  return (
    <div className="dashboard">
      {/* Hero Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(255, 169, 77, 0.1))',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(251, 146, 60, 0.3)',
        boxShadow: 'var(--shadow-lg)',
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
                  alt={userInfo?.name || user?.name || 'User'}
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
                  {getInitials(userInfo?.name || user?.name || 'U')}
                </div>
              )}
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: 'var(--text-color)',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {getGreeting()}, {userInfo?.name || user?.name || 'Student'}! 👋
                </h1>
                <p style={{
                  margin: '0.25rem 0 0 0',
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                }}>
                  Ready to continue your learning journey?
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginTop: '1rem',
            }}>
              <span className="badge badge-primary" style={{
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
              }}>
                🎓 {currentDepartment}
              </span>
              {userInfo?.role && (
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {userInfo.role}
                </span>
              )}
            </div>
          </div>
          <QuickStats stats={stats} />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <Link
          to="/submissions"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-primary)'
            e.currentTarget.style.borderColor = 'var(--primary-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}>
              📝
            </div>
            <div>
              <div style={{
                fontWeight: '700',
                color: 'var(--text-color)',
                marginBottom: '0.25rem',
              }}>
                Submissions
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}>
                {stats.submissions} total
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/feedback"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), 0 0 15px rgba(16, 185, 129, 0.4)'
            e.currentTarget.style.borderColor = '#10b981'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
            }}>
              💬
            </div>
            <div>
              <div style={{
                fontWeight: '700',
                color: 'var(--text-color)',
                marginBottom: '0.25rem',
              }}>
                Feedback
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}>
                {stats.feedbacks} reviews
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/peer-reviews"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{
            background: pendingReviews
              ? 'rgba(251, 146, 60, 0.15)'
              : 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: pendingReviews
              ? '2px solid rgba(251, 146, 60, 0.5)'
              : '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), 0 0 15px rgba(251, 146, 60, 0.4)'
            e.currentTarget.style.borderColor = 'var(--primary-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = pendingReviews
              ? 'rgba(251, 146, 60, 0.5)'
              : 'var(--glass-border)'
          }}
          >
            {pendingReviews && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: 'white',
                boxShadow: 'var(--glow-primary)',
              }}>
                {stats.peerReviews}
              </div>
            )}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
            }}>
              👥
            </div>
            <div>
              <div style={{
                fontWeight: '700',
                color: 'var(--text-color)',
                marginBottom: '0.25rem',
              }}>
                Peer Reviews
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: pendingReviews ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: pendingReviews ? '700' : '500',
              }}>
                {pendingReviews ? `${stats.peerReviews} pending` : 'All caught up'}
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), 0 0 15px rgba(236, 72, 153, 0.4)'
            e.currentTarget.style.borderColor = '#ec4899'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #ec4899, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.4)',
            }}>
              👤
            </div>
            <div>
              <div style={{
                fontWeight: '700',
                color: 'var(--text-color)',
                marginBottom: '0.25rem',
              }}>
                Profile
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}>
                Manage account
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Progress Overview */}
        <div style={{ gridColumn: 'span 1' }}>
          <ProgressOverview submissions={submissions} />
        </div>

        {/* Time Tracking and Deadlines */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <TimeTracking />
          <Deadlines />
        </div>

        {/* Recent Activity */}
        <div className="card" style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h3 style={{
            marginBottom: '1.5rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>⚡</span>
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
              <p>No recent activity</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Start by submitting an assignment!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id || `${activity.type}-${activity.date}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activity.color
                    e.currentTarget.style.background = `${activity.color}10`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${activity.color}20`,
                    border: `2px solid ${activity.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--text-color)',
                      marginBottom: '0.25rem',
                      fontSize: '0.95rem',
                    }}>
                      {activity.title}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}>
                      {formatTimeAgo(activity.date)}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: activity.status === 'pending'
                      ? 'rgba(251, 146, 60, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                    color: activity.status === 'pending'
                      ? '#fb923c'
                      : '#10b981',
                    border: `1px solid ${activity.status === 'pending' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  }}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Selector */}
      <DepartmentSelector
        currentDepartment={currentDepartment}
        departments={DEPARTMENT_OPTIONS}
        onDepartmentChange={handleDepartmentChange}
        userRole={userInfo?.role || (Array.isArray(submissions) && submissions.length > 0 ? 'student' : null)}
      />

      {/* Quick Links Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
      }}>
        <Link
          to="/submissions"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div className="card" style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            textAlign: 'center',
            padding: '2rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-primary)'
            e.currentTarget.style.borderColor = 'var(--primary-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))',
            }}>
              📝
            </div>
            <h3 style={{
              marginBottom: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--text-color)',
            }}>
              My Submissions
            </h3>
            <p style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}>
              Create and manage your assignments
            </p>
          </div>
        </Link>

        <Link
          to="/feedback"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div className="card" style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            textAlign: 'center',
            padding: '2rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), 0 0 20px rgba(16, 185, 129, 0.4)'
            e.currentTarget.style.borderColor = '#10b981'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))',
            }}>
              💬
            </div>
            <h3 style={{
              marginBottom: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--text-color)',
            }}>
              Feedback & Reviews
            </h3>
            <p style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}>
              View AI feedback and peer reviews
            </p>
          </div>
        </Link>

        <Link
          to="/peer-reviews"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div className="card" style={{
            background: pendingReviews
              ? 'rgba(251, 146, 60, 0.15)'
              : 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: pendingReviews
              ? '2px solid rgba(251, 146, 60, 0.5)'
              : '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            textAlign: 'center',
            padding: '2rem',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl), 0 0 20px rgba(251, 146, 60, 0.4)'
            e.currentTarget.style.borderColor = 'var(--primary-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            e.currentTarget.style.borderColor = pendingReviews
              ? 'rgba(251, 146, 60, 0.5)'
              : 'var(--glass-border)'
          }}
          >
            {pendingReviews && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: 'white',
                boxShadow: 'var(--glow-primary)',
                animation: 'pulse 2s infinite',
              }}>
                {stats.peerReviews}
              </div>
            )}
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
            }}>
              👥
            </div>
            <h3 style={{
              marginBottom: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--text-color)',
            }}>
              Peer Reviews
            </h3>
            <p style={{
              margin: 0,
              color: pendingReviews ? 'var(--primary-color)' : 'var(--text-muted)',
              fontSize: '0.95rem',
              fontWeight: pendingReviews ? '600' : '400',
            }}>
              {pendingReviews ? `${stats.peerReviews} reviews pending` : 'Review submissions from peers'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
