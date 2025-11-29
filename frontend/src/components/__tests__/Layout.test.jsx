import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'
import { AuthProvider } from '../../context/AuthContext'
import { NotificationProvider } from '../../context/NotificationContext'

// Mock useAuth
const mockUseAuth = {
  logout: vi.fn(),
  user: { name: 'Test User', role: 'student' },
  loading: false,
}

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext')
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

vi.mock('../../context/NotificationContext', async () => {
  const actual = await vi.importActual('../../context/NotificationContext')
  return {
    ...actual,
    useNotifications: () => mockNotificationContext,
  }
})

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
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
  })

  it('renders navigation with MetroEval brand', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getAllByText('MetroEval')[0]).toBeInTheDocument()
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
})

