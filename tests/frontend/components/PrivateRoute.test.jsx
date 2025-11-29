import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivateRoute from '../../../frontend/src/components/PrivateRoute'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'

// Mock useAuth
const mockUseAuth = {
  user: null,
  loading: false,
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  checkAuth: vi.fn(),
}

vi.mock('../../../frontend/src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../../frontend/src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => mockUseAuth,
  }
})

const renderWithRouter = (ui, initialEntries = ['/dashboard']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.user = null
    mockUseAuth.loading = false
  })

  it('shows loading when auth is loading', () => {
    mockUseAuth.loading = true
    
    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.user = null
    mockUseAuth.loading = false
    
    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )
    
    // Should redirect, so protected content won't be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'Test User',
      email: 'test@metropolia.fi',
      role: 'student',
    }
    mockUseAuth.loading = false
    
    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children for authenticated teacher', () => {
    mockUseAuth.user = {
      id: 2,
      name: 'Teacher User',
      email: 'teacher@metropolia.fi',
      role: 'teacher',
    }
    mockUseAuth.loading = false
    
    renderWithRouter(
      <PrivateRoute>
        <div>Teacher Dashboard</div>
      </PrivateRoute>
    )
    
    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument()
  })

  it('renders children with required role when role matches', () => {
    mockUseAuth.user = {
      id: 2,
      name: 'Teacher User',
      email: 'teacher@metropolia.fi',
      role: 'teacher',
    }
    mockUseAuth.loading = false
    
    renderWithRouter(
      <PrivateRoute requiredRole="teacher">
        <div>Teacher Only Content</div>
      </PrivateRoute>
    )
    
    expect(screen.getByText('Teacher Only Content')).toBeInTheDocument()
  })
})

