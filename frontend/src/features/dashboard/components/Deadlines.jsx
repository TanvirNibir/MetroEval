import React, { useState, useEffect } from 'react'
import api from '../../../services/api'

const Deadlines = () => {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeadlines()
  }, [])

  const loadDeadlines = async () => {
    try {
      setLoading(true)
      // Deadlines endpoint not yet implemented in backend
      // This feature will be added in a future update
      setDeadlines([])
    } catch (err) {
      // Error already handled by API interceptor
      setDeadlines([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntil = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  if (loading) {
    return (
      <div className="card" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        padding: '1.5rem',
      }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading deadlines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      padding: '1.5rem',
    }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📅 Upcoming Deadlines
      </h3>
      
      {deadlines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <p>No upcoming deadlines</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deadlines.map((deadline) => {
            const daysUntil = getDaysUntil(deadline.due_date)
            const isUrgent = daysUntil <= 3
            const isOverdue = daysUntil < 0

            return (
              <div
                key={deadline.id}
                style={{
                  padding: '1rem',
                  background: isOverdue
                    ? 'rgba(239, 68, 68, 0.2)'
                    : isUrgent
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${
                    isOverdue
                      ? 'rgba(239, 68, 68, 0.3)'
                      : isUrgent
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'var(--border-color)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>{deadline.title}</h4>
                  <span className={`badge ${
                    isOverdue
                      ? 'badge-error'
                      : isUrgent
                      ? 'badge-warning'
                      : 'badge-success'
                  }`}>
                    {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
                  </span>
                </div>
                {deadline.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {deadline.description}
                  </p>
                )}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>Due:</strong> {new Date(deadline.due_date).toLocaleString()}
                  {deadline.course && (
                    <span style={{ marginLeft: '1rem' }}>
                      <strong>Course:</strong> {deadline.course}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Deadlines

