import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useLogin } from '../../../frontend/src/features/auth/hooks/useLogin'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock AuthContext
const mockLogin = vi.fn()
const mockUseAuth = {
  login: mockLogin,
  user: null,
  loading: false,
  logout: vi.fn(),
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

const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockResolvedValue({ success: true, role: 'student' })
  })

  it('initializes with empty form data', () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })

  it('handles form input changes', () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@metropolia.fi' }
      })
    })
    
    expect(result.current.formData.email).toBe('test@metropolia.fi')
  })

  it('validates Metropolia email addresses', () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    expect(result.current.isMetropoliaEmail('test@metropolia.fi')).toBe(true)
    expect(result.current.isMetropoliaEmail('test@gmail.com')).toBe(false)
    expect(result.current.isMetropoliaEmail('test@METROPOLIA.FI')).toBe(true)
  })

  it('shows error for non-Metropolia emails on submit', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@gmail.com' }
      })
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      })
    })
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn()
      })
    })
    
    expect(result.current.error).toContain('@metropolia.fi')
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login function on valid submit', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@metropolia.fi' }
      })
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      })
    })
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn()
      })
    })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@metropolia.fi', 'password123')
    })
  })

  it('navigates to teacher dashboard for teachers', async () => {
    mockLogin.mockResolvedValue({ success: true, role: 'teacher' })
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'teacher@metropolia.fi' }
      })
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      })
    })
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn()
      })
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher-dashboard')
    })
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@metropolia.fi' }
      })
      result.current.handleChange({
        target: { name: 'password', value: 'wrongpassword' }
      })
    })
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn()
      })
    })
    
    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials')
    })
  })

  it('resets form correctly', () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@metropolia.fi' }
      })
      result.current.resetForm()
    })
    
    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })
})

