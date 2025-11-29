import React, { useState, useEffect } from 'react'
import api from '../../../services/api'

const FeedbackReactions = ({ feedbackId }) => {
  const [reactions, setReactions] = useState({ counts: {}, user_reaction: null })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReactions()
  }, [feedbackId])

  const loadReactions = async () => {
    try {
      // Feedback reactions endpoint not yet implemented in backend
      // This feature will be added in a future update
      setReactions({ counts: {}, user_reaction: null })
    } catch (err) {
      // Reactions might not exist yet
      setReactions({ counts: {}, user_reaction: null })
    }
  }

  const handleReaction = async (reactionType) => {
    try {
      setLoading(true)
      // Feedback reactions endpoint not yet implemented in backend
      // This feature will be added in a future update
      // Feature coming soon - could add toast notification here
    } catch (err) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const reactionTypes = [
    { type: 'helpful', icon: '👍', label: 'Helpful' },
    { type: 'not_helpful', icon: '👎', label: 'Not Helpful' },
    { type: 'insightful', icon: '💡', label: 'Insightful' },
    { type: 'confusing', icon: '❓', label: 'Confusing' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--border-color)',
    }}>
      {reactionTypes.map((reaction) => {
        const count = reactions.counts[reaction.type] || 0
        const isActive = reactions.user_reaction === reaction.type
        
        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              background: isActive 
                ? 'rgba(251, 146, 60, 0.2)' 
                : 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${isActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-color)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              if (!loading && !isActive) {
                e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)'
                e.currentTarget.style.borderColor = 'var(--primary-color)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isActive) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }
            }}
          >
            <span>{reaction.icon}</span>
            <span>{reaction.label}</span>
            {count > 0 && (
              <span style={{
                marginLeft: '0.25rem',
                fontSize: '0.75rem',
                opacity: 0.7,
              }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default FeedbackReactions

