import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import QuickStats from '../../../components/QuickStats'
import '../../../styles/features/submissions/Submissions.css'

const TeacherSubmissions = () => {
  const { user } = useAuth()
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  })

  useEffect(() => {
    loadData()
  }, [currentDepartment, filter])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get teacher's department
      const profileData = await api.get('/v1/user/profile')
      const teacherDepartment = profileData.department
      if (teacherDepartment && teacherDepartment !== currentDepartment) {
        setCurrentDepartment(teacherDepartment)
      }

      // Load submissions
      const params = teacherDepartment ? { department: teacherDepartment } : {}
      const data = await api.get('/v1/submissions', { params })
      
      // Filter submissions
      let filtered = data
      if (filter === 'pending') {
        filtered = data.filter(s => s.status === 'pending' || s.status === 'submitted')
      } else if (filter === 'completed') {
        filtered = data.filter(s => s.status === 'completed' || s.status === 'reviewed')
      }

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(s => 
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setSubmissions(filtered)
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter(s => s.status === 'pending' || s.status === 'submitted').length,
        completed: data.filter(s => s.status === 'completed' || s.status === 'reviewed').length,
      })
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
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Submissions...</p>
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
              📚 Student Submissions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              View and manage all submissions from {currentDepartment || 'your department'}
            </p>
          </div>
          <QuickStats stats={{
            submissions: stats.total,
            feedbacks: stats.pending,
            peerReviews: stats.completed,
          }} />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Search by title, student, or type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                loadData()
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-color)',
                fontSize: '0.95rem',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: filter === f 
                    ? 'rgba(251, 146, 60, 0.3)' 
                    : 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${filter === f ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: filter === f ? 'var(--primary-light)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: filter === f ? '700' : '500',
                  textTransform: 'capitalize',
                  transition: 'var(--transition)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
        }}>
          {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Submissions ({Array.isArray(submissions) ? submissions.length : 0})
        </h3>
        
        {(!submissions || !Array.isArray(submissions) || submissions.length === 0) ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ fontSize: '1.1rem' }}>
              No {filter !== 'all' ? filter : ''} submissions found.
            </p>
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
                onClick={() => handleViewSubmission(sub.id)}
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
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}>
                      <span><strong>Student:</strong> {sub.user_name}</span>
                      <span><strong>Type:</strong> {sub.type}</span>
                      <span><strong>Date:</strong> {sub.created_at ? (() => { try { return new Date(sub.created_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}</span>
                    </div>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    background: sub.status === 'completed' || sub.status === 'reviewed'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(251, 146, 60, 0.2)',
                    color: sub.status === 'completed' || sub.status === 'reviewed'
                      ? '#10b981'
                      : '#fb923c',
                    border: `1px solid ${sub.status === 'completed' || sub.status === 'reviewed' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(251, 146, 60, 0.4)'}`,
                  }}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
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
        onClick={() => setSelectedSubmission(null)}
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
                {selectedSubmission.submission.title}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
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
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Student Information</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  <strong>Student:</strong> {selectedSubmission.submission.user_name}<br/>
                  <strong>Type:</strong> {selectedSubmission.submission.type}<br/>
                  <strong>Status:</strong> {selectedSubmission.submission.status}
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Submission Content</h4>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'auto',
                  maxHeight: '400px',
                  fontSize: '0.875rem',
                }}>
                  {selectedSubmission.submission.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherSubmissions

