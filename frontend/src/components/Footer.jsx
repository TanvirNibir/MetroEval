import React from 'react'
import '../styles/components/Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      {/* Background gradient effect */}
      <div className="footer__gradient-line" />
      
      <div className="footer__container">
        {/* MetroEval Branding */}
        <div className="footer__brand">
          <div className="footer__logo">
            🎓
          </div>
          <div className="footer__brand-text">
            MetroEval
          </div>
        </div>

        {/* Credits */}
        <div className="footer__credits">
          <p className="footer__credits-title">
            Developed by
          </p>
          <p className="footer__credits-name">
            Tanvir Nibir
          </p>
          <a 
            href="mailto:tanvir.nibir@metropolia.fi"
            className="footer__email"
          >
            <i className="fas fa-envelope footer__email-icon"></i>
            tanvir.nibir@metropolia.fi
          </a>
        </div>

        {/* University Info */}
        <div className="footer__university">
          <p>
            Metropolia University of Applied Sciences
          </p>
        </div>

        {/* Copyright */}
        <div className="footer__copyright">
          <p>
            © {new Date().getFullYear()} MetroEval. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

