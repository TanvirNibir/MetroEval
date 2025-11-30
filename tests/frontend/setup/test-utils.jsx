import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'
import { NotificationProvider } from '../../../frontend/src/context/NotificationContext'

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(
  ui,
  {
    initialEntries = ['/'],
    authValue = null,
    notificationValue = null,
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider value={authValue}>
          <NotificationProvider value={notificationValue}>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Create a mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: '1',
    email: 'test@metropolia.fi',
    name: 'Test User',
    role: 'student',
    department: 'General Studies',
    ...overrides,
  }
}

/**
 * Create a mock teacher user object
 */
export function createMockTeacher(overrides = {}) {
  return {
    id: '2',
    email: 'teacher@metropolia.fi',
    name: 'Test Teacher',
    role: 'teacher',
    department: 'Engineering & Computer Science',
    ...overrides,
  }
}

/**
 * Create mock auth context value
 */
export function createMockAuth(overrides = {}) {
  return {
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
    ...overrides,
  }
}

/**
 * Create mock notification context value
 */
export function createMockNotifications(overrides = {}) {
  return {
    notifications: [],
    unreadCount: 0,
    connectionStatus: 'idle',
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    ...overrides,
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

