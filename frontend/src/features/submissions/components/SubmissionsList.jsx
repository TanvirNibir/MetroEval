import React, { useState } from 'react'
import api from '../../../services/api'
import SubmissionDetailModal from './SubmissionDetailModal'

const SubmissionsList = ({ submissions, onRefresh }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const safeSubmissions = Array.isArray(submissions) ? submissions : submissions?.data || []

  const formatLabel = (value, fallback = '') =>
    (value || fallback).toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const filteredSubmissions = safeSubmissions.filter((sub) => {
    const matchesSearch =
      !searchTerm ||
      (sub.title && sub.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.content && sub.content.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter =
      filterType === 'all' || formatLabel(sub.type || 'other').toLowerCase() === formatLabel(filterType).toLowerCase()
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return 'Invalid Date'
    }
  }

  const handleBookmark = async (e, submissionId) => {
    e.stopPropagation()
    try {
      await api.post('/v1/bookmarks', {
        submission_id: submissionId,
        type: 'submission',
        notes: ''
      })
      // Could show a toast notification here
    } catch (err) {
      // Error already handled by API interceptor
    }
  }

  const typeFilters = [
    { value: 'all', label: 'All', icon: '🌐' },
    { value: 'code', label: 'Code', icon: '💻' },
    { value: 'essay', label: 'Essay', icon: '📝' },
    { value: 'report', label: 'Report', icon: '📊' },
    { value: 'presentation', label: 'Presentation', icon: '🎤' },
    { value: 'project', label: 'Project', icon: '🧠' },
    { value: 'lab-report', label: 'Lab', icon: '⚗️' },
    { value: 'case-study', label: 'Case study', icon: '📚' },
    { value: 'research-paper', label: 'Research', icon: '🔬' },
    { value: 'portfolio', label: 'Portfolio', icon: '📁' },
    { value: 'design', label: 'Design', icon: '🎨' },
    { value: 'prototype', label: 'Prototype', icon: '🧪' },
    { value: 'reflection', label: 'Reflection', icon: '💭' },
    { value: 'other', label: 'Other', icon: '✨' },
  ]

  const activeFilter = typeFilters.find((f) => f.value === filterType) || typeFilters[0]

  return (
    <div className="card advanced-widget submissions-card">
      <div className="card-header-with-actions">
        <div>
          <h3 className="gradient-text">
            <i className="fas fa-folder-open"></i> My Submissions
          </h3>
          <p className="submissions-card__subtitle">
            Showing <strong>{filteredSubmissions.length}</strong> {filteredSubmissions.length === 1 ? 'entry' : 'entries'}
            {filterType !== 'all' && (
              <>
                {' '}for <span className="badge badge-primary">{activeFilter.label}</span>
              </>
            )}
            {searchTerm && (
              <>
                {' '}matching “<span className="text-highlight">{searchTerm}</span>”
              </>
            )}
          </p>
        </div>
        <div className="card-actions">
          <div className="advanced-search-container">
            <i className="fas fa-search advanced-search-icon"></i>
            <input
              type="text"
              className="advanced-search-input"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="submissions-filter-chips" role="toolbar" aria-label="Submission type filters">
            {typeFilters.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filterType === value}
                className={`submissions-filter-chip ${filterType === value ? 'active' : ''}`}
                onClick={() => setFilterType(value)}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="submissions-list">
        {filteredSubmissions.length === 0 ? (
          <div className="submissions-empty">
            <div className="submissions-empty__icon">📝</div>
            <h4>No submissions yet</h4>
            <p>Upload your first assignment using the form on the left.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="submission-item"
              onClick={() => setSelectedSubmission(sub)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <button
                className="submission-bookmark-btn"
                onClick={(e) => handleBookmark(e, sub.id)}
                title="Bookmark this submission"
              >
                🔖
              </button>
              <div className="submission-item__header">
                <h4>{sub.title || 'Untitled submission'}</h4>
                <span className="submission-type-badge">{formatLabel(sub.type || 'general')}</span>
              </div>
              <div className="submission-meta">
                <span className="submission-meta__item">
                  <i className="fas fa-layer-group"></i> {formatLabel(sub.type || 'general')}
                </span>
                <span className="submission-meta__item">
                  <i className="fas fa-clock"></i> {formatDate(sub.created_at)}
                </span>
              </div>
              <div className="submission-item__footer">
                <span className={`submission-status status-${(sub.status || 'pending').toLowerCase()}`}>
                  {formatLabel(sub.status || 'pending')}
                </span>
                <span className="submission-id-pill">#{(sub.id || '').slice(-6)}</span>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedSubmission && (
        <SubmissionDetailModal
          submissionId={selectedSubmission.id}
          onClose={() => {
            setSelectedSubmission(null)
            onRefresh()
          }}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}

export default SubmissionsList

