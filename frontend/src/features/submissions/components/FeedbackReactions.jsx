import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import '../../../styles/features/submissions/FeedbackReactions.css'

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
    <div className="feedback-reactions">
      {reactionTypes.map((reaction) => {
        const count = reactions.counts[reaction.type] || 0
        const isActive = reactions.user_reaction === reaction.type
        
        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            disabled={loading}
            className={`feedback-reactions__button ${isActive ? 'feedback-reactions__button--active' : ''}`}
          >
            <span>{reaction.icon}</span>
            <span>{reaction.label}</span>
            {count > 0 && (
              <span className="feedback-reactions__count">
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

