import React, { useEffect, useState } from 'react'

const QuickStats = ({ stats }) => {
  const [animatedStats, setAnimatedStats] = useState({
    submissions: 0,
    feedbacks: 0,
    peerReviews: 0,
  })

  useEffect(() => {
    // Animate counters
    const animate = (target, setter, key) => {
      const duration = 2000
      const increment = duration > 0 ? (target / (duration / 16)) : 0
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setter((prev) => ({ ...prev, [key]: Math.round(target) }))
          clearInterval(timer)
          return timer
        } else {
          setter((prev) => ({ ...prev, [key]: Math.round(current) }))
        }
      }, 16)
      return timer // Return timer ID for cleanup
    }

    const peerReviewsValue = stats?.peerReviews ?? 0
    const submissionsValue = stats?.submissions ?? 0
    const feedbacksValue = stats?.feedbacks ?? 0
    
    const timers = []
    timers.push(animate(submissionsValue, setAnimatedStats, 'submissions'))
    timers.push(animate(feedbacksValue, setAnimatedStats, 'feedbacks'))
    timers.push(animate(peerReviewsValue, setAnimatedStats, 'peerReviews'))
    
    return () => {
      timers.forEach(timer => timer && clearInterval(timer))
    }
  }, [stats]) // Removed animatedStats.peerReviews to prevent infinite loop

  const statItems = [
    {
      label: 'Submissions',
      value: animatedStats.submissions,
      icon: '📝',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      label: 'Feedbacks',
      value: animatedStats.feedbacks,
      icon: '💬',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    },
    {
      label: 'Peer Reviews',
      value: animatedStats.peerReviews,
      icon: '👥',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      {statItems.map((stat, index) => (
        <div
          key={stat.label}
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '140px',
            transition: 'var(--transition)',
            animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
            e.currentTarget.style.boxShadow = `var(--shadow-xl), 0 0 20px ${stat.color}40`
            e.currentTarget.style.borderColor = stat.color
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: stat.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: `0 0 15px ${stat.color}40`,
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: 'var(--text-color)',
                lineHeight: '1',
                marginBottom: '0.25rem',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default QuickStats
