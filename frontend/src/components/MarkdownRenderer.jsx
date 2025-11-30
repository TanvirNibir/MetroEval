import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import '../styles/components/MarkdownRenderer.css'

const MarkdownRenderer = ({ content }) => {
  // Handle empty or null content
  if (!content || (typeof content === 'string' && !content.trim())) {
    return (
      <div className="markdown-renderer__empty">
        No content available
      </div>
    )
  }

  // Ensure content is a string
  const contentString = typeof content === 'string' ? content : String(content || '')
  
  return (
    <div className="markdown-renderer">
      <ReactMarkdown
      components={{
        // Code blocks with syntax highlighting
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const codeString = String(children).replace(/\n$/, '')
          
          return !inline && match ? (
            <div className="markdown-renderer__code-block">
              <div className="markdown-renderer__code-header">
                <span className="markdown-renderer__code-label">
                  <span className="markdown-renderer__code-dot">●</span>
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
                  className="markdown-renderer__copy-button"
                >
                  📋 Copy
                </button>
              </div>
              <div className="markdown-renderer__code-content">
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
              className={`${className || ''} markdown-renderer__inline-code`}
              {...props}
            >
              {children}
            </code>
          )
        },
        // Headings, paragraphs, lists, etc. are styled via CSS classes
        h1: ({ node, ...props }) => <h1 {...props} />,
        h2: ({ node, ...props }) => <h2 {...props} />,
        h3: ({ node, ...props }) => <h3 {...props} />,
        p: ({ node, ...props }) => <p {...props} />,
        ul: ({ node, ...props }) => <ul {...props} />,
        ol: ({ node, ...props }) => <ol {...props} />,
        li: ({ node, ...props }) => <li {...props} />,
        strong: ({ node, ...props }) => <strong {...props} />,
        a: ({ node, ...props }) => (
          <a target="_blank" rel="noopener noreferrer" {...props} />
        ),
        blockquote: ({ node, ...props }) => <blockquote {...props} />,
      }}
    >
      {contentString}
    </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer

