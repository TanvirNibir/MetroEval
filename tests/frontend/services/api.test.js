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
  })

  it('makes POST requests', async () => {
    const mockData = { success: true }
    const payload = { name: 'Test' }
    api.post.mockResolvedValue({ data: mockData })

    const result = await api.post('/test', payload)

    expect(api.post).toHaveBeenCalledWith('/test', payload, undefined)
  })

  it('makes PUT requests', async () => {
    const mockData = { success: true }
    const payload = { name: 'Updated' }
    api.put.mockResolvedValue({ data: mockData })

    const result = await api.put('/test/1', payload)

    expect(api.put).toHaveBeenCalledWith('/test/1', payload, undefined)
  })

  it('makes DELETE requests', async () => {
    api.delete.mockResolvedValue({ data: { success: true } })

    const result = await api.delete('/test/1')

    expect(api.delete).toHaveBeenCalledWith('/test/1', undefined)
  })

  it('handles errors correctly', async () => {
    const error = new Error('Network error')
    api.get.mockRejectedValue(error)

    await expect(api.get('/test')).rejects.toThrow('Network error')
  })
})

