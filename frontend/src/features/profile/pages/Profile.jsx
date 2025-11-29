import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import { useUserDepartment } from '../../dashboard/hooks/useUserDepartment'

const Profile = () => {
  const { user, checkAuth } = useAuth()
  const { department, setDepartment } = useUserDepartment()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    theme_preference: 'light',
    department: '',
    skill_level: 0.5,
  })

  const normalizeProfilePayload = (payload) => {
    if (!payload) return null
    if (payload.data && typeof payload.data === 'object') return payload.data
    return payload
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await api.get('/v1/user/profile')
      const data = normalizeProfilePayload(response)
      if (!data) {
        throw new Error('Empty profile response')
      }
      setProfile(data)
      setFormData({
        name: data.name,
        email: data.email,
        password: '',
        confirmPassword: '',
        theme_preference: data.theme_preference || 'light',
        department: data.department || 'General Studies',
        skill_level: data.skill_level || 0.5,
      })
      if (data.department) {
        // Update without syncing since this is coming from server
        setDepartment(data.department, true)
      }
    } catch (error) {
      setError('Failed to load profile')
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'skill_level' ? parseFloat(value) : value,
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, GIF, or WEBP image.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setUploadingAvatar(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post('/v1/user/avatar', formData, {
        headers: {
          'Content-Type': undefined, // Let axios set it automatically for FormData
        },
      })

      const data = normalizeProfilePayload(response) || response
      setSuccess('Avatar uploaded successfully!')
      await loadProfile()
      await checkAuth() // Refresh user context
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error?.error || 'Failed to upload avatar')
      // Error already handled by API interceptor
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        theme_preference: formData.theme_preference,
        department: formData.department,
        skill_level: formData.skill_level,
      }

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await api.put('/v1/user/profile', updateData)
      const data = normalizeProfilePayload(response) || response
      
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      })
      await loadProfile()
      // Department is already updated via API call, just sync the hook state
      setDepartment(formData.department, true)
      await checkAuth() // Refresh user context to reflect changes
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.error || 'Failed to update profile')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const DEPARTMENT_OPTIONS = [
    { value: 'General Studies', label: 'General Studies' },
    { value: 'Engineering and Computer Science', label: 'Engineering and Computer Science' },
    { value: 'Business', label: 'Business' },
    { value: 'Health Care', label: 'Health Care' },
    { value: 'Culture and Arts', label: 'Culture and Arts' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card">
        <div className="alert alert-error">Failed to load profile</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>👤 My Profile</h2>
        <p className="dashboard-subtitle">Manage your account information and preferences</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      <div className="card" style={{
        background: 'rgba(18, 12, 9, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 138, 60, 0.15)',
        boxShadow: '0 35px 80px rgba(0, 0, 0, 0.65)',
      }}>
        {!editing ? (
          <>
            {/* Profile Header */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '2px solid var(--border-color)',
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--primary-color)',
                      boxShadow: 'var(--glow-primary)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onClick={handleAvatarClick}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'var(--glow-primary)'
                    }}
                  />
                ) : (
                  <div
                    onClick={handleAvatarClick}
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: 'var(--glow-primary)',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'var(--glow-primary)'
                    }}
                  >
                    {getInitials(profile.name)}
                  </div>
                )}
                <div
                  onClick={handleAvatarClick}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '3px solid var(--bg-color)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.background = 'var(--primary-light)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.background = 'var(--primary-color)'
                  }}
                >
                  {uploadingAvatar ? (
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  ) : (
                    <span style={{ fontSize: '1.2rem' }}>📷</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>

              <h3 style={{
                marginBottom: '0.5rem',
                fontSize: '2rem',
                fontWeight: '800',
                color: 'var(--text-color)',
                textAlign: 'center',
              }}>
                {profile.name}
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
                fontSize: '1.1rem',
              }}>
                {profile.email}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem',
                }}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Profile Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(18, 12, 9, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 138, 60, 0.18)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🎓</span>
                  <strong style={{ color: 'var(--text-color)', fontSize: '1rem' }}>Department</strong>
                </div>
                <p style={{
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  fontWeight: '600',
                }}>
                  {profile.department}
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'rgba(18, 12, 9, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 138, 60, 0.18)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                  <strong style={{ color: 'var(--text-color)', fontSize: '1rem' }}>Skill Level</strong>
                </div>
                <div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{
                      width: `${(profile.skill_level || 0.5) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
                      transition: 'width 0.3s ease',
                      boxShadow: 'var(--glow-primary)',
                    }}></div>
                  </div>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                  }}>
                    {Math.round((profile.skill_level || 0.5) * 100)}%
                  </p>
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'rgba(18, 12, 9, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 138, 60, 0.18)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📅</span>
                  <strong style={{ color: 'var(--text-color)', fontSize: '1rem' }}>Member Since</strong>
                </div>
                <p style={{
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  fontWeight: '600',
                }}>
                  {formatDate(profile.created_at)}
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'rgba(18, 12, 9, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 138, 60, 0.18)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🎨</span>
                  <strong style={{ color: 'var(--text-color)', fontSize: '1rem' }}>Theme</strong>
                </div>
                <p style={{
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}>
                  {profile.theme_preference || 'Light'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary"
                style={{
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>✏️</span>
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid var(--border-color)',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-color)',
              }}>
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setError('')
                  setSuccess('')
                  loadProfile()
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
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
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="skill_level">
                  Skill Level: {Math.round(formData.skill_level * 100)}%
                </label>
                <input
                  type="range"
                  id="skill_level"
                  name="skill_level"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.skill_level}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <small className="text-muted">Adjust your skill level (0-100%)</small>
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <small className="text-muted">Minimum 6 characters</small>
              </div>

              {formData.password && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="theme_preference">Theme Preference</label>
                <select
                  id="theme_preference"
                  name="theme_preference"
                  value={formData.theme_preference}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setError('')
                  setSuccess('')
                  loadProfile()
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <span style={{ marginRight: '0.5rem' }}>💾</span>
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
