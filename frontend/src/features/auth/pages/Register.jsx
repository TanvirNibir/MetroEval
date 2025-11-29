import React from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'
import '../../../styles/features/auth/Register.css'

const Register = () => {
  const {
    formData,
    error,
    loading,
    showPassword,
    departmentOptions,
    handleChange,
    handleSubmit,
    generateRandomPassword,
    togglePasswordVisibility,
  } = useRegister()

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h2 className="auth-title">
            Create Account
          </h2>
          <p className="auth-subtitle">
            Join MetroEval and start your learning journey at Metropolia University
          </p>
        </div>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="firstname.lastname@metropolia.fi"
              pattern={'.+@metropolia\\.fi'}
              title="Use your @metropolia.fi email address"
            />
            <small>
              Only Metropolia student or staff emails are allowed.
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="password-input"
              />
              <div className="password-controls">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="password-generate"
                  title="Generate random password"
                >
                  🎲 Random
                </button>
              </div>
            </div>
            <small className="password-hint">
              Password must be at least 6 characters. Use the random generator for a strong password.
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-control"
            >
              {departmentOptions.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </p>
        <div className="auth-back-link">
          <Link to="/">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register

