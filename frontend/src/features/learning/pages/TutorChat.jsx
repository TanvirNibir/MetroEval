import React, { useState, useRef, useEffect } from 'react'
import api from '../../../services/api'
import MarkdownRenderer from '../../../components/MarkdownRenderer'
import '../../../styles/features/learning/TutorChat.css'

const TutorChat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookmarkStatus, setBookmarkStatus] = useState('')
  const [context, setContext] = useState('')
  const messagesEndRef = useRef(null)
  const starterPrompts = [
    'Can you explain recursion with a simple example?',
    'Why is my API request returning 500? What should I check?',
    'How do I structure a MongoEngine model with relationships?',
    'Give me tips for writing cleaner React components.'
  ]

  const bookmarkConversation = async () => {
    if (!messages.length) {
      setBookmarkStatus('Start a conversation before bookmarking.')
      return
    }

    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')
    const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant')
    const conversation = messages
      .map((msg) => `${msg.role === 'user' ? 'You' : 'Tutor'}: ${msg.text}`)
      .join('\n')

    try {
      setBookmarkStatus('Saving chat...')
      await api.post('/v1/bookmarks', {
        type: 'tutor-chat',
        title: lastQuestion?.text || 'Tutor chat',
        subtitle: 'AI Tutor conversation',
        notes: context || '',
        highlight: lastAnswer?.text || '',
        conversation,
      })
      setBookmarkStatus('Saved to bookmarks!')
      setTimeout(() => setBookmarkStatus(''), 2500)
    } catch (err) {
      setBookmarkStatus(err?.error || 'Unable to bookmark chat.')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', text: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/v1/tutor/chat', {
        question: input,
        context: context,
        history: messages  // Send conversation history for context
      })

      if (response.success) {
        const aiMessage = { role: 'assistant', text: response.response }
        setMessages([...updatedMessages, aiMessage])
      } else {
        const errorMessage = { 
          role: 'assistant', 
          text: response.error || response.response || 'Sorry, I encountered an error. Please try again.' 
        }
        setMessages([...updatedMessages, errorMessage])
      }
    } catch (err) {
      const errorMessage = { 
        role: 'assistant', 
        text: err.error || err.message || 'Sorry, I encountered an error. Please try again.' 
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([])
      setContext('')
    }
  }

  return (
    <div className="tutor-page">
      <header className="tutor-hero card">
        <div>
          <p className="eyebrow">Smart Study Buddy</p>
          <h2>AI Tutor Chat</h2>
          <p className="dashboard-subtitle">
            Get friendly explanations, sample code, and study tips whenever you need them.
          </p>
        </div>
        <div className="tutor-hero__meta">
          <span>👨‍🏫 Available 24/7</span>
          <span>⚡ Fast & encouraging feedback</span>
        </div>
      </header>

      <div className="tutor-layout">
        <section className="tutor-chat-card card">
          <header className="tutor-chat-card__header">
            <div>
              <h3>Live Session</h3>
              <p>{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
            </div>
            {messages.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="ghost-button" onClick={bookmarkConversation}>
                  🔖 Save chat
                </button>
                <button className="ghost-button danger" onClick={clearConversation}>
                  🗑️ Clear chat
                </button>
              </div>
            )}
          </header>

          {bookmarkStatus && (
            <div className="alert alert-info" style={{ marginBottom: '0.75rem' }}>
              {bookmarkStatus}
            </div>
          )}

          <div className="tutor-messages" ref={messagesEndRef}>
            {messages.length === 0 ? (
              <div className="tutor-empty-state">
                <div className="emoji">👨‍🏫</div>
                <h3>Hi! I'm your tutor</h3>
                <p>Ask me anything about programming, debugging, or study strategy.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={`msg-${msg.role}-${index}-${msg.text?.substring(0, 10) || ''}`} className={`tutor-message tutor-message--${msg.role}`}>
                  {msg.role === 'assistant' && <span className="tutor-avatar">👨‍🏫</span>}
                  <div className="tutor-bubble">
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="tutor-message tutor-message--assistant">
                <span className="tutor-avatar">👨‍🏫</span>
                <div className="tutor-bubble">
                  <div className="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="tutor-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a clear question (e.g., “Why is my fetch returning 401?”)"
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>

          <div className="tutor-prompts">
            <p>Try a starter question:</p>
            <div className="prompt-chips">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="prompt-chip"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="tutor-sidebar">
          <section className="tutor-context card">
            <div className="tutor-context__header">
              <h4>Assignment context</h4>
              {context && (
                <button onClick={() => setContext('')} className="ghost-button">
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste assignment description, error output, or code snippets to get more tailored help."
            />
            <small>Tip: include stack traces or requirements to get focused feedback.</small>
          </section>

          <section className="tutor-tips card">
            <h4>Study tips</h4>
            <ul>
              <li>Describe the problem you are solving</li>
              <li>Share what you have tried already</li>
              <li>Ask for next steps or resources</li>
              <li>Follow up until the concept feels clear</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default TutorChat

