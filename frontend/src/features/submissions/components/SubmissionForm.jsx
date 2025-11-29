import React, { useState, useEffect } from 'react'
import api from '../../../services/api'

const SUBMISSION_TYPES = [
  { value: 'code', label: 'Code', icon: '💻', color: '#6366f1' },
  { value: 'essay', label: 'Essay', icon: '📝', color: '#10b981' },
  { value: 'report', label: 'Report', icon: '📄', color: '#3b82f6' },
  { value: 'presentation', label: 'Presentation', icon: '📊', color: '#8b5cf6' },
  { value: 'project', label: 'Project', icon: '🚀', color: '#f59e0b' },
  { value: 'lab-report', label: 'Lab Report', icon: '🔬', color: '#ef4444' },
  { value: 'case-study', label: 'Case Study', icon: '📚', color: '#06b6d4' },
  { value: 'research-paper', label: 'Research Paper', icon: '🔍', color: '#ec4899' },
  { value: 'portfolio', label: 'Portfolio', icon: '🎨', color: '#f97316' },
  { value: 'design', label: 'Design', icon: '🎯', color: '#14b8a6' },
  { value: 'prototype', label: 'Prototype', icon: '⚙️', color: '#64748b' },
  { value: 'reflection', label: 'Reflection', icon: '💭', color: '#84cc16' },
  { value: 'other', label: 'Other', icon: '📌', color: '#94a3b8' },
]

