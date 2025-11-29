import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

const MAX_NOTIFICATIONS = 50
const INITIAL_RECONNECT_DELAY_MS = 5000
const MAX_RECONNECT_DELAY_MS = 60000
const MAX_CONSECUTIVE_FAILURES = 5

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('idle')
  const eventSourceRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const consecutiveFailuresRef = useRef(0)
  const currentReconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS)
  const backendAvailableRef = useRef(false)

  const syncUnreadCount = (list) => {
    setUnreadCount(list.filter((n) => !n.is_read).length)
  }

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }

  const resetReconnectState = () => {
    consecutiveFailuresRef.current = 0
    currentReconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS
  }

  const loadNotifications = async () => {
    try {
      const data = await api.get('/v1/notifications')
      const normalized = Array.isArray(data) ? data : data?.data || []
      setNotifications(normalized)
      syncUnreadCount(normalized)
      backendAvailableRef.current = true
      resetReconnectState()
      return true
    } catch (error) {
      backendAvailableRef.current = false
      setConnectionStatus('disconnected')
      return false
    }
  }

  const handleIncomingNotification = (payload) => {
    setNotifications((prev) => {
      const next = [payload, ...prev.filter((item) => item.id !== payload.id)]
      return next.slice(0, MAX_NOTIFICATIONS)
    })
    setUnreadCount((prev) => (payload.is_read ? prev : prev + 1))
  }

  const startEventStream = () => {
    if (!user || typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      return
    }

    // Don't attempt connection if backend is not available
    if (!backendAvailableRef.current) {
      setConnectionStatus('disconnected')
      return
    }

    // Stop retrying if we've had too many consecutive failures
    if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
      setConnectionStatus('disconnected')
      // Check backend availability again after a longer delay
      reconnectTimeoutRef.current = setTimeout(async () => {
        const available = await loadNotifications()
        if (available) {
          resetReconnectState()
          startEventStream()
        }
      }, MAX_RECONNECT_DELAY_MS)
      return
    }

    closeEventSource()

    try {
      const source = new EventSource('/api/v1/notifications/stream', { withCredentials: true })
      eventSourceRef.current = source
      setConnectionStatus('connecting')

      source.addEventListener('open', () => {
        setConnectionStatus('connected')
        resetReconnectState()
      })

      source.addEventListener('notification', (event) => {
        try {
          const payload = JSON.parse(event.data)
          handleIncomingNotification(payload)
        } catch (parseError) {
          // Failed to parse notification - silently skip
        }
      })

      source.addEventListener('error', () => {
        setConnectionStatus('disconnected')
        closeEventSource()
        
        consecutiveFailuresRef.current++
        // Exponential backoff with max limit
        currentReconnectDelayRef.current = Math.min(
          currentReconnectDelayRef.current * 1.5,
          MAX_RECONNECT_DELAY_MS
        )

        reconnectTimeoutRef.current = setTimeout(() => {
          startEventStream()
        }, currentReconnectDelayRef.current)
      })
    } catch (streamError) {
      setConnectionStatus('error')
      consecutiveFailuresRef.current++
      currentReconnectDelayRef.current = Math.min(
        currentReconnectDelayRef.current * 1.5,
        MAX_RECONNECT_DELAY_MS
      )
    }
  }

  useEffect(() => {
    if (!user) {
      closeEventSource()
      setNotifications([])
      setUnreadCount(0)
      setConnectionStatus('idle')
      backendAvailableRef.current = false
      resetReconnectState()
      return
    }

    let cancelled = false
    const init = async () => {
      const backendAvailable = await loadNotifications()
      if (!cancelled && backendAvailable) {
        startEventStream()
      } else if (!cancelled) {
        setConnectionStatus('disconnected')
      }
    }

    init()

    return () => {
      cancelled = true
      closeEventSource()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/v1/notification/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      )
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/v1/notifications/read-all')
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    connectionStatus,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

