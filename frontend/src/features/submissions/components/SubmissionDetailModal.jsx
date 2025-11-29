import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import FeedbackReactions from './FeedbackReactions'
import { useAuth } from '../../../context/AuthContext'

const SubmissionDetailModal = ({ submissionId, onClose, onRefresh }) => {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const [submission, setSubmission] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState([])
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false)
  const [plagiarismResult, setPlagiarismResult] = useState(null)
  const [plagiarismError, setPlagiarismError] = useState('')

  useEffect(() => {
    loadSubmission()
  }, [submissionId])

  const loadSubmission = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/v1/submission/${submissionId}`)
      setSubmission(data)
      // Load versions
      try {
        const versionsData = await api.get(`/v1/submission/${submissionId}/versions`)
        setVersions(versionsData)
      } catch (err) {
        // Versions might not exist, that's fine
      }
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!submission) return

    const sub = submission.submission
    const feedbacks = submission.feedbacks || []
    const peerReviews = submission.peer_reviews || []

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    const now = new Date()

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Submission Report - ${escapeHtml(sub.assignment_title)}</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin: 0;
        padding: 32px;
        background: #0b0f19;
        color: #e5e7eb;
      }
      .report {
        max-width: 900px;
        margin: 0 auto;
        background: #020617;
        border-radius: 16px;
        border: 1px solid #1f2937;
        padding: 28px 32px;
      }
      h1, h2, h3, h4 {
        margin: 0 0 12px;
      }
      h1 {
        font-size: 24px;
        background: linear-gradient(120deg, #f97316, #22c55e, #38bdf8);
        -webkit-background-clip: text;
        color: transparent;
      }
      h2 {
        font-size: 18px;
        margin-top: 24px;
        border-bottom: 1px solid #1f2937;
        padding-bottom: 4px;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px 16px;
        margin-top: 8px;
        margin-bottom: 4px;
        font-size: 13px;
      }
      .meta-label {
        font-weight: 600;
        color: #9ca3af;
      }
      .meta-value {
        color: #e5e7eb;
      }
      .pill {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        color: #0f172a;
        background: #f97316;
      }
      .pill.status-submitted {
        background: #22c55e;
      }
      .section {
        margin-top: 16px;
      }
      .box {
        margin-top: 8px;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid #1e293b;
        background: #020617;
        white-space: pre-wrap;
        font-size: 13px;
        line-height: 1.6;
      }
      .code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        background: #020617;
      }
      .feedback-item {
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #1e293b;
        background: #020617;
      }
      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 13px;
        color: #e5e7eb;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge-ai {
        background: rgba(59, 130, 246, 0.15);
        color: #93c5fd;
      }
      .badge-human {
        background: rgba(16, 185, 129, 0.15);
        color: #6ee7b7;
      }
      .scores {
        margin-top: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        font-size: 11px;
      }
      .score-pill {
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(34, 197, 94, 0.12);
        color: #bbf7d0;
      }
      .peer-item {
        margin-top: 6px;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px dashed #1f2937;
        font-size: 12px;
        color: #e5e7eb;
      }
      .footer {
        margin-top: 20px;
        font-size: 11px;
        color: #6b7280;
        text-align: right;
      }
      @media print {
        body {
          background: #ffffff;
          color: #111827;
        }
        .report {
          border: none;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="report">
      <h1>Submission Report</h1>
      <div class="section">
        <div class="meta-grid">
          <div>
            <div class="meta-label">Title</div>
            <div class="meta-value">${escapeHtml(sub.assignment_title)}</div>
          </div>
          <div>
            <div class="meta-label">Type</div>
            <div class="meta-value"><span class="pill">${escapeHtml(sub.type || sub.submission_type || '')}</span></div>
          </div>
          <div>
            <div class="meta-label">Status</div>
            <div class="meta-value"><span class="pill status-submitted">${escapeHtml(sub.status || '')}</span></div>
          </div>
          <div>
            <div class="meta-label">Student</div>
            <div class="meta-value">${escapeHtml(sub.user_name || '')}</div>
          </div>
          <div>
            <div class="meta-label">Submitted at</div>
            <div class="meta-value">${
              sub.created_at
                ? escapeHtml(new Date(sub.created_at).toLocaleString())
                : 'N/A'
            }</div>
          </div>
        </div>
      </div>

      ${
        sub.task_description
          ? `
      <div class="section">
        <h2>Original Assignment Task</h2>
        <div class="box">${escapeHtml(sub.task_description)}</div>
      </div>`
          : ''
      }

      <div class="section">
        <h2>Submission Content</h2>
        <div class="box code">${escapeHtml(sub.content || '')}</div>
      </div>

      <div class="section">
        <h2>Feedback</h2>
        ${
          feedbacks.length === 0
            ? '<div class="box">No feedback yet.</div>'
            : feedbacks
                .map((fb) => {
                  const scores = fb.scores || {}
                  const scoreEntries = Object.entries(scores)
                  const isAi = (fb.type || fb.feedback_type) === 'ai'
                  return `
          <div class="feedback-item">
            <div class="feedback-header">
              <div><strong>${escapeHtml(fb.reviewer_name || (isAi ? 'AI Assistant' : 'Reviewer'))}</strong></div>
              <div class="badge ${isAi ? 'badge-ai' : 'badge-human'}">
                ${isAi ? 'AI FEEDBACK' : 'PEER FEEDBACK'}
              </div>
            </div>
            <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap;">
              ${escapeHtml(fb.text || fb.feedback_text || '')}
            </div>
            ${
              scoreEntries.length
                ? `<div class="scores">
              ${scoreEntries
                .map(
                  ([k, v]) =>
                    `<span class="score-pill">${escapeHtml(
                      k,
                    )}: ${Number(v * 100 || 0).toFixed(0)}%</span>`,
                )
                .join('')}
            </div>`
                : ''
            }
          </div>`
                })
                .join('')
        }
      </div>

      <div class="section">
        <h2>Peer Reviews</h2>
        ${
          peerReviews.length === 0
            ? '<div class="box">No peer reviews recorded.</div>'
            : peerReviews
                .map(
                  (pr) => `
          <div class="peer-item">
            <strong>${escapeHtml(pr.reviewer_name || 'Reviewer')}</strong>
            &nbsp;–&nbsp;
            <span>${escapeHtml(pr.status || '')}</span>
          </div>`,
                )
                .join('')
        }
      </div>

      <div class="footer">
        Generated at ${escapeHtml(now.toLocaleString())}
      </div>
    </div>
    <script>
      window.onload = function () {
        try {
          window.focus();
          window.print();
        } catch (e) {
          // ignore
        }
      };
    </script>
  </body>
</html>
    `

    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        // Popup blocked: as a fallback, navigate current window
        window.location.href = url
      }
    } catch {
      // If something goes wrong, do nothing rather than breaking the app
    }
  }

  const handlePlagiarismCheck = async () => {
    if (!isTeacher) {
      setPlagiarismError('Only teachers can run plagiarism checks.')
      return
    }

    setCheckingPlagiarism(true)
    try {
      const result = await api.post('/v1/plagiarism-check', {
        content: submission.submission.content
      })
      setPlagiarismResult(result)
      setPlagiarismError('')
    } catch (err) {
      // Error already handled by API interceptor
      setPlagiarismError(err?.error || 'Failed to run plagiarism check.')
    } finally {
      setCheckingPlagiarism(false)
    }
  }

  const handleSaveVersion = async () => {
    if (!submission || !submission.submission) {
      return
    }

    // Auto-generate a simple note instead of using prompt (which may not be supported)
    const autoNote = `Saved from UI on ${new Date().toLocaleString()}`

    try {
      const result = await api.post(`/v1/submission/${submissionId}/save-version`, {
        note: autoNote
      })
      
      // Reload versions to show the new one
      try {
        const versionsData = await api.get(`/v1/submission/${submissionId}/versions`)
        setVersions(versionsData)
      } catch (err) {
        // Versions might not exist, that's fine
      }

      // Show success feedback
      alert(`✅ Version ${result.version_number} saved successfully!`)
    } catch (err) {
      alert(err?.error || 'Failed to save version. Please try again.')
    }
  }

  if (loading || !submission) {
    return (
      <div className="tabbed-modal" style={{ display: 'block' }}>
        <div className="tabbed-modal-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tabbed-modal" style={{ display: 'block' }}>
      <div className="tabbed-modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '2px solid var(--border-color)' }}>
          <h2 className="gradient-text">{submission.submission.assignment_title}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleExport}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              📥 Export
            </button>
            <button
              onClick={handleSaveVersion}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              💾 Save Version
            </button>
            {isTeacher && (
              <button
                onClick={handlePlagiarismCheck}
                className="btn btn-secondary"
                disabled={checkingPlagiarism}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {checkingPlagiarism ? '⏳ Checking...' : '🔍 Check Plagiarism'}
              </button>
            )}
          <span className="close" onClick={onClose} style={{ fontSize: '2rem', cursor: 'pointer' }}>
            &times;
          </span>
        </div>
        </div>
        {plagiarismResult && (
          <div className="alert" style={{
            margin: '1rem 2rem',
            background: plagiarismResult.similarity > 0.5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${plagiarismResult.similarity > 0.5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
          }}>
            <strong>Plagiarism Check:</strong> Similarity: {(plagiarismResult.similarity * 100).toFixed(1)}%
            {plagiarismResult.matches && plagiarismResult.matches.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Found {plagiarismResult.matches.length} potential matches
              </div>
            )}
          </div>
        )}
        {plagiarismError && (
          <div className="alert alert-error" style={{ margin: '0 2rem 1rem' }}>
            {plagiarismError}
          </div>
        )}
        <div className="modal-tabs">
          <button className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
            <i className="fas fa-info-circle"></i> Details
          </button>
          <button className={`modal-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
            <i className="fas fa-file-code"></i> Files
          </button>
          <button className={`modal-tab ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
            <i className="fas fa-comments"></i> Feedback
          </button>
          <button className={`modal-tab ${activeTab === 'versions' ? 'active' : ''}`} onClick={() => setActiveTab('versions')}>
            <i className="fas fa-history"></i> Versions
          </button>
        </div>
        <div className="modal-tab-content" style={{ display: activeTab === 'details' ? 'block' : 'none', padding: '2rem' }}>
          <div className="feedback-content">
            <div className="feedback-section">
              <h4>
                <i className="fas fa-user"></i> Submission Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <strong>Type:</strong> <span className="badge badge-primary">{submission.submission.type}</span>
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`badge badge-${submission.submission.status === 'submitted' ? 'success' : 'warning'}`}>
                    {submission.submission.status}
                  </span>
                </div>
                <div>
                  <strong>Submitted:</strong> <span>{submission.submission.created_at ? (() => { try { return new Date(submission.submission.created_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}</span>
                </div>
              </div>
            </div>
            {submission.submission.task_description && (
              <div className="feedback-section">
                <h4>
                  <i className="fas fa-tasks"></i> Original Assignment Task
                </h4>
                <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', whiteSpace: 'pre-wrap', borderLeft: '4px solid var(--primary-color)' }}>
                  {submission.submission.task_description}
                </div>
              </div>
            )}
            {(!submission.submission.files || submission.submission.files.length === 0) && (
              <div className="feedback-section">
                <h4>
                  <i className="fas fa-file-alt"></i> Submission Content
                </h4>
                <pre style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
                  {submission.submission.content}
                </pre>
              </div>
            )}
          </div>
        </div>
        <div className="modal-tab-content" style={{ display: activeTab === 'files' ? 'block' : 'none', padding: '2rem' }}>
          {submission.submission.files && submission.submission.files.length > 0 ? (
            <div>
              {submission.submission.files.map((file, index) => (
                <div key={file.filename || `file-${index}`} style={{ marginBottom: '1.5rem' }}>
                  <h4>{file.filename}</h4>
                  <pre style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <h3>No Files</h3>
              <p>This submission doesn't have separate files.</p>
            </div>
          )}
        </div>
        <div className="modal-tab-content" style={{ display: activeTab === 'feedback' ? 'block' : 'none', padding: '2rem' }}>
          {submission.feedbacks && Array.isArray(submission.feedbacks) && submission.feedbacks.length > 0 ? (
            <div className="feedback-content">
              {submission.feedbacks.map((fb) => (
                <div key={fb.id} className="feedback-item" style={{ marginBottom: '1.5rem' }}>
                  <div className="feedback-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <strong>
                        <i className="fas fa-user"></i> {fb.reviewer_name}
                      </strong>
                      <span className={`badge badge-${fb.type === 'ai' ? 'primary' : 'success'}`} style={{ marginLeft: '0.5rem' }}>
                        {fb.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="feedback-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {fb.text || fb.feedback_text || ''}
                  </div>
                  {Object.keys(fb.scores || {}).length > 0 && (
                    <div className="scores" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {Object.entries(fb.scores).map(([key, value]) => (
                        <span key={key} className="badge badge-success">
                          {key}: {(value * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  )}
                  <FeedbackReactions feedbackId={fb.id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>No Feedback Yet</h3>
              <p>Feedback will appear here once it's generated or provided.</p>
            </div>
          )}
        </div>
        <div className="modal-tab-content" style={{ display: activeTab === 'versions' ? 'block' : 'none', padding: '2rem' }}>
          {versions.length > 0 ? (
            <div>
              {versions.map((version) => (
                <div key={version.id} style={{
                  marginBottom: '1.5rem',
                  padding: '1.5rem',
                  background: 'var(--bg-color)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Version {version.version_number}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {version.created_at ? (() => { try { return new Date(version.created_at).toLocaleString() } catch { return 'Invalid Date' } })() : 'N/A'}
                    </span>
                  </div>
                  {version.note && (
                    <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {version.note}
                    </div>
                  )}
                  <pre style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    overflowX: 'auto',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '0.85rem',
                  }}>
                    {(version.content || '').substring(0, 500)}{(version.content || '').length > 500 ? '...' : ''}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <h3>No Version History</h3>
              <p>Save versions to track changes to your submission.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubmissionDetailModal

