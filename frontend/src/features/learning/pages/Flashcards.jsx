import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../../services/api'
import MarkdownRenderer from '../../../components/MarkdownRenderer'
import '../../../styles/features/learning/Flashcards.css'

const emptyForm = {
  front: '',
  back: '',
  category: 'general',
}

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const Flashcards = () => {
  const location = useLocation()
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingReview, setPendingReview] = useState(null)
  const [answerInputs, setAnswerInputs] = useState({})
  const [verificationResults, setVerificationResults] = useState({})
  const [verifyingCardId, setVerifyingCardId] = useState(null)
  const [generationTopic, setGenerationTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [bookmarkedFlashcards, setBookmarkedFlashcards] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchBookmarks = async () => {
    try {
      const bookmarks = await api.get('/v1/bookmarks')
      const bookmarkArray = Array.isArray(bookmarks) ? bookmarks : (bookmarks?.data || [])
      const flashcardBookmarkIds = new Set(
        bookmarkArray
          .filter(b => b.type === 'flashcard' && b.flashcard_id)
          .map(b => String(b.flashcard_id))
      )
      setBookmarkedFlashcards(flashcardBookmarkIds)
    } catch (err) {
      // Error already handled by API interceptor - silently fail
      // Bookmarks are optional, so don't block the component if they fail to load
    }
  }

  const fetchFlashcards = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/v1/flashcards')
      // Handle wrapped response {success: true, data: [...]}
      let flashcardsData = []
      if (Array.isArray(response)) {
        flashcardsData = response
      } else if (response && Array.isArray(response.data)) {
        flashcardsData = response.data
      } else if (response && typeof response === 'object') {
        // Try to find array in response
        const arrayKeys = ['data', 'flashcards', 'items']
        for (const key of arrayKeys) {
          if (Array.isArray(response[key])) {
            flashcardsData = response[key]
            break
          }
        }
        // If still no array, check all values
        if (flashcardsData.length === 0) {
          const values = Object.values(response)
          const arrayValue = values.find(v => Array.isArray(v))
          if (arrayValue) {
            flashcardsData = arrayValue
          }
        }
      }
      setFlashcards(flashcardsData)
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to load flashcards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlashcards()
    fetchBookmarks()
  }, [])

  // Handle opening flashcard from bookmark
  useEffect(() => {
    if (location.state?.openFlashcardId && flashcards.length > 0) {
      const flashcardId = location.state.openFlashcardId
      const category = location.state.category
      
      // Find the flashcard
      const flashcard = flashcards.find(f => String(f.id) === String(flashcardId))
      if (flashcard) {
        // Use the flashcard's actual category
        const flashcardCategory = category || flashcard.category || 'general'
        
        // Find cards in that category
        const categoryFlashcards = flashcards.filter(f => {
          const cardCategory = f.category || 'general'
          return slugify(cardCategory) === slugify(flashcardCategory)
        })
        
        // Find the index of the target flashcard
        const cardIndex = categoryFlashcards.findIndex(f => String(f.id) === String(flashcardId))
        
        if (cardIndex !== -1) {
          setActiveCategory(flashcardCategory)
          setActiveCardIndex(cardIndex)
        }
      }
      
      // Clear the state to prevent reopening on re-render
      window.history.replaceState({}, document.title)
    }
  }, [location.state, flashcards])

  const groupedByCategory = useMemo(() => {
    return flashcards.reduce((groups, card) => {
      const category = card.category || 'general'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(card)
      return groups
    }, {})
  }, [flashcards])

  const topicCards = useMemo(() => {
    return Object.entries(groupedByCategory)
      .map(([category, cards]) => {
        const masteryAvg =
          cards.reduce((sum, card) => sum + (card.mastery_level || 0), 0) /
          (cards.length || 1)
        const needsReview = cards.filter((card) => (card.mastery_level || 0) < 0.8).length
        return {
          category,
          cards,
          count: cards.length,
          masteryAvg,
          needsReview,
        }
      })
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [groupedByCategory])

  const activeCards = activeCategory ? groupedByCategory[activeCategory] || [] : []
  const activeCard = activeCards[activeCardIndex] || null

  useEffect(() => {
    if (!activeCategory) return
    const cards = groupedByCategory[activeCategory] || []
    if (cards.length === 0) {
      setActiveCategory(null)
      setActiveCardIndex(0)
    } else if (activeCardIndex >= cards.length) {
      setActiveCardIndex(0)
    }
  }, [activeCategory, activeCardIndex, groupedByCategory])

  // Track active card changes
  useEffect(() => {
    if (activeCard) {
      // Active flashcard is set - component will re-render
    }
  }, [activeCard])

  const masteryLabel = (level) => {
    if (level >= 0.8) return 'Mastered'
    if (level >= 0.5) return 'In Progress'
    return 'Needs Review'
  }

  const handleCreateFlashcard = async (event) => {
    event.preventDefault()
    if (!formData.front.trim() || !formData.back.trim()) {
      setError('Both the question and the answer are required.')
      return
    }

    setIsCreating(true)
    setError(null)
    try {
      await api.post('/v1/flashcards', {
        front: formData.front.trim(),
        back: formData.back.trim(),
        category: formData.category.trim() || 'general',
      })
      setFormData(emptyForm)
      await fetchFlashcards()
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to create the flashcard')
    } finally {
      setIsCreating(false)
    }
  }

  const bookmarkFlashcard = async () => {
    if (!activeCard) return
    
    const cardId = String(activeCard.id)
    const isBookmarked = bookmarkedFlashcards.has(cardId)
    
    try {
      if (isBookmarked) {
        // Unbookmark - find and delete the bookmark
        const bookmarks = await api.get('/v1/bookmarks')
        const bookmarkArray = Array.isArray(bookmarks) ? bookmarks : (bookmarks?.data || [])
        const bookmark = bookmarkArray.find(
          b => b.type === 'flashcard' && String(b.flashcard_id) === cardId
        )
        if (bookmark) {
          await api.delete(`/v1/bookmarks/${bookmark.id}`)
        }
        setBookmarkedFlashcards(prev => {
          const newSet = new Set(prev)
          newSet.delete(cardId)
          return newSet
        })
      } else {
        // Bookmark
        await api.post('/v1/bookmarks', {
          type: 'flashcard',
          flashcard_id: activeCard.id,
          notes: activeCard.category || 'flashcard',
        })
        setBookmarkedFlashcards(prev => new Set(prev).add(cardId))
      }
    } catch (err) {
      // Error already handled by API interceptor
    }
  }

  const handleDeleteClick = () => {
    if (!activeCard) return
    setShowDeleteConfirm(true)
  }

  const deleteFlashcard = async () => {
    if (!activeCard) return
    const deletedCardId = String(activeCard.id)
    const currentCategory = activeCategory
    const currentIndex = activeCardIndex
    
    try {
      await api.delete(`/v1/flashcards/${activeCard.id}`)
      
      // Remove from bookmarked set if it was bookmarked
      if (bookmarkedFlashcards.has(deletedCardId)) {
        setBookmarkedFlashcards(prev => {
          const newSet = new Set(prev)
          newSet.delete(deletedCardId)
          return newSet
        })
      }
      
      setShowDeleteConfirm(false)
      
      // Refresh flashcards - the useEffect will handle closing modal if no cards remain
      await fetchFlashcards()
      
      // Adjust index if we deleted the last card - go to previous card
      // The useEffect will handle bounds checking after flashcards update
      if (currentIndex > 0) {
        setActiveCardIndex(Math.max(0, currentIndex - 1))
      }
    } catch (err) {
      // Error already handled by API interceptor
      setShowDeleteConfirm(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleReview = async (cardId, correct) => {
    setPendingReview(cardId)
    try {
      const response = await api.post(`/v1/flashcard/${cardId}/review`, { correct })
      setFlashcards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, mastery_level: response.mastery_level } : card
        )
      )
    } catch (err) {
      setError(err?.error || err?.message || 'Unable to update mastery')
    } finally {
      setPendingReview(null)
    }
  }

  const handleVerify = async (cardId) => {
    const answer = answerInputs[cardId]?.trim()
    if (!answer) {
      setError('Please enter your answer before verifying.')
      return
    }

    setError(null)
    setVerifyingCardId(cardId)
    try {
      const result = await api.post(`/v1/flashcard/${cardId}/verify-answer`, {
        answer,
      })
      setVerificationResults((prev) => ({
        ...prev,
        [cardId]: result,
      }))
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to verify the answer')
    } finally {
      setVerifyingCardId(null)
    }
  }

  const handleGenerateFlashcards = async (event) => {
    event.preventDefault()
    const topic = generationTopic.trim()
    if (!topic) {
      setError('Please provide a topic for AI flashcard generation.')
      return
    }

    setError(null)
    setGenerationStatus(null)
    setIsGenerating(true)

    try {
      const response = await api.post('/v1/flashcards/generate', { topic })
      const createdCount = response?.count || response?.flashcards?.length || 0
      const expectedCount = response?.expected_count || 25
      
      if (createdCount === expectedCount) {
        setGenerationStatus(`✅ Successfully generated ${createdCount} AI flashcards for "${topic}"!`)
      } else {
        setGenerationStatus(`⚠️ Generated ${createdCount} flashcards (expected ${expectedCount}) for "${topic}".`)
      }
      setGenerationTopic('')
      
      // Wait a moment for database to update, then fetch
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchFlashcards()
      
      // Log the flashcards to help debug
      const flashcardsData = await api.get('/v1/flashcards')
      let flashcardsArray = []
      if (Array.isArray(flashcardsData)) {
        flashcardsArray = flashcardsData
      } else if (flashcardsData?.data && Array.isArray(flashcardsData.data)) {
        flashcardsArray = flashcardsData.data
      }
      // Flashcards fetched successfully
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to generate flashcards from AI')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderVerification = (cardId) => {
    const result = verificationResults[cardId]
    if (!result) return null
    return (
      <div
        className={`flashcard-verification ${
          result.is_correct ? 'flashcard-verification--correct' : 'flashcard-verification--incorrect'
        }`}
      >
        <div className="flashcard-verification__status">
          {result.is_correct ? '✅ Correct' : '❌ Incorrect'}
          <span>Confidence {(result.confidence * 100).toFixed(0)}%</span>
        </div>
        <p>{result.feedback}</p>
        {typeof result.similarity_score === 'number' && (
          <p className="flashcard-verification__score">
            Similarity {(result.similarity_score * 100).toFixed(0)}%
          </p>
        )}
      </div>
    )
  }

  const openStudyModal = (category) => {
    setActiveCategory(category)
    setActiveCardIndex(0)
  }

  const handleTopicCardKeyDown = (event, category) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openStudyModal(category)
    }
  }

  const closeStudyModal = () => {
    setActiveCategory(null)
    setActiveCardIndex(0)
  }

  const goToPreviousCard = () => {
    setActiveCardIndex((prev) => Math.max(prev - 1, 0))
  }

  const goToNextCard = () => {
    setActiveCardIndex((prev) => Math.min(prev + 1, activeCards.length - 1))
  }

  const activeProgressValue = activeCard ? activeCardIndex + 1 : 0
  const activeAnswerInputId = activeCard ? `flashcard-answer-${activeCard.id}` : undefined
  const isActiveCardBookmarked = activeCard ? bookmarkedFlashcards.has(String(activeCard.id)) : false

  return (
    <div className="flashcards-page">
      <header className="flashcards-header">
        <div>
          <p className="eyebrow">Study smarter</p>
          <h1>Flashcards</h1>
          <p className="subtitle">
            Review questions, verify answers with AI, and track your mastery level over time.
          </p>
        </div>
        <div className="flashcards-header__stats">
          <div className="stat-card">
            <span>Total Cards</span>
            <strong>{Array.isArray(flashcards) ? flashcards.length : 0}</strong>
          </div>
          <div className="stat-card">
            <span>Ready to Review</span>
            <strong>
              {Array.isArray(flashcards) ? flashcards.filter((card) => (card.mastery_level || 0) < 0.8).length : 0}
            </strong>
          </div>
        </div>
      </header>

      <section className="flashcards-actions">
        <form className="flashcard-generator" onSubmit={handleGenerateFlashcards}>
          <div>
            <label htmlFor="flashcard-topic">Generate flashcards with AI</label>
            <input
              id="flashcard-topic"
              type="text"
              placeholder="e.g., Python loops, formative assessment"
              value={generationTopic}
              onChange={(e) => setGenerationTopic(e.target.value)}
            />
            <small style={{ marginTop: '0.5rem', display: 'block', color: 'var(--text-muted)' }}>
              AI will generate exactly 25 flashcards for your topic
            </small>
          </div>
          <button className="primary" type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating 25 flashcards with AI…' : 'Generate 25 flashcards'}
          </button>
          {generationStatus && (
            <p className="flashcard-generator__status" role="status" aria-live="polite">
              {generationStatus}
            </p>
          )}
        </form>

        <form className="flashcard-form" onSubmit={handleCreateFlashcard}>
          <h2>Create a new flashcard</h2>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-muted)', 
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(251, 146, 60, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(251, 146, 60, 0.2)',
          }}>
            💡 <strong>Tip:</strong> You can include code examples (10-50 lines) using markdown code blocks. 
            Example: <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>```python</code> for Python code
          </p>
          <div className="form-grid">
            <label>
              Question
              <textarea
                value={formData.front}
                onChange={(e) => setFormData((prev) => ({ ...prev, front: e.target.value }))}
                placeholder="e.g., Explain the difference between formative and summative assessment. You can include code using markdown: ```python&#10;code here&#10;```"
                style={{ minHeight: '120px', fontFamily: 'inherit' }}
              />
            </label>
            <label>
              Answer
              <textarea
                value={formData.back}
                onChange={(e) => setFormData((prev) => ({ ...prev, back: e.target.value }))}
                placeholder="e.g., Formative assessments... You can include code examples (10-50 lines) using markdown code blocks: ```python&#10;def example():&#10;    return 'code'&#10;```"
                style={{ minHeight: '150px', fontFamily: 'inherit' }}
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., pedagogy"
              />
            </label>
          </div>
          <button type="submit" className="primary" disabled={isCreating}>
            {isCreating ? 'Creating…' : 'Add flashcard'}
          </button>
        </form>
      </section>

      {error && (
        <div className="flashcards-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flashcards-loading">Loading your flashcards…</div>
      ) : topicCards.length === 0 ? (
        <div className="flashcards-empty">
          <p>No flashcards yet. Generate a set to get started.</p>
          <button className="secondary" onClick={fetchFlashcards}>
            Refresh
          </button>
        </div>
      ) : (
        <>
          <section className="flashcard-topic-grid">
            {topicCards.map((topic) => {
              const topicId = slugify(topic.category)
              const statsId = `topic-${topicId}-stats`
              return (
                <article
                  key={topic.category}
                  className="flashcard-topic-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`Study ${topic.category} flashcards (${topic.count} cards)`}
                  aria-describedby={statsId}
                  onClick={() => openStudyModal(topic.category)}
                  onKeyDown={(event) => handleTopicCardKeyDown(event, topic.category)}
                >
                  <div className="flashcard-topic-card__header">
                    <div>
                      <p className="flashcard-topic-label">Topic</p>
                      <h3>{topic.category}</h3>
                    </div>
                    <span className="flashcard-topic-count">{topic.count} cards</span>
                  </div>
                  <div className="flashcard-topic-card__stats" id={statsId}>
                    <div>
                      <small>Avg mastery</small>
                      <strong>{Math.round((topic.masteryAvg || 0) * 100)}%</strong>
                    </div>
                    <div>
                      <small>Need review</small>
                      <strong>{topic.needsReview}</strong>
                    </div>
                  </div>
                  <div className="flashcard-topic-card__actions">
                    <button
                      className="primary"
                      onClick={(event) => {
                        event.stopPropagation()
                        openStudyModal(topic.category)
                      }}
                    >
                      Study set
                    </button>
                  </div>
                </article>
              )
            })}
          </section>

          {activeCategory && activeCard && (
            <div
              className="flashcard-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Studying ${activeCategory} flashcards`}
            >
              <div className="flashcard-modal__panel">
                <div className="flashcard-modal__header">
                  <div>
                    <p className="flashcard-topic-label">{activeCategory}</p>
                    <h2>
                      Card {activeCardIndex + 1} / {activeCards.length}
                    </h2>
                  </div>
                  <div className="flashcard-modal__actions">
                    <button 
                      className={`ghost-button ${isActiveCardBookmarked ? 'saved' : ''}`} 
                      onClick={bookmarkFlashcard}
                    >
                      {isActiveCardBookmarked ? '✅ Saved' : '🔖 Save'}
                    </button>
                    <button className="ghost-button danger" onClick={handleDeleteClick}>
                      Delete
                    </button>
                    <button className="flashcard-modal__close" onClick={closeStudyModal}>
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flashcard-progress" aria-live="polite">
                  <span className="flashcard-progress__label">Progress</span>
                  <progress value={activeProgressValue} max={activeCards.length} />
                  <span className="flashcard-progress__value">
                    {activeProgressValue} of {activeCards.length}
                  </span>
                </div>

                <div className="flashcard-modal__body">
                  <div style={{ marginBottom: '2rem' }}>
                    <p className="flashcard-modal__label">Question</p>
                    <div className="flashcard-modal__content">
                      {activeCard.front && activeCard.front.trim() ? (
                        <div style={{ 
                          color: '#ffffff', 
                          fontSize: '1.4rem', 
                          lineHeight: '2', 
                          fontWeight: '500',
                          width: '100%',
                          display: 'block'
                        }}>
                          <MarkdownRenderer content={activeCard.front} />
                          {/* Fallback plain text display */}
                          <div style={{ 
                            display: 'none',
                            color: '#ffffff',
                            fontSize: '1.4rem',
                            lineHeight: '2',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {activeCard.front}
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          padding: '2rem', 
                          textAlign: 'center', 
                          color: '#ffffff',
                          fontStyle: 'italic',
                          fontSize: '1.2rem'
                        }}>
                          <p>⚠️ No question content available for this flashcard.</p>
                          <p style={{ fontSize: '1rem', marginTop: '0.5rem', color: '#ff6b6b' }}>
                            Debug Info: front exists = {String(!!activeCard.front)}, 
                            length = {activeCard.front?.length || 0}, 
                            value = {activeCard.front?.substring(0, 50) || 'null'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {verificationResults[activeCard.id] ? (
                    <div style={{ marginTop: '1.5rem' }}>
                      <p className="flashcard-modal__label" style={{ 
                        color: 'var(--success-color, #10b981)'
                      }}>
                        <span style={{ marginRight: '0.5rem' }}>✅</span>
                        Answer
                      </p>
                      <div className="flashcard-modal__content" style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                        borderColor: 'rgba(16, 185, 129, 0.5)'
                      }}>
                        {activeCard.back && activeCard.back.trim() ? (
                          <MarkdownRenderer content={activeCard.back} />
                        ) : (
                          <div style={{ 
                            padding: '2rem', 
                            textAlign: 'center', 
                            color: '#ffffff',
                            fontStyle: 'italic',
                            fontSize: '1.2rem'
                          }}>
                            <p>⚠️ No answer content available for this flashcard.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="flashcard-modal__hint">
                      💡 Type your answer below and click "Verify answer" to see the official answer and get AI feedback.
                    </p>
                  )}
                </div>

                <div className="flashcard-modal__nav">
                  <button
                    className="secondary"
                    onClick={goToPreviousCard}
                    disabled={activeCardIndex === 0}
                  >
                    Previous
                  </button>
                  <button className="secondary flashcard-modal__close-btn" onClick={closeStudyModal}>
                    Close
                  </button>
                  <button
                    className="secondary"
                    onClick={goToNextCard}
                    disabled={activeCardIndex === activeCards.length - 1}
                  >
                    Next
                  </button>
                </div>

                <div className="flashcard-meta">
                  <span>{masteryLabel(activeCard.mastery_level || 0)}</span>
                  <span>{Math.round((activeCard.mastery_level || 0) * 100)}% mastery</span>
                  <span>{activeCard.review_count || 0} reviews</span>
                </div>

                <div className="flashcard-review">
                  <button
                    className="secondary"
                    disabled={pendingReview === activeCard.id}
                    onClick={() => handleReview(activeCard.id, false)}
                  >
                    Needs review
                  </button>
                  <button
                    className="primary"
                    disabled={pendingReview === activeCard.id}
                    onClick={() => handleReview(activeCard.id, true)}
                  >
                    I knew this
                  </button>
                </div>

                <div className="flashcard-verify">
                  <label className="sr-only" htmlFor={activeAnswerInputId}>
                    Your answer for {activeCategory} flashcard {activeProgressValue}
                  </label>
                  <textarea
                    id={activeAnswerInputId}
                    placeholder="Type your answer to verify with AI"
                    value={answerInputs[activeCard.id] || ''}
                    onChange={(e) =>
                      setAnswerInputs((prev) => ({ ...prev, [activeCard.id]: e.target.value }))
                    }
                  />
                  <button
                    className="secondary"
                    onClick={() => handleVerify(activeCard.id)}
                    disabled={verifyingCardId === activeCard.id}
                    aria-busy={verifyingCardId === activeCard.id}
                  >
                    {verifyingCardId === activeCard.id ? 'Checking…' : 'Verify answer'}
                  </button>
                </div>

                <div aria-live="polite">{renderVerification(activeCard.id)}</div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div
              className="flashcard-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm delete flashcard"
              onClick={(e) => {
                if (e.target === e.currentTarget) cancelDelete()
              }}
            >
              <div className="flashcard-modal__panel" style={{ maxWidth: '500px' }}>
                <div className="flashcard-modal__header">
                  <h2 style={{ margin: 0, color: 'var(--text-color)' }}>Delete Flashcard?</h2>
                  <button className="flashcard-modal__close" onClick={cancelDelete}>
                    ✕
                  </button>
                </div>
                <div className="flashcard-modal__body">
                  <p style={{ 
                    color: 'var(--text-light)', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    Are you sure you want to delete this flashcard? This action cannot be undone.
                  </p>
                  {activeCard?.front && (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.5rem',
                      border: '1px solid rgba(255, 138, 60, 0.2)'
                    }}>
                      <p style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Question:
                      </p>
                      <p style={{ 
                        color: 'var(--text-light)', 
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                      }}>
                        {activeCard.front.substring(0, 150)}{activeCard.front.length > 150 ? '...' : ''}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flashcard-modal__nav" style={{ 
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  padding: '1rem 2rem'
                }}>
                  <button className="secondary" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button 
                    className="ghost-button danger" 
                    onClick={deleteFlashcard}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.15)',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5'
                    }}
                  >
                    Delete Flashcard
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Flashcards


