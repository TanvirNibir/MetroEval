import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from './Footer'
import NotificationBell from './NotificationBell'
import '../styles/components/Layout.css'

const Layout = ({ children }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isTeacher = user?.role === 'teacher'
  const [navbarVisible, setNavbarVisible] = useState(true)

  // Load navbar state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('navbarVisible')
      if (savedState !== null) {
        setNavbarVisible(savedState === 'true')
      }
    } catch (e) {
      // localStorage might be disabled or quota exceeded - silently fail
    }
  }, [])

  // Save navbar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('navbarVisible', navbarVisible.toString())
    } catch (e) {
      // localStorage might be disabled or quota exceeded - silently fail
    }
  }, [navbarVisible])

  const toggleNavbar = () => {
    setNavbarVisible(!navbarVisible)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <div>
      {/* Navbar Toggle Button */}
      <button
        onClick={toggleNavbar}
        className="navbar-toggle"
        style={{
          position: 'fixed',
          top: navbarVisible ? '80px' : '10px',
          right: '20px',
          zIndex: 101, /* Just above navbar, but below modals */
          background: 'rgba(251, 146, 60, 0.9)',
          border: '1px solid rgba(251, 146, 60, 0.5)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.2rem',
          color: 'white',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 146, 60, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)'
        }}
        title={navbarVisible ? 'Hide Navigation' : 'Show Navigation'}
      >
        {navbarVisible ? '⬆️' : '⬇️'}
      </button>

      <nav className={`navbar ${!navbarVisible ? 'navbar-hidden' : ''}`}>
        <Link 
          to={isTeacher ? "/teacher-dashboard" : "/dashboard"} 
          className="nav-brand"
        >
          <div className="nav-logo">
            🎓
          </div>
          <div className="nav-brand-text">
            MetroEval
          </div>
        </Link>
        <div className="nav-links-container">
          <div className="nav-main-links">
            {isTeacher ? (
              <>
                {/* Teacher Navigation */}
              {[
                { path: '/teacher-dashboard', label: 'Dashboard' },
                { path: '/teacher-submissions', label: 'Submissions' },
                { path: '/teacher-feedback', label: 'Feedback' },
                { path: '/teacher-analytics', label: 'Analytics' },
                { path: '/teacher-students', label: 'Students' },
                { path: '/teacher-peer-reviews', label: 'Peer Reviews' },
                { path: '/flashcards', label: 'Flashcards' },
                { path: '/templates', label: 'Templates' },
                { path: '/resources', label: 'Resources' },
              ].map((nav) => (
                <Link
                  key={nav.path}
                  to={nav.path}
                  className={`nav-link ${location.pathname === nav.path ? 'active' : ''}`}
                >
                  {nav.label}
                </Link>
              ))}
              </>
            ) : (
            <>
              {/* Student Navigation */}
              {[
                { path: '/dashboard', label: 'Dashboard' },
                { path: '/submissions', label: 'Submissions' },
                { path: '/feedback', label: 'Feedback' },
                { path: '/peer-reviews', label: 'Peer Reviews' },
                { path: '/flashcards', label: 'Flashcards' },
                { path: '/bookmarks', label: 'Bookmarks' },
                { path: '/templates', label: 'Templates' },
                { path: '/resources', label: 'Resources' },
                { path: '/tutor', label: 'AI Tutor' },
              ].map((nav) => (
                <Link
                  key={nav.path}
                  to={nav.path}
                  className={`nav-link ${location.pathname === nav.path ? 'active' : ''}`}
                >
                  {nav.label}
                </Link>
              ))}
            </>
          )}
          </div>
          
          {/* Profile, About, and Logout */}
          <div className="nav-utility-links">
            <NotificationBell />
            {/* Profile Picture */}
            <Link 
              to="/profile" 
              className={`nav-profile-link ${location.pathname === '/profile' ? 'active' : ''}`}
              title={user?.name || 'Profile'}
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'Profile'}
                  className="nav-profile-picture"
                />
              ) : (
                <div className="nav-profile-initials">
                  {getInitials(user?.name || 'U')}
                </div>
              )}
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout

