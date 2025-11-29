import React, { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../context/NotificationContext'

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, connectionStatus } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now'
    const created = new Date(timestamp)
    const difference = Date.now() - created.getTime()
    const minutes = Math.floor(difference / 60000)
    const hours = Math.floor(difference / 3600000)
    const days = Math.floor(difference / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return created.toLocaleDateString()
  }

  const showConnectionNotice = connectionStatus !== 'connected' && connectionStatus !== 'idle'

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <span className="notification-bell-icon" aria-hidden="true">
          🔔
        </span>
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <p>Notifications</p>
              {showConnectionNotice && (
                <small className="notification-connection">{connectionStatus}…</small>
              )}
            </div>
            {unreadCount > 0 && (
              <button type="button" className="mark-all-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">You’re all caught up! 🎉</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-item-header">
                    <span className="notification-item-title">{notification.title}</span>
                    <span className="notification-item-time">{formatTimeAgo(notification.created_at)}</span>
                  </div>
                  <p className="notification-item-message">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell


