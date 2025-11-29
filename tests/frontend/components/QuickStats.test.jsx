import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuickStats from '../../../frontend/src/components/QuickStats'

describe('QuickStats', () => {
  it('renders stats correctly', () => {
    const stats = {
      submissions: 5,
      feedbacks: 10,
      peerReviews: 3,
    }

    render(<QuickStats stats={stats} />)
    
    expect(screen.getByText(/5/)).toBeInTheDocument()
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('handles zero stats', () => {
    const stats = {
      submissions: 0,
      feedbacks: 0,
      peerReviews: 0,
    }

    render(<QuickStats stats={stats} />)
    
    expect(screen.getByText(/0/)).toBeInTheDocument()
  })

  it('displays correct labels', () => {
    const stats = {
      submissions: 5,
      feedbacks: 10,
      peerReviews: 3,
    }

    render(<QuickStats stats={stats} />)
    
    expect(screen.getByText(/Submissions/i)).toBeInTheDocument()
    expect(screen.getByText(/Feedback/i)).toBeInTheDocument()
    expect(screen.getByText(/Peer Reviews/i)).toBeInTheDocument()
  })
})

