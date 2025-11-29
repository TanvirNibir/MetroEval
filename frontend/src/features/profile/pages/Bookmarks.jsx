import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'

const Bookmarks = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/v1/bookmarks')
      const data = Array.isArray(response) ? response : response?.data || []
      setBookmarks(data)
    } catch (err) {
      setError(err.error || 'Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (bookmarkId) => {
    try {
      await api.post(`/v1/bookmark/${bookmarkId}/delete`)
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId))
    } catch (err) {
      setError(err.error || 'Failed to delete bookmark')
    }
  }

  const getBookmarkIcon = (type) => {
    switch (type) {
      case 'submission':
        return '📄'
      case 'resource':
        return '📚'
      case 'flashcard':
        return '📇'
      default:
        return '🔖'
    }
  }

  const truncateText = (text, limit = 120) => {
    if (!text) return ''
    return text.length > limit ? `${text.slice(0, limit).trim()}…` : text
  }

  const buildMetadataList = (metadata) => {
    if (!metadata) return []
    if (Array.isArray(metadata)) {
      return metadata.filter(Boolean)
    }

    return Object.entries(metadata)
      .filter(([_, value]) => Boolean(value))
      .map(([label, value]) => {
        if (Array.isArray(value)) {
          return `${label}: ${value.join(', ')}`
        }
        if (typeof value === 'object') {
          return `${label}: ${JSON.stringify(value)}`
        }
        return `${label}: ${value}`
      })
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesType = filterType === 'all' || bookmark.type === filterType
    const text = `${bookmark.title || ''} ${bookmark.subtitle || ''} ${bookmark.notes || ''}`.toLowerCase()
    const matchesSearch = text.includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleOpen = (bookmark) => {
    // Handle flashcard bookmarks - navigate to flashcards page with the flashcard ID
    if (bookmark.type === 'flashcard') {
      // Try to get flashcard_id from bookmark or metadata
      const flashcardId = bookmark.flashcard_id || bookmark.metadata?.flashcard_id
      
      if (flashcardId) {
        // Navigate to flashcards page and pass the flashcard ID via state
        navigate('/flashcards', { 
          state: { 
            openFlashcardId: String(flashcardId),
            category: bookmark.notes || bookmark.metadata?.category || null
          } 
        })
        return
      } else {
        // If no flashcard_id, show error
        setError('Flashcard ID not found. Please try bookmarking again.')
        return
      }
    }
    
    // Handle other bookmark types with links
    if (!bookmark.link) return
    if (bookmark.link.startsWith('http')) {
      window.open(bookmark.link, '_blank', 'noopener')
    } else {
      window.location.href = bookmark.link
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>🔖 My Bookmarks</h2>
          <p className="dashboard-subtitle">Save interesting submissions and learning resources</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="advanced-search-container" style={{ width: '240px' }}>
            <i className="fas fa-search advanced-search-icon"></i>
            <input
              type="text"
              className="advanced-search-input"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-chips" style={{ gap: '0.3rem' }}>
            {[
              { value: 'all', label: 'All' },
              { value: 'submission', label: 'Submissions' },
              { value: 'flashcard', label: 'Flashcards' },
              { value: 'resource', label: 'Resources' },
            ].map(({ value, label }) => (
              <div
                key={value}
                className={`filter-chip ${filterType === value ? 'active' : ''}`}
                onClick={() => setFilterType(value)}
                style={{ cursor: 'pointer' }}
              >
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <div className="card" style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          textAlign: 'center',
          padding: '3rem',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔖</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No Bookmarks Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Bookmark submissions or resources to access them quickly later
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className={`card ${bookmark.type === 'flashcard' ? 'bookmark-card--flashcard' : ''}`}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-lg)',
                padding: '1.5rem',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              >
                <div className="bookmark-card__header">
                  <span className="bookmark-icon">{getBookmarkIcon(bookmark.type)}</span>
                  <div>
                    <p className="bookmark-type">
                      {bookmark.type === 'flashcard' ? 'FLASHCARD' : bookmark.type}
                    </p>
                    <h4>{bookmark.title || 'Untitled bookmark'}</h4>
                    {bookmark.subtitle && <p className="bookmark-subtitle">{bookmark.subtitle}</p>}
                    {bookmark.type === 'flashcard' && bookmark.notes && (
                      <p className="bookmark-flashcard-topic">
                        {truncateText(bookmark.notes, 60)}
                      </p>
                    )}
                  </div>
                  <div className="bookmark-actions">
                    {(bookmark.link || bookmark.type === 'flashcard') && (
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleOpen(bookmark)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {bookmark.type === 'flashcard' ? '📇 Open Flashcard' : 'Open'}
                      </button>
                    )}
                    <button
                      className="ghost-button danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteBookmark(bookmark.id)
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {bookmark.type === 'flashcard' ? (
                  <div className="bookmark-flashcard-body">
                    <div className="bookmark-flashcard-section">
                      <span className="bookmark-flashcard-label">QUESTION</span>
                      <p className="bookmark-flashcard-text">
                        {truncateText(
                          (bookmark.metadata && bookmark.metadata.front) || bookmark.title || '',
                          220,
                        )}
                      </p>
                    </div>
                    {bookmark.metadata && bookmark.metadata.back && (
                      <div className="bookmark-flashcard-section">
                        <span className="bookmark-flashcard-label">ANSWER</span>
                        <p className="bookmark-flashcard-text bookmark-flashcard-text--muted">
                          {truncateText(bookmark.metadata.back, 200)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {bookmark.notes && (
                      <p className="bookmark-notes" title={bookmark.notes}>
                        {truncateText(bookmark.notes)}
                      </p>
                    )}
                    {buildMetadataList(bookmark.metadata).length > 0 && (
                      <div className="bookmark-tags">
                        {buildMetadataList(bookmark.metadata).map((entry, idx) => (
                          <span key={`${bookmark.id}-meta-${idx}`} className="bookmark-tag" title={entry}>
                            {truncateText(entry, 70)}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div className="bookmark-footer">
                  <span>
                    Saved {bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Bookmarks
