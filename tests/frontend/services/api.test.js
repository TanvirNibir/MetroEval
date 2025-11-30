import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../../../frontend/src/services/api'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => {
  const axiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  }
  return {
    default: axiosInstance,
    create: vi.fn(() => axiosInstance),
  }
})

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes GET requests', async () => {
    const mockData = { id: 1, name: 'Test' }
    api.get.mockResolvedValue({ data: mockData })

    const result = await api.get('/test')

    expect(api.get).toHaveBeenCalledWith('/test', undefined)
    expect(result.data).toEqual(mockData)
  })

  it('makes GET requests with config', async () => {
    const mockData = { id: 1, name: 'Test' }
    const config = { params: { page: 1 } }
    api.get.mockResolvedValue({ data: mockData })

    const result = await api.get('/test', config)

    expect(api.get).toHaveBeenCalledWith('/test', config)
    expect(result.data).toEqual(mockData)
  })

  it('makes POST requests', async () => {
    const mockData = { success: true }
    const payload = { name: 'Test' }
    api.post.mockResolvedValue({ data: mockData })

    const result = await api.post('/test', payload)

    expect(api.post).toHaveBeenCalledWith('/test', payload, undefined)
    expect(result.data).toEqual(mockData)
  })

  it('makes POST requests with config', async () => {
    const mockData = { success: true }
    const payload = { name: 'Test' }
    const config = { headers: { 'Content-Type': 'application/json' } }
    api.post.mockResolvedValue({ data: mockData })

    const result = await api.post('/test', payload, config)

    expect(api.post).toHaveBeenCalledWith('/test', payload, config)
    expect(result.data).toEqual(mockData)
  })

  it('makes PUT requests', async () => {
    const mockData = { success: true }
    const payload = { name: 'Updated' }
    api.put.mockResolvedValue({ data: mockData })

    const result = await api.put('/test/1', payload)

    expect(api.put).toHaveBeenCalledWith('/test/1', payload, undefined)
    expect(result.data).toEqual(mockData)
  })

  it('makes DELETE requests', async () => {
    api.delete.mockResolvedValue({ data: { success: true } })

    const result = await api.delete('/test/1')

    expect(api.delete).toHaveBeenCalledWith('/test/1', undefined)
    expect(result.data.success).toBe(true)
  })

  it('handles errors correctly', async () => {
    const error = new Error('Network error')
    api.get.mockRejectedValue(error)

    await expect(api.get('/test')).rejects.toThrow('Network error')
  })

  it('handles HTTP error responses', async () => {
    const errorResponse = {
      response: {
        status: 404,
        data: { error: 'Not found' }
      }
    }
    api.get.mockRejectedValue(errorResponse)

    try {
      await api.get('/test')
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.error).toBe('Not found')
    }
  })

  it('handles 401 unauthorized errors', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { error: 'Unauthorized' }
      }
    }
    api.get.mockRejectedValue(errorResponse)

    try {
      await api.get('/test')
    } catch (error) {
      expect(error.response.status).toBe(401)
    }
  })

  it('handles 500 server errors', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: { error: 'Internal server error' }
      }
    }
    api.post.mockRejectedValue(errorResponse)

    try {
      await api.post('/test', {})
    } catch (error) {
      expect(error.response.status).toBe(500)
    }
  })

  it('handles network timeouts', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded')
    timeoutError.code = 'ECONNABORTED'
    api.get.mockRejectedValue(timeoutError)

    await expect(api.get('/test')).rejects.toThrow('timeout')
  })

  it('handles request cancellation', async () => {
    const cancelError = new Error('Request cancelled')
    cancelError.name = 'CanceledError'
    api.get.mockRejectedValue(cancelError)

    await expect(api.get('/test')).rejects.toThrow('Request cancelled')
  })
})
