import React, { useEffect, useState } from 'react'
import '../styles/components/QuickStats.css'

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
      colorClass: 'indigo',
    },
    {
      label: 'Feedbacks',
      value: animatedStats.feedbacks,
      icon: '💬',
      colorClass: 'green',
    },
    {
      label: 'Peer Reviews',
      value: animatedStats.peerReviews,
      icon: '👥',
      colorClass: 'orange',
    },
  ]

  return (
    <div className="quick-stats">
      {statItems.map((stat, index) => (
        <div
          key={stat.label}
          className={`quick-stats__item quick-stats__item--${stat.colorClass}`}
          style={{
            animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
          }}
        >
          <div className="quick-stats__content">
            <div className={`quick-stats__icon quick-stats__icon--${stat.colorClass}`}>
              {stat.icon}
            </div>
            <div>
              <div className="quick-stats__value">
                {stat.value}
              </div>
              <div className="quick-stats__label">
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
