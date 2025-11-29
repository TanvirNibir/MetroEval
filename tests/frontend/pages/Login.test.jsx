import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../../../frontend/src/features/auth/pages/Login'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'

// Mock useAuth
const mockLogin = vi.fn()
const mockUseAuth = {
  login: mockLogin,
  user: null,
  loading: false,
}

vi.mock('../../../frontend/src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../../frontend/src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => mockUseAuth,
  }
})

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    )
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows error message when login fails', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await userEvent.type(emailInput, 'test@metropolia.fi')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('navigates to dashboard on successful login', async () => {
    mockLogin.mockResolvedValue({ success: true, role: 'student' })
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await userEvent.type(emailInput, 'test@metropolia.fi')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows validation error for non-Metropolia emails', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    )

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    await userEvent.type(emailInput, 'user@gmail.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/@metropolia\.fi email addresses/i)).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })
})

