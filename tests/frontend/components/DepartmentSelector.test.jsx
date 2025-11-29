import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DepartmentSelector from '../../../frontend/src/features/dashboard/components/DepartmentSelector'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'

// Mock useAuth
const mockUseAuth = {
  user: { role: 'student' },
  loading: false,
}

vi.mock('../../../frontend/src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../../frontend/src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => mockUseAuth,
  }
})

const departments = [
  { value: 'General Studies', label: 'General Studies' },
  { value: 'Engineering', label: 'Engineering & Computer Science' },
]

describe('DepartmentSelector', () => {
  it('renders department selector for teachers', () => {
    mockUseAuth.user = { role: 'teacher' }
    const handleChange = vi.fn()

    render(
      <AuthProvider>
        <DepartmentSelector
          currentDepartment="General Studies"
          departments={departments}
          onDepartmentChange={handleChange}
          userRole="teacher"
        />
      </AuthProvider>
    )

    expect(screen.getByText(/Department/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('General Studies')).toBeInTheDocument()
  })

  it('shows readonly view for students', () => {
    mockUseAuth.user = { role: 'student' }
    const handleChange = vi.fn()

    render(
      <AuthProvider>
        <DepartmentSelector
          currentDepartment="General Studies"
          departments={departments}
          onDepartmentChange={handleChange}
          userRole="student"
        />
      </AuthProvider>
    )

    expect(screen.getByText(/Your department was set/i)).toBeInTheDocument()
    expect(screen.getByText('General Studies')).toBeInTheDocument()
  })

  it('calls onDepartmentChange when teacher selects department', async () => {
    mockUseAuth.user = { role: 'teacher' }
    const handleChange = vi.fn()

    render(
      <AuthProvider>
        <DepartmentSelector
          currentDepartment="General Studies"
          departments={departments}
          onDepartmentChange={handleChange}
          userRole="teacher"
        />
      </AuthProvider>
    )

    const select = screen.getByLabelText(/Choose department/i)
    await userEvent.selectOptions(select, 'Engineering')

    expect(handleChange).toHaveBeenCalledWith('Engineering')
  })
})

