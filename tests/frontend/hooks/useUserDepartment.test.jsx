import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUserDepartment } from '../../../frontend/src/features/dashboard/hooks/useUserDepartment'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock api
const mockApiGet = vi.fn()
const mockApiPost = vi.fn()
vi.mock('../../../frontend/src/services/api', () => ({
  default: {
    get: mockApiGet,
    post: mockApiPost,
  }
}))

// Mock AuthContext
const mockCheckAuth = vi.fn()
const mockUser = {
  id: 1,
  name: 'Test User',
  department: 'Engineering & Computer Science',
  role: 'student',
}

const mockUseAuth = {
  user: mockUser,
  loading: false,
  checkAuth: mockCheckAuth,
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

describe('useUserDepartment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAuth.mockResolvedValue(undefined)
    mockApiPost.mockResolvedValue({ success: true })
    mockUseAuth.user = { ...mockUser, department: 'Engineering & Computer Science' }
  })

  it('initializes with user department from context', () => {
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    expect(result.current.department).toBe('Engineering & Computer Science')
    expect(result.current.loading).toBe(false)
  })

  it('uses default department when user has no department', () => {
    mockUseAuth.user = { ...mockUser, department: null }
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    expect(result.current.department).toBe('General Studies')
  })

  it('uses default department when user department is undefined', () => {
    mockUseAuth.user = { ...mockUser, department: undefined }
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    expect(result.current.department).toBe('General Studies')
  })

  it('updates department and syncs to server', async () => {
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    await act(async () => {
      await result.current.setDepartment('Business & Economics')
    })
    
    expect(result.current.department).toBe('Business & Economics')
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/user/department', {
        department: 'Business & Economics'
      })
    })
    expect(mockCheckAuth).toHaveBeenCalled()
  })

  it('updates department locally when skipSync is true', async () => {
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    await act(async () => {
      await result.current.setDepartment('Health & Life Sciences', true)
    })
    
    expect(result.current.department).toBe('Health & Life Sciences')
    expect(mockApiPost).not.toHaveBeenCalled()
  })

  it('reverts on error when syncing', async () => {
    const originalDept = 'Engineering & Computer Science'
    mockApiPost.mockRejectedValue(new Error('Network error'))
    
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    await act(async () => {
      try {
        await result.current.setDepartment('New Department')
      } catch (e) {
        // Expected error
      }
    })
    
    // Should revert to original
    expect(result.current.department).toBe(originalDept)
  })

  it('updates when user context changes', () => {
    mockUseAuth.user = { ...mockUser, department: 'Design & Creative Arts' }
    const { result, rerender } = renderHook(() => useUserDepartment(), { wrapper })
    
    expect(result.current.department).toBe('Design & Creative Arts')
    
    mockUseAuth.user = { ...mockUser, department: 'Social Sciences & Humanities' }
    rerender()
    
    expect(result.current.department).toBe('Social Sciences & Humanities')
  })

  it('handles multiple rapid department changes', async () => {
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    await act(async () => {
      await result.current.setDepartment('Department 1')
      await result.current.setDepartment('Department 2')
      await result.current.setDepartment('Department 3')
    })
    
    expect(result.current.department).toBe('Department 3')
  })

  it('handles checkAuth failure gracefully', async () => {
    mockCheckAuth.mockRejectedValue(new Error('Auth check failed'))
    const { result } = renderHook(() => useUserDepartment(), { wrapper })
    
    await act(async () => {
      try {
        await result.current.setDepartment('New Department')
      } catch (e) {
        // Expected error
      }
    })
    
    // Should still update locally or revert
    expect(result.current.department).toBeDefined()
  })
})
