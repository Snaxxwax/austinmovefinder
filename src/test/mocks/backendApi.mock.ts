import { vi } from 'vitest'
import type { QuoteRequest, QuoteResponse, HealthCheckResponse, DetectedItem } from '../../services/backendApi'
import { mockQuoteResponse } from '../test-utils'

// Mock backend API service for testing
export const mockBackendApi = {
  healthCheck: vi.fn(),
  createQuote: vi.fn(),
  uploadMediaFiles: vi.fn(),
  getQuote: vi.fn(),
  submitQuote: vi.fn(),
  addDetectedItems: vi.fn(),
  isBackendAvailable: vi.fn(),
  sendEmailFallback: vi.fn(),
}

// Default mock implementations
export const setupBackendMocks = () => {
  mockBackendApi.healthCheck.mockResolvedValue({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      email: 'connected',
      ai_detection: 'connected',
      server: 'running',
    },
    version: '1.0.0',
    environment: 'test',
  })

  mockBackendApi.createQuote.mockResolvedValue(mockQuoteResponse)

  mockBackendApi.uploadMediaFiles.mockResolvedValue({
    success: true,
    uploaded: 1,
  })

  mockBackendApi.getQuote.mockResolvedValue(mockQuoteResponse)

  mockBackendApi.submitQuote.mockResolvedValue(mockQuoteResponse)

  mockBackendApi.addDetectedItems.mockResolvedValue({
    success: true,
    items_added: 4,
  })

  mockBackendApi.isBackendAvailable.mockResolvedValue(true)

  mockBackendApi.sendEmailFallback.mockResolvedValue(true)
}

// Simulate backend failures
export const setupBackendFailures = () => {
  mockBackendApi.healthCheck.mockRejectedValue(new Error('Backend service unavailable'))
  mockBackendApi.createQuote.mockRejectedValue(new Error('Failed to create quote'))
  mockBackendApi.isBackendAvailable.mockResolvedValue(false)
  mockBackendApi.sendEmailFallback.mockResolvedValue(true) // EmailJS still works
}

// Simulate network issues
export const setupNetworkFailures = () => {
  mockBackendApi.healthCheck.mockRejectedValue(new Error('Network error'))
  mockBackendApi.createQuote.mockRejectedValue(new Error('Network error'))
  mockBackendApi.isBackendAvailable.mockResolvedValue(false)
  mockBackendApi.sendEmailFallback.mockRejectedValue(new Error('EmailJS network error'))
}