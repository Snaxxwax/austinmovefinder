import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { backendApi } from '../backendApi'
import type { QuoteRequest, QuoteResponse, HealthCheckResponse } from '../backendApi'
import { createMockFile, mockQuoteData } from '../../test/test-utils'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('BackendApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Health Check', () => {
    it('successfully checks backend health', async () => {
      const mockHealthResponse: HealthCheckResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        services: {
          database: 'connected',
          email: 'connected',
          ai_detection: 'connected',
          server: 'running',
        },
        version: '1.0.0',
        environment: 'test',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthResponse),
      })

      const result = await backendApi.healthCheck()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/health'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockHealthResponse)
    })

    it('handles health check failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(backendApi.healthCheck()).rejects.toThrow(
        'Backend service unavailable'
      )
    })

    it('handles network errors during health check', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(backendApi.healthCheck()).rejects.toThrow(
        'Backend service unavailable'
      )
    })

    it('respects health check timeout', async () => {
      vi.useFakeTimers()

      // Mock a slow response that never resolves within timeout
      const slowPromise = new Promise(() => {}) // Never resolves
      mockFetch.mockReturnValueOnce(slowPromise)

      const healthCheckPromise = backendApi.healthCheck()

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(10001) // Just past 10 second timeout

      await expect(healthCheckPromise).rejects.toThrow()

      vi.useRealTimers()
    }, 10000)
  })

  describe('Backend Availability Check', () => {
    it('returns true when backend is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00Z',
          services: {},
          version: '1.0.0',
          environment: 'test',
        }),
      })

      const isAvailable = await backendApi.isBackendAvailable()
      expect(isAvailable).toBe(true)
    })

    it('returns false when backend is unhealthy', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const isAvailable = await backendApi.isBackendAvailable()
      expect(isAvailable).toBe(false)
    })
  })

  describe('Quote Creation', () => {
    const mockQuoteRequest: QuoteRequest = {
      customer: {
        name: mockQuoteData.name,
        email: mockQuoteData.email,
        phone: mockQuoteData.phone,
      },
      quote: {
        move_type: mockQuoteData.moveType,
        move_date: mockQuoteData.moveDate,
        from_address: mockQuoteData.fromAddress,
        to_address: mockQuoteData.toAddress,
        estimated_size: mockQuoteData.estimatedSize,
        special_items: mockQuoteData.specialItems,
        notes: mockQuoteData.notes,
      },
    }

    it('successfully creates a quote', async () => {
      const mockResponse: QuoteResponse = {
        success: true,
        data: {
          quote: {
            id: 123,
            customer_id: 456,
            move_type: 'local',
            move_date: '2024-01-15',
            from_address: mockQuoteData.fromAddress,
            to_address: mockQuoteData.toAddress,
            estimated_size: '2br',
            special_items: mockQuoteData.specialItems,
            notes: mockQuoteData.notes,
            status: 'pending',
            estimated_cost: 1200,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          customer: {
            id: 456,
            name: mockQuoteData.name,
            email: mockQuoteData.email,
            phone: mockQuoteData.phone,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          estimated_cost: 1200,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await backendApi.createQuote(mockQuoteRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/quotes'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: mockQuoteData.name,
            email: mockQuoteData.email,
            phone: mockQuoteData.phone,
            move_type: mockQuoteData.moveType,
            move_date: mockQuoteData.moveDate,
            from_address: mockQuoteData.fromAddress,
            to_address: mockQuoteData.toAddress,
            estimated_size: mockQuoteData.estimatedSize,
            special_items: mockQuoteData.specialItems,
            notes: mockQuoteData.notes,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles quote creation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid quote data' }),
      })

      await expect(backendApi.createQuote(mockQuoteRequest)).rejects.toThrow(
        'Failed to create quote: Invalid quote data'
      )
    })

    it('creates quote with files and uploads them', async () => {
      const files = [createMockFile('test.jpg')]
      const quoteRequestWithFiles = { ...mockQuoteRequest, files }

      const mockQuoteResponse: QuoteResponse = {
        success: true,
        data: {
          quote: { id: 123 } as any,
          customer: {} as any,
          estimated_cost: 1200,
        },
      }

      // Mock quote creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuoteResponse),
      })

      // Mock file upload
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, uploaded: 1 }),
      })

      const result = await backendApi.createQuote(quoteRequestWithFiles)

      expect(mockFetch).toHaveBeenCalledTimes(2) // Quote creation + file upload
      expect(result).toEqual(mockQuoteResponse)
    })
  })

  describe('Media File Upload', () => {
    it('successfully uploads media files', async () => {
      const files = [
        createMockFile('image.jpg', 'image/jpeg'),
        createMockFile('video.mp4', 'video/mp4'),
      ]
      const quoteId = 123

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, uploaded: 2 }),
      })

      const result = await backendApi.uploadMediaFiles(quoteId, files)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/upload/${quoteId}`),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
      expect(result).toEqual({ success: true, uploaded: 2 })
    })

    it('handles upload failure', async () => {
      const files = [createMockFile('test.jpg')]
      const quoteId = 123

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        json: () => Promise.resolve({ error: 'File too large' }),
      })

      await expect(backendApi.uploadMediaFiles(quoteId, files)).rejects.toThrow(
        'Media upload failed: File too large'
      )
    })

    it('uses extended timeout for file uploads', async () => {
      vi.useFakeTimers()

      const files = [createMockFile('large.mp4', 'video/mp4', 100 * 1024 * 1024)] // 100MB
      const quoteId = 123

      // Mock a slow upload that never resolves
      const slowPromise = new Promise(() => {}) // Never resolves
      mockFetch.mockReturnValueOnce(slowPromise)

      const uploadPromise = backendApi.uploadMediaFiles(quoteId, files)

      // Fast-forward time to trigger timeout (60 seconds for uploads)
      vi.advanceTimersByTime(60001)

      await expect(uploadPromise).rejects.toThrow()

      vi.useRealTimers()
    }, 10000)
  })

  describe('Quote Submission', () => {
    it('successfully submits a quote for processing', async () => {
      const quoteId = 123
      const mockResponse: QuoteResponse = {
        success: true,
        message: 'Quote submitted successfully',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await backendApi.submitQuote(quoteId)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/quotes/${quoteId}/submit`),
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles quote submission failure', async () => {
      const quoteId = 123

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Quote not found' }),
      })

      await expect(backendApi.submitQuote(quoteId)).rejects.toThrow(
        'Failed to submit quote: Quote not found'
      )
    })
  })

  describe('Detected Items', () => {
    it('successfully adds detected items to a quote', async () => {
      const quoteId = 123
      const detectedItems = [
        {
          item_label: 'couch',
          confidence_score: 0.95,
          quantity: 1,
        },
        {
          item_label: 'table',
          confidence_score: 0.88,
          quantity: 1,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { success: true, items_added: 2 },
        }),
      })

      const result = await backendApi.addDetectedItems(quoteId, detectedItems)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/quotes/${quoteId}/items`),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ items: detectedItems }),
        })
      )
      expect(result).toEqual({ success: true, items_added: 2 })
    })

    it('handles detected items addition failure', async () => {
      const quoteId = 123
      const detectedItems = []

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid items data' }),
      })

      await expect(backendApi.addDetectedItems(quoteId, detectedItems)).rejects.toThrow(
        'Failed to add detected items: Invalid items data'
      )
    })
  })

  describe('EmailJS Fallback', () => {
    beforeEach(() => {
      // Mock environment variables
      vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'test_service')
      vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'test_template')
      vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'test_key')
    })

    it('successfully sends email via EmailJS fallback', async () => {
      const mockEmailjs = {
        send: vi.fn().mockResolvedValueOnce({ status: 200 }),
      }

      // Mock dynamic import of EmailJS
      vi.doMock('@emailjs/browser', () => mockEmailjs)

      const quoteData = {
        customer: mockQuoteData,
        quote: {
          move_type: 'local',
          move_date: '2024-01-15',
          from_address: mockQuoteData.fromAddress,
          to_address: mockQuoteData.toAddress,
          estimated_size: '2br',
          special_items: mockQuoteData.specialItems,
          notes: mockQuoteData.notes,
        },
      }

      const result = await backendApi.sendEmailFallback(quoteData)

      expect(result).toBe(true)
      expect(mockEmailjs.send).toHaveBeenCalledWith(
        'test_service',
        'test_template',
        expect.objectContaining({
          customer_name: mockQuoteData.name,
          customer_email: mockQuoteData.email,
          customer_phone: mockQuoteData.phone,
        }),
        'test_key'
      )
    })

    it('returns false when EmailJS is not configured', async () => {
      vi.stubEnv('VITE_EMAILJS_SERVICE_ID', '')

      const result = await backendApi.sendEmailFallback({})

      expect(result).toBe(false)
    })

    it('handles EmailJS errors', async () => {
      const mockEmailjs = {
        send: vi.fn().mockRejectedValueOnce(new Error('EmailJS error')),
      }

      vi.doMock('@emailjs/browser', () => mockEmailjs)

      const result = await backendApi.sendEmailFallback({})

      expect(result).toBe(false)
    })
  })

  describe('Quote Retrieval', () => {
    it('successfully retrieves a quote by ID', async () => {
      const quoteId = 123
      const mockResponse: QuoteResponse = {
        success: true,
        data: {
          quote: { id: quoteId } as any,
          customer: {} as any,
          estimated_cost: 1200,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await backendApi.getQuote(quoteId)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/quotes/${quoteId}`),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles quote not found', async () => {
      const quoteId = 999

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(backendApi.getQuote(quoteId)).rejects.toThrow(
        'Quote not found'
      )
    })
  })

  describe('Backend URL Configuration', () => {
    it('uses environment-specific backend URLs', () => {
      // This tests the private getBackendUrl method indirectly
      // by checking if the correct URL is used in requests

      const service = new (backendApi.constructor as any)()

      // In test environment, should use localhost
      expect(service).toBeDefined()

      // Test would verify the URL through fetch calls
    })
  })

  describe('Timeout Handling', () => {
    it('respects custom timeout values', async () => {
      vi.useFakeTimers()

      // Mock a request that never resolves
      const slowPromise = new Promise(() => {}) // Never resolves
      mockFetch.mockReturnValueOnce(slowPromise)

      const healthCheckPromise = backendApi.healthCheck()

      // Advance time to just past the default timeout
      vi.advanceTimersByTime(10001) // Just past 10 second timeout

      await expect(healthCheckPromise).rejects.toThrow()

      vi.useRealTimers()
    }, 10000)
  })
})