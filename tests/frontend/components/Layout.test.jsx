import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Layout from '../../../frontend/src/components/Layout'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'
import { NotificationProvider } from '../../../frontend/src/context/NotificationContext'

// Mock useAuth
const mockLogout = vi.fn()
const mockUseAuth = {
  logout: mockLogout,
  user: { name: 'Test User', role: 'student', email: 'test@metropolia.fi' },
  loading: false,
}

vi.mock('../../../frontend/src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../../frontend/src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => mockUseAuth,
  }
})

// Mock NotificationContext
const mockNotificationContext = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: 'idle',
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}

vi.mock('../../../frontend/src/context/NotificationContext', async () => {
  const actual = await vi.importActual('../../../frontend/src/context/NotificationContext')
  return {
    ...actual,
    useNotifications: () => mockNotificationContext,
  }
})

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithProviders = (ui, initialEntries = ['/dashboard']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <NotificationProvider>
          {ui}
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockUseAuth.user = { name: 'Test User', role: 'student', email: 'test@metropolia.fi' }
  })

  it('renders navigation with MetroEval brand', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('MetroEval')).toBeInTheDocument()
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Logout/i)).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="child-content">Child Content</div>
      </Layout>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders student navigation links', () => {
    mockUseAuth.user = { name: 'Student', role: 'student', email: 'student@metropolia.fi' }
    
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Submissions/i)).toBeInTheDocument()
    expect(screen.getByText(/Feedback/i)).toBeInTheDocument()
    expect(screen.getByText(/Peer Reviews/i)).toBeInTheDocument()
    expect(screen.getByText(/Flashcards/i)).toBeInTheDocument()
    expect(screen.getByText(/Bookmarks/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Tutor/i)).toBeInTheDocument()
  })

  it('renders teacher navigation links', () => {
    mockUseAuth.user = { name: 'Teacher', role: 'teacher', email: 'teacher@metropolia.fi' }
    
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Submissions/i)).toBeInTheDocument()
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument()
    expect(screen.getByText(/Students/i)).toBeInTheDocument()
  })

  it('handles logout when logout button is clicked', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValue(undefined)
    
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const logoutButton = screen.getByText(/Logout/i)
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('displays user initials when no avatar', () => {
    mockUseAuth.user = { name: 'John Doe', role: 'student', email: 'john@metropolia.fi' }
    
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Should display initials "JD" for "John Doe"
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('displays single initial for single name', () => {
    mockUseAuth.user = { name: 'John', role: 'student', email: 'john@metropolia.fi' }
    
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('toggles navbar visibility', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const toggleButton = screen.getByTitle(/Hide Navigation/i)
    await user.click(toggleButton)
    
    // Navbar should be hidden
    await waitFor(() => {
      expect(screen.getByTitle(/Show Navigation/i)).toBeInTheDocument()
    })
  })
})
