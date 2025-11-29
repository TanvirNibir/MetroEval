/**
 * Test Utilities
 * Reusable utilities for testing React components
 */

import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { NotificationProvider } from '../context/NotificationContext'

/**
 * Render component with all required providers
 * Use this for testing components that need context providers
 */
export const renderWithProviders = (ui, options = {}) => {
  const { route = '/', ...renderOptions } = options

  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Mock user for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@metropolia.fi',
  role: 'student',
  department: 'General Studies',
  ...overrides,
})

/**
 * Mock notification context
 */
export const mockNotificationContext = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: 'idle',
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}

export * from '@testing-library/react'

