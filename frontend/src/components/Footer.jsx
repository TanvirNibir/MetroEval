import React from 'react'

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid rgba(251, 146, 60, 0.4)',
      padding: '2rem',
      marginTop: '4rem',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1, // Ensure footer stays below modals (which have z-index: 2000+)
    }}>
      {/* Background gradient effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.5), transparent)',
      }} />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        {/* MetroEval Branding */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 0 15px rgba(251, 146, 60, 0.4)',
          }}>
            🎓
          </div>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.25rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}>
            MetroEval
          </div>
        </div>

        {/* Credits */}
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}>
          <p style={{
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: 'var(--text-color)',
          }}>
            Developed by
          </p>
          <p style={{
            marginBottom: '0.25rem',
            fontSize: '1rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Tanvir Nibir
          </p>
          <a 
            href="mailto:tanvir.nibir@metropolia.fi"
            style={{
              color: 'var(--primary-light)',
              textDecoration: 'none',
              transition: 'var(--transition)',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-color)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(251, 146, 60, 0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--primary-light)'
              e.currentTarget.style.textShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
            tanvir.nibir@metropolia.fi
          </a>
        </div>

        {/* University Info */}
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginTop: '0.5rem',
        }}>
          <p>
            Metropolia University of Applied Sciences
          </p>
        </div>

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          color: 'var(--text-light)',
          fontSize: '0.75rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(251, 146, 60, 0.2)',
          width: '100%',
        }}>
          <p>
            © {new Date().getFullYear()} MetroEval. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

