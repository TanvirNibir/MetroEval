import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useUserDepartment } from '../../dashboard/hooks/useUserDepartment'

const Templates = () => {
  const { department } = useUserDepartment()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [department])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      // Templates endpoint not yet implemented in backend
      // This feature will be added in a future update
      setTemplates([])
    } catch (err) {
      // Error already handled by API interceptor
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const loadTemplateDetails = async (templateId) => {
    try {
      // Templates endpoint not yet implemented in backend
      // Feature coming soon - could add toast notification here
    } catch (err) {
      // Error already handled by API interceptor
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📋 Submission Templates</h2>
        <p className="dashboard-subtitle">Use templates to structure your submissions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTemplate ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div>
          {templates.length === 0 ? (
            <div className="card" style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              textAlign: 'center',
              padding: '3rem',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
              <h3>No Templates Available</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Templates will appear here when they're created
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="card"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => loadTemplateDetails(template.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {template.type === 'code' ? '💻' : template.type === 'essay' ? '📝' : '📄'}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{template.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {template.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Used {template.usage_count} times
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTemplate && (
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
              <h3>{selectedTemplate.name}</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
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
              {selectedTemplate.description}
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap',
              marginBottom: '1rem',
            }}>
              {selectedTemplate.content}
            </div>
            {selectedTemplate.files && selectedTemplate.files.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Files:</h4>
                {selectedTemplate.files.map((file, index) => (
                  <div key={file.filename || `file-${index}`} style={{
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.5rem',
                  }}>
                    <strong>{file.filename}</strong>
                    <pre style={{ marginTop: '0.5rem', fontSize: '0.85rem', overflowX: 'auto' }}>
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Templates

