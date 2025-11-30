import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/components/PublicNavbar.css'

const PublicNavbar = () => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="public-navbar">
      {/* Logo/Brand */}
      <Link to="/" className="navbar-brand">
        <div className="navbar-brand-icon">🎓</div>
        <span className="navbar-brand-text">MetroEval</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="navbar-links">
        <Link
          to="/"
          className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
        >
          About
        </Link>
        <Link
          to="/login"
          className="navbar-cta"
        >
          Get Started
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="mobile-menu-btn"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}>
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className={`mobile-menu-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          onClick={() => setIsMenuOpen(false)}
          className={`mobile-menu-link ${location.pathname === '/about' ? 'active' : ''}`}
        >
          About
        </Link>
        <Link
          to="/login"
          onClick={() => setIsMenuOpen(false)}
          className="mobile-menu-cta"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

export default PublicNavbar

