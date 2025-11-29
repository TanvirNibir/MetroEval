import React, { useState } from 'react'

const FeedbackVisualization = ({ feedback }) => {
  // Handle missing or invalid feedback prop
  if (!feedback) {
    return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No feedback data available</div>
  }

  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    weaknesses: false,
    suggestions: false,
    details: false,
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Parse feedback text to extract structured information
  const parseFeedback = (text) => {
    if (!text) return null

    const result = {
      overallScore: null,
      scores: {},
      strengths: [],
      weaknesses: [],
      suggestions: [],
      summary: '',
      details: text,
    }

    // Extract scores from feedback.scores if available
    if (feedback.scores) {
      result.scores = feedback.scores
      // Calculate overall score if multiple scores exist
      const scoreValues = Object.values(feedback.scores).map(s => {
        const num = typeof s === 'string' ? parseFloat(s.replace('%', '')) : s * 100
        return isNaN(num) ? 0 : num
      })
      if (scoreValues.length > 0) {
        result.overallScore = scoreValues.length > 0 ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0
      }
    }

    // Try to parse structured feedback from text
    const lines = (text || '').split('\n').map(l => l.trim()).filter(l => l)
    
    let currentSection = null
    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      
      // Detect sections
      if (lowerLine.includes('strength') || lowerLine.includes('what went well') || lowerLine.includes('good')) {
        currentSection = 'strengths'
        return
      }
      if (lowerLine.includes('weakness') || lowerLine.includes('improve') || lowerLine.includes('issue') || lowerLine.includes('problem')) {
        currentSection = 'weaknesses'
        return
      }
      if (lowerLine.includes('suggestion') || lowerLine.includes('recommendation') || lowerLine.includes('tip')) {
        currentSection = 'suggestions'
        return
      }
      if (lowerLine.includes('summary') || lowerLine.includes('overall')) {
        currentSection = 'summary'
        return
      }

      // Extract bullet points
      if (line.match(/^[•\-\*]\s+/) || line.match(/^\d+\.\s+/)) {
        const content = (line || '').replace(/^[•\-\*]\d+\.\s+/, '').trim()
        if (currentSection === 'strengths' && content) {
          result.strengths.push(content)
        } else if (currentSection === 'weaknesses' && content) {
          result.weaknesses.push(content)
        } else if (currentSection === 'suggestions' && content) {
          result.suggestions.push(content)
        }
      } else if (currentSection === 'summary' && line.length > 20) {
        result.summary = line
      }
    })

    // If no structured data found, create a simple summary
    if (result.strengths.length === 0 && result.weaknesses.length === 0 && result.suggestions.length === 0) {
      // Try to extract first few sentences as summary
      const sentences = (text || '').split(/[.!?]+/).filter(s => s.trim().length > 20)
      if (sentences.length > 0) {
        result.summary = sentences.slice(0, 2).join('. ') + '.'
      }
    }

    return result
  }

  const parsed = parseFeedback(feedback.text || feedback.feedback_text || '')

  if (!parsed) return null

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const CircularProgress = ({ score, label, size = 80 }) => {
    const percentage = typeof score === 'string' ? parseFloat(score.replace('%', '')) : score * 100
    const numScore = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage))
    const radius = size / 2 - 8
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (numScore / 100) * circumference
    const color = getScoreColor(numScore)

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div className="feedback-circular-progress" style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="6"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `drop-shadow(0 0 8px ${color}60)`,
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: color,
          }}>
            {Math.round(numScore)}%
          </div>
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600',
        }}>
          {label}
        </div>
      </div>
    )
  }

  const ProgressBar = ({ score, label, color }) => {
    const percentage = typeof score === 'string' ? parseFloat(score.replace('%', '')) : score * 100
    const numScore = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage))
    const barColor = color || getScoreColor(numScore)

    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
        }}>
          <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>{label}</span>
          <span style={{ color: barColor, fontWeight: '700' }}>{Math.round(numScore)}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div className="feedback-progress-bar" style={{
            width: `${numScore}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
            borderRadius: '6px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 10px ${barColor}40`,
          }} />
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-visualization" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: 'var(--glow-primary)',
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-color)' }}>
              AI Feedback
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {feedback.reviewer_name || 'AI Assistant'}
            </div>
          </div>
        </div>
        {parsed.overallScore !== null && (
          <div style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: getScoreColor(parsed.overallScore),
            textShadow: `0 0 20px ${getScoreColor(parsed.overallScore)}40`,
          }}>
            {Math.round(parsed.overallScore)}%
          </div>
        )}
      </div>

      {/* Quick Summary */}
      {parsed.summary && (
        <div style={{
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderLeft: '4px solid var(--primary-color)',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.5rem',
            fontWeight: '700',
            color: 'var(--primary-color)',
          }}>
            <span>💡</span>
            <span>Quick Summary</span>
          </div>
          <p style={{ 
            margin: 0, 
            color: 'var(--text-color)',
            lineHeight: '1.6',
          }}>
            {parsed.summary}
          </p>
        </div>
      )}

      {/* Score Visualizations */}
      {Object.keys(parsed.scores).length > 0 && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 'var(--radius-md)',
        }}>
          <h4 style={{ 
            marginBottom: '1rem', 
            color: 'var(--text-color)',
            fontSize: '1rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            📊 Performance Scores
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            {Object.entries(parsed.scores).slice(0, 4).map(([key, value]) => (
              <CircularProgress 
                key={key} 
                score={value} 
                label={(key || '').charAt(0).toUpperCase() + (key || '').slice(1).replace(/_/g, ' ')}
              />
            ))}
          </div>
          {Object.entries(parsed.scores).length > 4 && (
            <div style={{ marginTop: '1rem' }}>
              {Object.entries(parsed.scores).slice(4).map(([key, value]) => (
                <ProgressBar 
                  key={key} 
                  score={value} 
                  label={(key || '').charAt(0).toUpperCase() + (key || '').slice(1).replace(/_/g, ' ')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strengths */}
      {parsed.strengths.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => toggleSection('strengths')}
            className="feedback-section-button"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              cursor: 'pointer',
              borderLeft: '4px solid #10b981',
              marginBottom: expandedSections.strengths ? '0.75rem' : '0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <span style={{ fontWeight: '700', color: '#10b981' }}>
                Strengths ({parsed.strengths.length})
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {expandedSections.strengths ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.strengths && (
            <div className="feedback-section-content" style={{
              padding: '0 1rem 1rem 1rem',
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            }}>
              {parsed.strengths.map((strength, idx) => (
                <div key={`strength-${idx}-${(strength || '').substring(0, 15)}`} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid #10b981',
                }}>
                  <span style={{ fontSize: '1rem' }}>✨</span>
                  <span style={{ color: 'var(--text-color)', lineHeight: '1.6' }}>{strength}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weaknesses */}
      {parsed.weaknesses.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => toggleSection('weaknesses')}
            className="feedback-section-button"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              cursor: 'pointer',
              borderLeft: '4px solid #ef4444',
              marginBottom: expandedSections.weaknesses ? '0.75rem' : '0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span style={{ fontWeight: '700', color: '#ef4444' }}>
                Areas to Improve ({parsed.weaknesses.length})
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {expandedSections.weaknesses ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.weaknesses && (
            <div className="feedback-section-content" style={{
              padding: '0 1rem 1rem 1rem',
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            }}>
              {parsed.weaknesses.map((weakness, idx) => (
                <div key={`weakness-${idx}-${(weakness || '').substring(0, 15)}`} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid #ef4444',
                }}>
                  <span style={{ fontSize: '1rem' }}>🔧</span>
                  <span style={{ color: 'var(--text-color)', lineHeight: '1.6' }}>{weakness}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {parsed.suggestions.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => toggleSection('suggestions')}
            className="feedback-section-button"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              cursor: 'pointer',
              borderLeft: '4px solid var(--primary-color)',
              marginBottom: expandedSections.suggestions ? '0.75rem' : '0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span>
              <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                Suggestions ({parsed.suggestions.length})
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {expandedSections.suggestions ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.suggestions && (
            <div className="feedback-section-content" style={{
              padding: '0 1rem 1rem 1rem',
              background: 'rgba(251, 146, 60, 0.05)',
              borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            }}>
              {parsed.suggestions.map((suggestion, idx) => (
                <div key={`suggestion-${idx}-${(suggestion || '').substring(0, 15)}`} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(251, 146, 60, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--primary-color)',
                }}>
                  <span style={{ fontSize: '1rem' }}>🚀</span>
                  <span style={{ color: 'var(--text-color)', lineHeight: '1.6' }}>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Details (Collapsible) */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => toggleSection('details')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          <span>📄 View Full Feedback</span>
          <span>{expandedSections.details ? '▼' : '▶'}</span>
        </button>
        {expandedSections.details && (
          <div style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              whiteSpace: 'pre-wrap',
              color: 'var(--text-color)',
              lineHeight: '1.7',
              fontSize: '0.95rem',
            }}>
              {feedback.text || feedback.feedback_text || ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeedbackVisualization

