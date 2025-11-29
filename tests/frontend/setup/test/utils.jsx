import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

// Custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock API
export const mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

