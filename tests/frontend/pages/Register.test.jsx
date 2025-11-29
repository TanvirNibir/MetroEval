import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Register from '../../../frontend/src/features/auth/pages/Register'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'

// Mock useAuth
const mockRegister = vi.fn()
const mockUseAuth = {
  register: mockRegister,
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

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders registration form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    expect(screen.getByLabelText('Department')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows error message when registration fails', async () => {
    mockRegister.mockResolvedValue({ success: false, error: 'Email already registered' })
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    await userEvent.type(nameInput, 'Test User')
    await userEvent.type(emailInput, 'test@metropolia.fi')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('prevents registration for non-Metropolia emails', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /register/i })

    await userEvent.type(nameInput, 'Outside User')
    await userEvent.type(emailInput, 'outside@gmail.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/@metropolia\.fi email addresses/i)).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('navigates to teacher dashboard on successful teacher registration', async () => {
    mockRegister.mockResolvedValue({ success: true, role: 'teacher' })
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const roleSelect = screen.getByLabelText('Role')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    await userEvent.type(nameInput, 'Teacher User')
    await userEvent.type(emailInput, 'teacher@metropolia.fi')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.selectOptions(roleSelect, 'teacher')
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher-dashboard')
    })
  })

  it('navigates to student dashboard on successful student registration', async () => {
    mockRegister.mockResolvedValue({ success: true, role: 'student' })
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    await userEvent.type(nameInput, 'Student User')
    await userEvent.type(emailInput, 'student@metropolia.fi')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})

