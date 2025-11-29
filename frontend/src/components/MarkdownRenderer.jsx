import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const MarkdownRenderer = ({ content }) => {
  // Handle empty or null content
  if (!content || (typeof content === 'string' && !content.trim())) {
    return (
      <div style={{ 
        padding: '1rem', 
        textAlign: 'center', 
        color: '#ffffff',
        fontStyle: 'italic',
        fontSize: '1.2rem'
      }}>
        No content available
      </div>
    )
  }

  // Ensure content is a string
  const contentString = typeof content === 'string' ? content : String(content || '')
  
  return (
    <div style={{ color: '#ffffff', fontSize: '1.4rem', lineHeight: '2' }}>
      <ReactMarkdown
      components={{
        // Code blocks with syntax highlighting
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const codeString = String(children).replace(/\n$/, '')
          
          return !inline && match ? (
            <div style={{ 
              margin: '1.5rem 0',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                background: '#1a1a1a',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#888',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'monospace',
              }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <span style={{ color: '#4ade80' }}>●</span>
                  {language || 'code'}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(codeString)
                      // Could show a toast notification here
                    } catch (err) {
                      // Failed to copy - silently fail
                    }
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    color: '#ccc',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = '#ccc'
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <div style={{
                maxHeight: '500px',
                overflowY: 'auto',
                overflowX: 'auto',
              }}>
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    fontSize: '0.9rem',
                    lineHeight: '1.7',
                    background: '#1e1e1e',
                    fontFamily: '"Fira Code", "Consolas", "Monaco", "Courier New", monospace',
                    minHeight: 'auto',
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <code
              className={className}
              style={{
                background: 'rgba(251, 146, 60, 0.3)',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontSize: '1.1em',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontWeight: '600',
                border: '1px solid rgba(251, 146, 60, 0.5)',
              }}
              {...props}
            >
              {children}
            </code>
          )
        },
        // Headings
        h1: ({ node, ...props }) => (
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '1rem', color: '#f8fafc' }} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1.25rem', marginBottom: '0.75rem', color: '#f8fafc' }} {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem', color: '#f8fafc' }} {...props} />
        ),
        // Paragraphs
        p: ({ node, ...props }) => (
          <p style={{ 
            marginBottom: '1rem', 
            lineHeight: '1.8', 
            fontSize: '1.25rem',
            color: '#ffffff',
            fontWeight: '400'
          }} {...props} />
        ),
        // Lists
        ul: ({ node, ...props }) => (
          <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem', lineHeight: '1.7', color: '#f8fafc' }} {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol style={{ marginBottom: '1rem', paddingLeft: '1.5rem', lineHeight: '1.7', color: '#f8fafc' }} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li style={{ marginBottom: '0.5rem', color: '#f8fafc' }} {...props} />
        ),
        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong style={{ fontWeight: 'bold', color: '#a5b4fc' }} {...props} />
        ),
        // Links
        a: ({ node, ...props }) => (
          <a style={{ color: 'var(--primary-color)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" {...props} />
        ),
        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            style={{
              borderLeft: '4px solid var(--primary-color)',
              paddingLeft: '1rem',
              margin: '1rem 0',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
            }}
            {...props}
          />
        ),
      }}
    >
      {contentString}
    </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer

