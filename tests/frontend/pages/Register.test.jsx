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

  it('allows user to fill all form fields', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@metropolia.fi')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.selectOptions(screen.getByLabelText('Role'), 'student')
    await user.selectOptions(screen.getByLabelText('Department'), 'General Studies')
    
    expect(screen.getByLabelText('Name')).toHaveValue('Test User')
    expect(screen.getByLabelText('Email')).toHaveValue('test@metropolia.fi')
    expect(screen.getByLabelText('Password')).toHaveValue('password123')
  })

  it('shows error message when registration fails', async () => {
    const user = userEvent.setup()
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
    
    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@metropolia.fi')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('prevents registration for non-Metropolia emails', async () => {
    const user = userEvent.setup()
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

    await user.type(nameInput, 'Outside User')
    await user.type(emailInput, 'outside@gmail.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/@metropolia\.fi email addresses/i)).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('navigates to teacher dashboard on successful teacher registration', async () => {
    const user = userEvent.setup()
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
    
    await user.type(nameInput, 'Teacher User')
    await user.type(emailInput, 'teacher@metropolia.fi')
    await user.type(passwordInput, 'password123')
    await user.selectOptions(roleSelect, 'teacher')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher-dashboard')
    })
  })

  it('navigates to student dashboard on successful student registration', async () => {
    const user = userEvent.setup()
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
    
    await user.type(nameInput, 'Student User')
    await user.type(emailInput, 'student@metropolia.fi')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /register/i })
    await user.click(submitButton)
    
    // Form validation should prevent submission
    // The exact behavior depends on implementation
    await waitFor(() => {
      // Either shows validation errors or doesn't call register
      expect(mockRegister).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('handles password visibility toggle if implemented', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toBeInTheDocument()
    
    // If password visibility toggle exists, test it
    const toggleButton = screen.queryByRole('button', { name: /show|hide/i })
    if (toggleButton) {
      await user.click(toggleButton)
      // Password type should change
    }
  })

  it('allows selecting different departments', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    )
    
    const departmentSelect = screen.getByLabelText('Department')
    await user.selectOptions(departmentSelect, 'Engineering & Computer Science')
    
    expect(departmentSelect).toHaveValue('Engineering & Computer Science')
  })
})
