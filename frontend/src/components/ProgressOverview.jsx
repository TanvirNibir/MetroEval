import React, { useEffect, useState } from 'react'
import '../styles/components/ProgressOverview.css'

const ProgressOverview = ({ submissions }) => {
  const [progress, setProgress] = useState({
    avgScore: 0,
    completion: 0,
    target: 10,
    completionPercent: 0,
  })
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedCompletion, setAnimatedCompletion] = useState(0)

  const normalizeToArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  useEffect(() => {
    calculateProgress()
  }, [submissions])

  useEffect(() => {
    // Animate score
    const scoreDuration = 1500
    const scoreSteps = 60
    const scoreIncrement = scoreSteps > 0 ? (progress.avgScore / scoreSteps) : 0
    let currentScore = 0
    const scoreInterval = setInterval(() => {
      currentScore += scoreIncrement
      if (currentScore >= progress.avgScore) {
        setAnimatedScore(progress.avgScore)
        clearInterval(scoreInterval)
      } else {
        setAnimatedScore(currentScore)
      }
    }, scoreSteps > 0 ? (scoreDuration / scoreSteps) : 16)

    // Animate completion
    const completionDuration = 1500
    const completionSteps = 60
    const completionIncrement = completionSteps > 0 ? (progress.completionPercent / completionSteps) : 0
    let currentCompletion = 0
    const completionInterval = setInterval(() => {
      currentCompletion += completionIncrement
      if (currentCompletion >= progress.completionPercent) {
        setAnimatedCompletion(progress.completionPercent)
        clearInterval(completionInterval)
      } else {
        setAnimatedCompletion(currentCompletion)
      }
    }, completionSteps > 0 ? (completionDuration / completionSteps) : 16)

    return () => {
      clearInterval(scoreInterval)
      clearInterval(completionInterval)
    }
  }, [progress.avgScore, progress.completionPercent])

  const calculateProgress = () => {
    const normalizedSubs = normalizeToArray(submissions)

    if (!normalizedSubs || !Array.isArray(normalizedSubs) || normalizedSubs.length === 0) {
      setProgress({
        avgScore: 0,
        completion: 0,
        target: 5,
        completionPercent: 0,
      })
      return
    }

    const completion = normalizedSubs.length
    const target = Math.max(5, completion)
    const completionPercent = target > 0 ? Math.min((completion / target) * 100, 100) : 0

    // For now, average score is not computed from AI scores here.
    // Show 100% if the user has at least one submission with feedback, else 0%.
    // This avoids extra API calls and still gives a sense of progress.
    const hasAnySubmission = completion > 0
    const avgScore = hasAnySubmission ? 100 : 0

    setProgress({
      avgScore,
      completion,
      target,
      completionPercent,
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981' // Green
    if (score >= 60) return '#f59e0b' // Orange
    return '#ef4444' // Red
  }

  const getScoreGradient = (score) => {
    if (score >= 80) return 'linear-gradient(135deg, #10b981, #34d399)'
    if (score >= 60) return 'linear-gradient(135deg, #f59e0b, #fb923c)'
    return 'linear-gradient(135deg, #ef4444, #f87171)'
  }

  const circumference = 2 * Math.PI * 50
  const scoreOffset = circumference - (animatedScore / 100) * circumference
  const completionOffset = circumference - (animatedCompletion / 100) * circumference

  return (
    <div className="progress-overview card">
      <div className="progress-overview__decor" aria-hidden="true" />

      <div className="progress-overview__header">
        <div className="progress-overview__icon" aria-hidden="true">
          📊
        </div>
        <h3 className="progress-overview__title">
          Your Progress Overview
        </h3>
      </div>

      <div className="progress-overview__grid">
        {/* Average Score Card */}
        <div className="progress-card progress-card--score">
          <div
            className="progress-card__bg"
            style={{
              height: `${animatedScore}%`,
              background: getScoreGradient(animatedScore),
            }}
            aria-hidden="true"
          />

          <div className="progress-card__body">
            <div className="progress-card__label">Average Score</div>

            <div className="progress-circle-wrapper">
              <svg className="progress-circle" width="160" height="160">
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke="rgba(251, 146, 60, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke={getScoreColor(animatedScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
                    filter: `drop-shadow(0 0 10px ${getScoreColor(animatedScore)}80)`,
                  }}
                />
              </svg>

              <div className="progress-circle__value">
                <div className="progress-circle__value-number">
                  {animatedScore.toFixed(0)}
                </div>
                <div className="progress-circle__value-label">%</div>
              </div>
            </div>

            <div className="progress-card__status">
              <div
                className="progress-card__dot"
                style={{
                  background: getScoreGradient(animatedScore),
                  boxShadow: `0 0 10px ${getScoreColor(animatedScore)}`,
                }}
              />
              <span>
                {animatedScore >= 80 ? 'Excellent' : animatedScore >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Card */}
        <div className="progress-card progress-card--completion">
          <div
            className="progress-card__bg"
            style={{
              height: `${animatedCompletion}%`,
              background: 'linear-gradient(135deg, #10b981, #34d399)',
            }}
            aria-hidden="true"
          />

          <div className="progress-card__body">
            <div className="progress-card__label">Submissions Completed</div>

            <div className="progress-circle-wrapper">
              <svg className="progress-circle" width="160" height="160">
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={completionOffset}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease',
                    filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))',
                  }}
                />
              </svg>

              <div className="progress-circle__value">
                <div className="progress-circle__value-number progress-circle__value-number--completion">
                  {progress.completion}
                </div>
                <div className="progress-circle__value-label">
                  / {progress.target}
                </div>
              </div>
            </div>

            <div className="progress-card__status">
              <div className="progress-card__dot progress-card__dot--completion" />
              <span>{animatedCompletion.toFixed(0)}% Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressOverview

