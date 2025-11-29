import React from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import '../../../styles/features/auth/Login.css'

const Login = () => {
  const {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
  } = useLogin()

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            Welcome Back
          </h2>
          <p className="auth-subtitle">
            Sign in to your account
          </p>
        </div>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
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
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create an account
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

export default Login

