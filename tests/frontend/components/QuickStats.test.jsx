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

  it('handles large numbers', () => {
    const stats = {
      submissions: 999,
      feedbacks: 1000,
      peerReviews: 500,
    }

    render(<QuickStats stats={stats} />)
    
    expect(screen.getByText(/999/)).toBeInTheDocument()
    expect(screen.getByText(/1000/)).toBeInTheDocument()
    expect(screen.getByText(/500/)).toBeInTheDocument()
  })

  it('handles missing stats gracefully', () => {
    const stats = {
      submissions: 5,
      // feedbacks and peerReviews missing
    }

    render(<QuickStats stats={stats} />)
    
    // Should still render without crashing
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('handles null stats', () => {
    render(<QuickStats stats={null} />)
    
    // Should render without crashing
    expect(screen.getByText(/Submissions/i)).toBeInTheDocument()
  })
})