const SubmissionForm = ({ onSuccess, currentDepartment }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'code',
    taskDescription: '',
    content: '',
    generateFeedback: true,
  })
  const [files, setFiles] = useState([{ filename: '', content: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('files') // 'files' or 'content'
  const [hasDraft, setHasDraft] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [])

  // Auto-save draft when form changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content || (Array.isArray(files) && files.some(f => f.filename || f.content))) {
        saveDraft()
      }
    }, 2000) // Save 2 seconds after user stops typing

    return () => clearTimeout(timer)
  }, [formData, files, saveDraft]) // Added saveDraft to dependencies

  const loadDraft = async () => {
    try {
      // Draft endpoint not yet implemented in backend
      // Using localStorage as fallback
      try {
        const savedDraft = localStorage.getItem('submission_draft')
        if (savedDraft) {
          const draft = JSON.parse(savedDraft)
          setFormData({
            title: draft.title || '',
            type: draft.type || 'code',
            taskDescription: draft.task_description || '',
            content: draft.content || '',
            generateFeedback: true,
          })
          if (draft.files && draft.files.length > 0) {
            setFiles(draft.files)
          }
          setHasDraft(true)
        }
      } catch (err) {
        // localStorage might be disabled or quota exceeded - silently fail
      }
    } catch (err) {
      // No draft exists, that's fine
    }
  }

  async function saveDraft() {
    try {
      setSavingDraft(true)
      // Draft endpoint not yet implemented in backend
      // Using localStorage as fallback
      const draftData = {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        task_description: formData.taskDescription,
        files: files,
      }
      try {
        localStorage.setItem('submission_draft', JSON.stringify(draftData))
        setHasDraft(true)
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 3000)
      } catch (storageErr) {
        // localStorage might be disabled or quota exceeded - silently fail
      }
    } catch (err) {
      // Silently fail - draft saving is not critical
    } finally {
      setSavingDraft(false)
    }
  }

  const deleteDraft = async () => {
    try {
      // Draft endpoint not yet implemented in backend
      // Using localStorage as fallback
      try {
        localStorage.removeItem('submission_draft')
        setHasDraft(false)
      } catch (err) {
        // localStorage might be disabled - silently fail
      }
      setFormData({
        title: '',
        type: formData.type,
        taskDescription: '',
        content: '',
        generateFeedback: true,
      })
      setFiles([{ filename: '', content: '' }])
    } catch (err) {
      // Silently fail - draft deletion is not critical
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type })
  }

  const handleFileChange = (index, field, value) => {
    const newFiles = [...files]
    newFiles[index][field] = value
    setFiles(newFiles)
  }

  const addFile = () => {
    setFiles([...files, { filename: '', content: '' }])
  }

  const removeFile = (index) => {
    if (Array.isArray(files) && files.length > 1) {
      setFiles(files.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Filter out empty files
      const validFiles = Array.isArray(files) ? files.filter((f) => f.filename && f.content) : []

      // Validate: either files or content must be provided
      if (validFiles.length === 0 && !formData.content) {
        setError('Please provide either file(s) or content')
        setLoading(false)
        return
      }

      const response = await api.post('/v1/submit', {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        task_description: formData.taskDescription,
        files: validFiles,
        generate_feedback: formData.generateFeedback,
        department: currentDepartment,
      })

      if (response.success) {
        // Delete draft after successful submission
        await deleteDraft()
        // Reset form (keep the selected type for convenience)
        setFormData({
          title: '',
          type: formData.type, // Keep the selected type
          taskDescription: '',
          content: '',
          generateFeedback: true,
        })
        setFiles([{ filename: '', content: '' }])
        setActiveSection('files')
        onSuccess()
      } else {
        setError('Error submitting assignment')
      }
    } catch (err) {
      setError(err.error || 'Error submitting assignment')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = SUBMISSION_TYPES.find(t => t.value === formData.type)

  return (
    <div className="card" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-color)',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: 'var(--glow-primary)',
        }}>
          📝
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text-color)',
          }}>
            Submit New Assignment
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
          }}>
            Create and submit your work for AI feedback
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Draft Status */}
      {(hasDraft || draftSaved) && (
        <div className="alert alert-info" style={{ 
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {draftSaved ? (
              <>
                <span>✅</span>
                <span>Draft saved automatically</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Draft available - your work is being saved automatically</span>
              </>
            )}
            {savingDraft && <span className="spinner" style={{ width: '16px', height: '16px' }}></span>}
          </div>
          <button
            type="button"
            onClick={deleteDraft}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Clear Draft
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submit-form">
        {/* Assignment Title */}
        <div className="form-group">
          <label htmlFor="assignmentTitle" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <span>📋</span>
            <span>Assignment Title</span>
          </label>
          <input
            type="text"
            id="assignmentTitle"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Assignment 1, Research Paper, Final Project..."
            style={{
              fontSize: '1rem',
              padding: '0.875rem 1rem',
            }}
          />
        </div>

        {/* Type Selection - Visual Grid */}
        <div className="form-group">
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <span>🏷️</span>
            <span>Submission Type</span>
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            {SUBMISSION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeSelect(type.value)}
                style={{
                  padding: '1rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: formData.type === type.value
                    ? `2px solid ${type.color}`
                    : '1px solid var(--border-color)',
                  background: formData.type === type.value
                    ? `${type.color}15`
                    : 'rgba(0, 0, 0, 0.3)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: formData.type === type.value ? '700' : '500',
                  boxShadow: formData.type === type.value
                    ? `0 0 15px ${type.color}40`
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (formData.type !== type.value) {
                    e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)'
                    e.currentTarget.style.borderColor = 'var(--primary-color)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.type !== type.value) {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                <span style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
          {selectedType && (
            <div style={{
              padding: '0.75rem',
              background: `${selectedType.color}15`,
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${selectedType.color}40`,
              fontSize: '0.85rem',
              color: selectedType.color,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>{selectedType.icon}</span>
              <span>Selected: {selectedType.label}</span>
            </div>
          )}
        </div>

        {/* Task Description */}
        <div className="form-group">
          <label htmlFor="taskDescription" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <span>📋</span>
            <span>Original Assignment Task (Optional)</span>
          </label>
          <textarea
            id="taskDescription"
            name="taskDescription"
            value={formData.taskDescription}
            onChange={handleChange}
            rows="4"
            placeholder="Paste the original assignment description/requirements here..."
            style={{
              fontSize: '0.95rem',
              resize: 'vertical',
            }}
          />
          <small className="text-muted" style={{
            display: 'block',
            marginTop: '0.5rem',
            fontSize: '0.85rem',
          }}>
            💡 This helps AI provide better feedback by comparing your submission against the requirements
          </small>
        </div>

        {/* Content Input Method Toggle */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
        }}>
          <button
            type="button"
            onClick={() => setActiveSection('files')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeSection === 'files'
                ? 'var(--primary-color)'
                : 'transparent',
              color: activeSection === 'files' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: activeSection === 'files' ? '700' : '500',
              transition: 'var(--transition)',
            }}
          >
            📁 Multiple Files
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('content')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeSection === 'content'
                ? 'var(--primary-color)'
                : 'transparent',
              color: activeSection === 'content' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: activeSection === 'content' ? '700' : '500',
              transition: 'var(--transition)',
            }}
          >
            📄 Single Content
          </button>
        </div>

        {/* Files Section */}
        {activeSection === 'files' && (
          <div className="form-group">
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <span>📁</span>
              <span>Files & Documents</span>
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {files.map((file, index) => (
                <div
                  key={`file-input-${index}`}
                  style={{
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)'
                    e.currentTarget.style.boxShadow = 'var(--glow-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}>
                    <input
                      type="text"
                      placeholder={`File ${index + 1} name (e.g., document.pdf, script.py)`}
                      value={file.filename}
                      onChange={(e) => handleFileChange(index, 'filename', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.95rem',
                      }}
                    />
                    {files.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <textarea
                    rows="6"
                    placeholder="Paste file content, text, or code here..."
                    value={file.content}
                    onChange={(e) => handleFileChange(index, 'content', e.target.value)}
                    style={{
                      width: '100%',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      resize: 'vertical',
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFile}
              className="btn btn-secondary"
              style={{
                marginTop: '0.75rem',
                width: '100%',
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>➕</span>
              Add Another File
            </button>
            <small className="text-muted" style={{
              display: 'block',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
            }}>
              💡 Perfect for code projects, multi-file reports, or structured submissions
            </small>
          </div>
        )}

        {/* Single Content Section */}
        {activeSection === 'content' && (
          <div className="form-group">
            <label htmlFor="submissionContent" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <span>📄</span>
              <span>Submission Content</span>
            </label>
            <textarea
              id="submissionContent"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="12"
              placeholder="Paste your complete submission content here (essays, reports, single-file code, reflections, etc.)..."
              style={{
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: activeSection === 'content' && formData.type === 'code' ? 'monospace' : 'inherit',
              }}
            />
            <small className="text-muted" style={{
              display: 'block',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
            }}>
              💡 Best for essays, single-file submissions, or when you prefer one field
            </small>
          </div>
        )}

        {/* Generate Feedback Option */}
        <div style={{
          padding: '1rem',
          background: 'rgba(251, 146, 60, 0.1)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(251, 146, 60, 0.3)',
          marginBottom: '1.5rem',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            margin: 0,
          }}>
            <input
              type="checkbox"
              id="generateFeedbackOnSubmit"
              name="generateFeedback"
              checked={formData.generateFeedback}
              onChange={handleChange}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: 'var(--primary-color)',
              }}
            />
            <div>
              <div style={{
                fontWeight: '700',
                color: 'var(--text-color)',
                marginBottom: '0.25rem',
              }}>
                🤖 Generate AI Feedback Immediately
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}>
                Uncheck to submit without feedback (you can generate feedback later from the Feedback page)
              </div>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <>
              <span style={{ marginRight: '0.5rem' }}>⏳</span>
              Submitting...
            </>
          ) : (
            <>
              <span style={{ marginRight: '0.5rem' }}>🚀</span>
              Submit Assignment
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default SubmissionForm
