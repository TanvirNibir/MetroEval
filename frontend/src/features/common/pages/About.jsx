import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNavbar from '../../../components/PublicNavbar'
import Footer from '../../../components/Footer'
import '../../../styles/features/common/About.css'

const About = () => {
  const [expandedFeature, setExpandedFeature] = useState(null)

  const values = [
    { icon: '♿', title: 'Accessibility', desc: 'Feedback available 24/7 for all students', color: '#3b82f6' },
    { icon: '✨', title: 'Quality', desc: 'Constructive, actionable feedback standards', color: '#8b5cf6' },
    { icon: '🔒', title: 'Privacy & Security', desc: 'Industry-standard data protection', color: '#10b981' },
    { icon: '🤝', title: 'Collaboration', desc: 'Meaningful peer learning experiences', color: '#f59e0b' },
    { icon: '💡', title: 'Innovation', desc: 'Latest AI and educational technology', color: '#ef4444' },
    { icon: '⚖️', title: 'Fairness', desc: 'Balanced and fair review distribution', color: '#06b6d4' },
  ]

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Feedback',
      shortDesc: 'Instant feedback powered by Google Gemini AI',
      fullDesc: 'Leveraging Google Gemini AI, our system provides instant, detailed feedback on code quality, essay structure, project completeness, and more. The AI analyzes multiple aspects including correctness, clarity, organization, and adherence to requirements.',
      details: ['Real-time feedback in seconds', 'Multi-dimensional analysis', 'Support for various submission types', 'Personalized improvement suggestions'],
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      icon: '👥',
      title: 'Peer Review Matching',
      shortDesc: 'Intelligent algorithm pairs students for reviews',
      fullDesc: 'Our advanced matching algorithm pairs students for peer reviews based on department, skill level, and review history. This ensures balanced feedback distribution and meaningful learning opportunities.',
      details: ['Department-based matching', 'Automatic distribution', 'Duplicate prevention', 'Fair workload balance'],
      gradient: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      shortDesc: 'Track progress with detailed insights',
      fullDesc: 'Monitor your academic progress with detailed analytics and visualizations. Track improvement over time, identify strengths and weaknesses, and set goals based on data-driven insights.',
      details: ['Submission history', 'Score trends', 'Performance comparisons', 'Department analytics'],
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    },
    {
      icon: '🎯',
      title: 'Multi-Department Support',
      shortDesc: 'Works across all Metropolia departments',
      fullDesc: 'Serves all departments including Engineering, Business, Design, Health Sciences, and Social Sciences. The platform adapts to different academic requirements and submission types.',
      details: ['All departments supported', 'Adaptive to requirements', 'Flexible submission types', 'Customizable workflows'],
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    },
    {
      icon: '📝',
      title: 'Secure Submissions',
      shortDesc: 'Safe and organized file management',
      fullDesc: 'Submit assignments with confidence. All submissions are securely stored and encrypted. Version history allows tracking changes and improvements over time.',
      details: ['File upload support', 'Version control', 'Secure encryption', 'Easy retrieval'],
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    },
    {
      icon: '🔍',
      title: 'Academic Integrity',
      shortDesc: 'Plagiarism detection and analysis',
      fullDesc: 'Built-in plagiarism detection and semantic analysis help maintain academic standards while respecting student privacy and promoting honest work.',
      details: ['Plagiarism detection', 'Semantic analysis', 'Privacy protection', 'Academic standards'],
      gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    },
  ]

  const techStack = [
    { name: 'React', icon: '⚛️', color: '#61dafb', desc: 'Modern frontend framework' },
    { name: 'Flask', icon: '🐍', color: '#000000', desc: 'Python web framework' },
    { name: 'Gemini AI', icon: '🤖', color: '#4285f4', desc: 'Advanced AI feedback' },
    { name: 'MongoDB', icon: '🍃', color: '#47a248', desc: 'NoSQL database' },
    { name: 'Vite', icon: '⚡', color: '#646cff', desc: 'Fast build tool' },
  ]

  return (
    <div className="about-page">
      <PublicNavbar />
      
      {/* Animated Background Elements */}
      <div className="about-bg-orb about-bg-orb-1" />
      <div className="about-bg-orb about-bg-orb-2" />

      <div className="about-container">
        
        {/* Hero Section with Visual Impact */}
        <div className="about-hero">
          <div className="about-hero-bg" />
          <div className="about-hero-content">
            <div className="about-badge">
              🎓 Metropolia University Platform
            </div>
            <h1 className="about-title">
              About MetroEval
            </h1>
            <p className="about-subtitle">
              Revolutionizing student feedback with AI-powered analysis and intelligent peer review matching at Metropolia University
            </p>
          </div>
        </div>

        {/* Mission & Vision - Visual Cards */}
        <div className="mission-vision-grid">
          <div className="mission-card">
            <div className="mission-card-bg" />
            <div className="mission-vision-content">
              <div className="mission-vision-icon">🎯</div>
              <h2 className="mission-vision-title">
                Our Mission
              </h2>
              <p className="mission-vision-desc">
                Transform how students receive feedback by making high-quality, timely insights accessible to everyone through AI and peer collaboration.
              </p>
            </div>
          </div>

          <div className="vision-card">
            <div className="vision-card-bg" />
            <div className="mission-vision-content">
              <div className="mission-vision-icon">🔮</div>
              <h2 className="mission-vision-title">
                Our Vision
              </h2>
              <p className="mission-vision-desc">
                A future where every student has instant access to personalized, actionable feedback that transforms evaluation into a powerful growth tool.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values - Interactive Grid */}
        <section className="values-section">
          <h2 className="values-title">
            What We Stand For
          </h2>
          <div className="values-grid">
            {values.map((value, idx) => (
              <div
                key={value.title}
                className="value-card"
                style={{
                  '--value-color': value.color,
                  background: `linear-gradient(135deg, ${value.color}15, ${value.color}05)`,
                  borderColor: `${value.color}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${value.color}80`
                  e.currentTarget.style.boxShadow = `0 10px 40px ${value.color}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${value.color}40`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div 
                  className="value-icon"
                  style={{ filter: `drop-shadow(0 0 15px ${value.color}60)` }}
                >
                  {value.icon}
                </div>
                <h3 className="value-title">
                  {value.title}
                </h3>
                <p className="value-desc">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features - Expandable Cards */}
        <section className="features-section-about">
          <div className="features-header-about">
            <h2 className="features-title-about">
              Platform Features
            </h2>
            <p className="features-subtitle-about">
              Powerful tools designed to enhance your learning experience
            </p>
          </div>

          <div className="features-grid-about">
            {features.map((feature, idx) => {
              // Determine border color based on gradient
              let borderColor = 'rgba(251, 146, 60, 0.3)'
              if (feature.gradient.includes('#6366f1')) {
                borderColor = 'rgba(99, 102, 241, 0.3)'
              } else if (feature.gradient.includes('#f59e0b')) {
                borderColor = 'rgba(245, 158, 11, 0.3)'
              }
              
              // Extract first color from gradient for background
              const gradientMatch = feature.gradient.match(/#[0-9a-fA-F]{6}/)
              const firstColor = gradientMatch ? gradientMatch[0] : '#fb923c'
              
              return (
              <div
                key={idx}
                className={`feature-card-about ${expandedFeature === idx ? 'expanded' : ''}`}
                onClick={() => setExpandedFeature(expandedFeature === idx ? null : idx)}
                style={{
                  background: `linear-gradient(135deg, ${firstColor}20, transparent)`,
                  borderColor: borderColor,
                }}
              >
                <div className="feature-header-about" style={{ marginBottom: expandedFeature === idx ? '1.5rem' : '0' }}>
                  <div className="feature-icon-about">
                    {feature.icon}
                  </div>
                  <div className="feature-content-about">
                    <h3 className="feature-title-about">
                      {feature.title}
                    </h3>
                    <p className="feature-desc-about">
                      {expandedFeature === idx ? feature.fullDesc : feature.shortDesc}
                    </p>
                    {expandedFeature === idx && feature.details && (
                      <div className="feature-details">
                        <ul className="feature-details-list">
                          {feature.details.map((detail, i) => (
                            <li key={i} className="feature-details-item">
                              <span className="check">✓</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="feature-expand-icon" style={{ transform: expandedFeature === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  {expandedFeature === idx ? '▲' : '▼'}
                </div>
              </div>
              )
            })}
          </div>
        </section>

        {/* Technology Stack - Visual Pills */}
        <section className="tech-section">
          <div className="tech-header">
            <h2 className="tech-title">
              Built With Modern Technology
            </h2>
            <p className="tech-subtitle">
              Leveraging cutting-edge tools for optimal performance
            </p>
          </div>
          
          <div className="tech-grid">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="tech-pill"
                style={{
                  '--tech-color': tech.color,
                  background: `linear-gradient(135deg, ${tech.color}20, ${tech.color}10)`,
                  borderColor: `${tech.color}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${tech.color}80`
                  e.currentTarget.style.boxShadow = `0 10px 30px ${tech.color}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${tech.color}40`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span className="tech-pill-icon">{tech.icon}</span>
                <div className="tech-pill-content">
                  <div className="tech-pill-name">
                    {tech.name}
                  </div>
                  <div className="tech-pill-desc">
                    {tech.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works - Visual Timeline */}
        <section className="how-it-works-section">
          <div className="how-it-works-header">
            <h2 className="how-it-works-title">
              How It Works
            </h2>
            <p className="how-it-works-subtitle">
              Simple steps to get started
            </p>
          </div>

          <div className="how-it-works-grid">
            {[
              { step: '1', title: 'Sign Up', desc: 'Register with your Metropolia email', icon: '📝', color: '#6366f1' },
              { step: '2', title: 'Submit Work', desc: 'Upload assignments or use text editor', icon: '📤', color: '#8b5cf6' },
              { step: '3', title: 'AI Analysis', desc: 'Get instant AI-powered feedback', icon: '🤖', color: '#ec4899' },
              { step: '4', title: 'Peer Reviews', desc: 'Review and be reviewed by peers', icon: '👥', color: '#f59e0b' },
              { step: '5', title: 'Get Feedback', desc: 'Receive detailed insights', icon: '💬', color: '#10b981' },
              { step: '6', title: 'Track Progress', desc: 'Monitor improvement over time', icon: '📈', color: '#06b6d4' },
            ].map((process, idx) => (
              <div
                key={idx}
                className="process-card"
                style={{
                  '--process-color': process.color,
                  background: `linear-gradient(135deg, ${process.color}15, ${process.color}05)`,
                  borderColor: `${process.color}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${process.color}80`
                  e.currentTarget.style.boxShadow = `0 15px 40px ${process.color}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${process.color}40`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div 
                  className="process-number"
                  style={{
                    background: `linear-gradient(135deg, ${process.color}, ${process.color}dd)`,
                    boxShadow: `0 8px 25px ${process.color}60`,
                  }}
                >
                  {process.step}
                </div>
                <div 
                  className="process-icon"
                  style={{ filter: `drop-shadow(0 0 10px ${process.color}60)` }}
                >
                  {process.icon}
                </div>
                <h3 className="process-title">
                  {process.title}
                </h3>
                <p className="process-desc">
                  {process.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action - Enhanced */}
        <section className="cta-section-about">
          <div className="cta-bg-about" />
          <div className="cta-content-about">
            <h2 className="cta-title-about">
              Ready to Get Started?
            </h2>
            <p className="cta-subtitle-about">
              Join hundreds of Metropolia students improving their academic work
            </p>
            <div className="cta-buttons-about">
              <Link
                to="/login"
                className="cta-button-primary-about"
              >
                🚀 Get Started Now
              </Link>
              <Link
                to="/"
                className="cta-button-secondary-about"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default About
