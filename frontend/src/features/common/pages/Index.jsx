import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../../components/Footer'
import PublicNavbar from '../../../components/PublicNavbar'
import '../../../styles/features/common/Index.css'

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Engineering Student',
      text: 'MetroEval transformed how I receive feedback. Instant AI analysis helps me improve before deadlines!',
      rating: 5,
      avatar: '👩‍💻'
    },
    {
      name: 'Alex K.',
      role: 'Business Student',
      text: 'The peer review system is brilliant. I learn so much from reviewing others\' work.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Emma L.',
      role: 'Design Student',
      text: 'Finally, a platform that understands my workflow. Quick, helpful, and always available.',
      rating: 5,
      avatar: '👩‍🎨'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const benefits = [
    { icon: '⚡', title: 'Instant Feedback', desc: 'Get AI-powered insights in seconds, not days', gradient: 'linear-gradient(135deg, #f59e0b, #fb923c)' },
    { icon: '🎯', title: 'Personalized', desc: 'Feedback tailored to your specific work', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { icon: '🤝', title: 'Learn Together', desc: 'Collaborate and learn from your peers', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    { icon: '📈', title: 'Track Progress', desc: 'See your improvement over time', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  ]

  const stats = [
    { number: '1000+', label: 'Active Students', icon: '👥', color: '#fb923c' },
    { number: '5000+', label: 'Submissions', icon: '📝', color: '#ffa94d' },
    { number: '98%', label: 'Satisfaction', icon: '⭐', color: '#ffb366' },
    { number: '24/7', label: 'AI Available', icon: '🤖', color: '#fdba74' },
  ]

  return (
    <div className="index-page">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span>⚡</span>
            <span>Powered by Google Gemini AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            Get Feedback
            <span>That Actually Helps</span>
          </h1>
          
          {/* Subheadline */}
          <p className="hero-subtitle">
            AI-powered feedback in <span className="highlight">seconds</span>. 
            Peer reviews that <span className="highlight">matter</span>. 
            Start improving today.
          </p>

          {/* Primary CTA */}
          <div className="hero-cta">
            <Link to="/login" className="cta-button-primary">
              <span className="emoji">🚀</span>
              Get Started Free
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - More Visual */}
      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-header">
            <h2 className="benefits-title">
              Why Students Love MetroEval
            </h2>
            <p className="benefits-subtitle">
              Everything you need to improve your academic work
            </p>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, idx) => (
              <div
                key={benefit.title}
                className="benefit-card"
                style={{
                  animation: `floatIcon ${3 + idx}s ease-in-out infinite`,
                }}
              >
                <div className="benefit-icon">
                  {benefit.icon}
                </div>
                <h3 className="benefit-title">
                  {benefit.title}
                </h3>
                <p className="benefit-desc">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Carousel Style */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <h2 className="testimonials-title">
              What Students Are Saying
            </h2>
            <p className="testimonials-subtitle">
              Real feedback from real students
            </p>
          </div>
          
          {/* Testimonial Carousel */}
          <div className="testimonial-carousel">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`testimonial-card ${currentTestimonial === idx ? 'active' : ''}`}
              >
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
                <p className="testimonial-text">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="testimonial-name">
                    {testimonial.name}
                  </div>
                  <div className="testimonial-role">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Dots */}
          <div className="carousel-dots">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`carousel-dot ${currentTestimonial === idx ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Feature Preview */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              See It In Action
            </h2>
            <p className="features-subtitle">
              A quick look at what makes MetroEval special
            </p>
          </div>

          <div className="features-grid">
            {[
              { icon: '🤖', title: 'AI Analysis', desc: 'Get instant feedback powered by advanced AI', color: '#6366f1' },
              { icon: '👥', title: 'Peer Reviews', desc: 'Intelligent matching for meaningful feedback', color: '#f59e0b' },
              { icon: '📊', title: 'Analytics', desc: 'Track your progress with detailed insights', color: '#10b981' },
            ].map((feature, idx) => (
              <div key={idx} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Maximum Impact */}
      <section className="final-cta-section">
        <div className="final-cta-bg" />
        <div className="final-cta-content">
          <h2 className="final-cta-title">
            Ready to Transform<br />Your Learning?
          </h2>
          <p className="final-cta-subtitle">
            Join hundreds of Metropolia students already improving their work with MetroEval
          </p>
          <div className="final-cta-buttons">
            <Link to="/login" className="cta-button-primary">
              <span className="emoji">🚀</span>
              Start Now - It's Free
            </Link>
            <Link to="/about" className="cta-button-secondary">
              <span>📖</span>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Index
