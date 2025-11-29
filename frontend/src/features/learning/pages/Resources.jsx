import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useUserDepartment } from '../../dashboard/hooks/useUserDepartment'

const Resources = () => {
  const { department } = useUserDepartment()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    loadResources()
  }, [department, selectedCategory])

  const loadResources = async () => {
    try {
      setLoading(true)
      // Resources endpoint not yet implemented in backend
      // This feature will be added in a future update
      setResources([])
    } catch (err) {
      // Error already handled by API interceptor
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const loadResourceDetails = async (resourceId) => {
    try {
      // Resources endpoint not yet implemented in backend
      // Feature coming soon - could add toast notification here
    } catch (err) {
      // Error already handled by API interceptor
    }
  }

  const categories = ['tutorial', 'documentation', 'example', 'guide', 'reference', 'other']

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📚 Resource Library</h2>
        <p className="dashboard-subtitle">Learning materials and references</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('')}
          className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedResource ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div>
          {resources.length === 0 ? (
            <div className="card" style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              textAlign: 'center',
              padding: '3rem',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
              <h3>No Resources Available</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Resources will appear here when they're added
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}>
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="card"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => loadResourceDetails(resource.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>{resource.title}</h4>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      {'⭐'.repeat(Math.floor(resource.rating || 0))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {resource.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <span className="badge badge-secondary">{resource.category}</span>
                    <span className="badge badge-secondary">{resource.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedResource && (
          <div className="card" style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            position: 'sticky',
            top: '1rem',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{selectedResource.title}</h3>
              <button
                onClick={() => setSelectedResource(null)}
                style={{
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fca5a5',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {selectedResource.description}
            </p>
            {selectedResource.content && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                whiteSpace: 'pre-wrap',
                marginBottom: '1rem',
              }}>
                {selectedResource.content}
              </div>
            )}
            {selectedResource.url && (
              <a
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-block', marginTop: '0.5rem' }}
              >
                Open Resource →
              </a>
            )}
            {selectedResource.tags && selectedResource.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Tags: </strong>
                {selectedResource.tags.map((tag, index) => (
                  <span key={`tag-${tag}-${index}`} className="badge badge-secondary" style={{ marginLeft: '0.25rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Resources

