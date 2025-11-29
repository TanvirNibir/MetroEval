import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import QuickStats from '../../../components/QuickStats'
import '../../../styles/features/submissions/Submissions.css'

const TeacherStudents = () => {
  const { user } = useAuth()
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentSubmissions, setStudentSubmissions] = useState([])

  useEffect(() => {
    loadStudents()
  }, [currentDepartment])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const profileData = await api.get('/v1/user/profile')
      const teacherDepartment = profileData.department
      if (teacherDepartment && teacherDepartment !== currentDepartment) {
        setCurrentDepartment(teacherDepartment)
      }

      // Get all submissions from department to extract unique students
      const params = teacherDepartment ? { department: teacherDepartment } : {}
      const submissionsData = await api.get('/v1/submissions', { params })
      
      // Group by student
      const studentMap = new Map()
      if (Array.isArray(submissionsData)) {
        submissionsData.forEach(sub => {
          if (!studentMap.has(sub.user_name)) {
            studentMap.set(sub.user_name, {
              name: sub.user_name,
              department: sub.department,
              submissions: [],
              totalSubmissions: 0,
              avgScore: 0,
            })
          }
          const student = studentMap.get(sub.user_name)
          if (student && Array.isArray(student.submissions)) {
            student.submissions.push(sub)
            student.totalSubmissions++
          }
        })
      }

      // Calculate average scores for each student
      for (const [name, student] of studentMap.entries()) {
        let totalScore = 0
        let scoreCount = 0
        if (Array.isArray(student.submissions)) {
          for (const sub of student.submissions.slice(0, 10)) {
            try {
              const subData = await api.get(`/v1/submission/${sub.id}`)
              if (subData.feedbacks && Array.isArray(subData.feedbacks) && subData.feedbacks.length > 0) {
                subData.feedbacks.forEach(fb => {
                  if (fb.scores) {
                    const values = Object.values(fb.scores)
                    if (values.length > 0) {
                      const avg = values.reduce((a, b) => a + b, 0) / values.length
                      if (!isNaN(avg) && isFinite(avg)) {
                        totalScore += avg
                        scoreCount++
                      }
                    }
                  }
                })
              }
            } catch (e) {
              // Skip errors
            }
          }
        }
        student.avgScore = scoreCount > 0 ? (totalScore / scoreCount * 100) : 0
      }

      setStudents(Array.from(studentMap.values()))
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudent = async (studentName) => {
    try {
      const params = currentDepartment ? { department: currentDepartment } : {}
      const submissionsData = await api.get('/v1/submissions', { params })
      const studentSubs = Array.isArray(submissionsData) ? submissionsData.filter(s => s.user_name === studentName) : []
      setStudentSubmissions(studentSubs)
      setSelectedStudent(studentName)
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  const filteredStudents = Array.isArray(students) ? students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Students...</p>
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
              🧑‍🎓 Department Students
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              View and manage students in {currentDepartment || 'your department'}
            </p>
          </div>
          <QuickStats stats={{
            submissions: students.length,
            feedbacks: Array.isArray(students) ? students.reduce((sum, s) => sum + s.totalSubmissions, 0) : 0,
            peerReviews: Array.isArray(students) ? students.length : 0,
          }} />
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Students List */}
      <div className="card">
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
        }}>
          Students ({filteredStudents.length})
        </h3>

        {filteredStudents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p>No students found.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {filteredStudents.map((student, idx) => (
              <div
                key={student.name || `student-${idx}`}
                className="card"
                style={{
                  padding: '1.5rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onClick={() => handleViewStudent(student.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.borderColor = 'var(--primary-color)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      marginBottom: '0.25rem',
                      color: 'var(--text-color)',
                    }}>
                      {student.name}
                    </h4>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                    }}>
                      {student.department}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--primary-color)',
                    }}>
                      {student.totalSubmissions}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}>
                      Submissions
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: student.avgScore >= 70 ? '#10b981' : '#fb923c',
                    }}>
                      {student.avgScore.toFixed(0)}%
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}>
                      Avg Score
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
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
          setSelectedStudent(null)
          setStudentSubmissions([])
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
                {selectedStudent}'s Submissions
              </h3>
              <button
                onClick={() => {
                  setSelectedStudent(null)
                  setStudentSubmissions([])
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
              {studentSubmissions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No submissions found for this student.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {studentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                        {sub.title}
                      </h4>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                      }}>
                        <span>Type: {sub.type}</span> • <span>Status: {sub.status}</span> • <span>Date: {sub.created_at ? (() => { try { return new Date(sub.created_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}</span>
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

export default TeacherStudents

