import React, { useState, useEffect } from 'react'
import '../styles/components/TimeTracking.css'

const TimeTracking = () => {
  const [tracking, setTracking] = useState(null)
  const [stats, setStats] = useState({
    total_seconds: 0,
    session_count: 0,
    average_seconds: 0,
  })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load saved stats + active session from localStorage on mount
  useEffect(() => {
    try {
      const savedStatsRaw = window.localStorage.getItem('timeTrackingStats')
      if (savedStatsRaw) {
        const parsed = JSON.parse(savedStatsRaw)
        setStats({
          total_seconds: parsed.total_seconds || 0,
          session_count: parsed.session_count || 0,
          average_seconds: parsed.average_seconds || 0,
        })
      }
    } catch {
      // ignore localStorage errors, keep defaults
    }

    try {
      const activeRaw = window.localStorage.getItem('timeTrackingActive')
      if (activeRaw) {
        const active = JSON.parse(activeRaw)
        if (active && active.start_time) {
          setTracking(active)
          const diff = Math.max(0, Math.floor((Date.now() - active.start_time) / 1000))
          setElapsedSeconds(diff)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Tick elapsed time every second while tracking
  useEffect(() => {
    if (!tracking) return

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [tracking])

  const persistStats = (nextStats) => {
    setStats(nextStats)
    try {
      window.localStorage.setItem('timeTrackingStats', JSON.stringify(nextStats))
    } catch {
      // ignore
    }
  }

  const persistActiveTracking = (session) => {
    setTracking(session)
    try {
      if (session) {
        window.localStorage.setItem('timeTrackingActive', JSON.stringify(session))
      } else {
        window.localStorage.removeItem('timeTrackingActive')
      }
    } catch {
      // ignore
    }
  }

  const startTracking = async (activityType = 'focus') => {
    try {
      setLoading(true)
      const session = {
        activity_type: activityType,
        start_time: Date.now(),
      }
      setElapsedSeconds(0)
      persistActiveTracking(session)
    } finally {
      setLoading(false)
    }
  }

  const stopTracking = async () => {
    if (!tracking) return
    try {
      setLoading(true)
      const endTime = Date.now()
      const durationSeconds = Math.max(
        1,
        Math.floor((endTime - tracking.start_time) / 1000),
      )

      const totalSeconds = (stats.total_seconds || 0) + durationSeconds
      const sessionCount = (stats.session_count || 0) + 1
      const averageSeconds =
        sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0

      persistStats({
        total_seconds: totalSeconds,
        session_count: sessionCount,
        average_seconds: averageSeconds,
      })

      persistActiveTracking(null)
      setElapsedSeconds(0)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  return (
    <div className="card time-tracking">
      <h3 className="time-tracking__title">
        ⏱️ Time Tracking
      </h3>
      
      {tracking ? (
        <div>
          <div className="time-tracking__active">
            <div className="time-tracking__active-icon">⏳</div>
            <div className="time-tracking__active-label">
              Tracking Active
            </div>
            <div className="time-tracking__active-time">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="time-tracking__active-start">
              Started: {new Date(tracking.start_time || Date.now()).toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={stopTracking}
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Stopping...' : '⏹️ Stop Tracking'}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => startTracking('submission')}
            disabled={loading}
            className="btn btn-primary btn-block time-tracking__button"
          >
            {loading ? 'Starting...' : '▶️ Start Tracking'}
          </button>
        </div>
      )}

      {stats && (
        <div className="time-tracking__stats">
          <h4 className="time-tracking__stats-title">Statistics</h4>
          <div className="time-tracking__stats-grid">
            <div className="time-tracking__stat-item">
              <div className="time-tracking__stat-label">
                Total Time
              </div>
              <div className="time-tracking__stat-value">
                {formatTime(stats.total_seconds || 0)}
              </div>
            </div>
            <div className="time-tracking__stat-item">
              <div className="time-tracking__stat-label">
                Sessions
              </div>
              <div className="time-tracking__stat-value">
                {stats.session_count || 0}
              </div>
            </div>
            <div className="time-tracking__stat-item">
              <div className="time-tracking__stat-label">
                Average
              </div>
              <div className="time-tracking__stat-value">
                {formatTime(Math.round(stats.average_seconds || 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeTracking

