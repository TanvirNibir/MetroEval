import React, { useState, useEffect } from 'react'

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
    <div className="card" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      padding: '1.5rem',
    }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ⏱️ Time Tracking
      </h3>
      
      {tracking ? (
        <div>
          <div style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Tracking Active
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {formatTime(elapsedSeconds)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
            className="btn btn-primary btn-block"
            style={{ marginBottom: '0.5rem' }}
          >
            {loading ? 'Starting...' : '▶️ Start Tracking'}
          </button>
        </div>
      )}

      {stats && (
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Statistics</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
          }}>
            <div style={{
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Total Time
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {formatTime(stats.total_seconds || 0)}
              </div>
            </div>
            <div style={{
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Sessions
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {stats.session_count || 0}
              </div>
            </div>
            <div style={{
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Average
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
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

