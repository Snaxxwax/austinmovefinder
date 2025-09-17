import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch globally
global.fetch = vi.fn()

// Mock FileReader
const MockFileReader = vi.fn(() => ({
  readAsDataURL: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
  readyState: 0,
  error: null,
  onabort: null,
  onloadend: null,
  onloadstart: null,
  onprogress: null,
  abort: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  readAsBinaryString: vi.fn(),
  readAsText: vi.fn(),
  dispatchEvent: vi.fn(),
}))

MockFileReader.EMPTY = 0
MockFileReader.LOADING = 1
MockFileReader.DONE = 2

Object.defineProperty(MockFileReader, 'prototype', {
  value: MockFileReader.prototype,
})

global.FileReader = MockFileReader as any

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock HTMLMediaElement play method
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
})

// Mock HTMLMediaElement pause method
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
})

// Mock HTMLMediaElement load method
Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
})

// Suppress console warnings during tests (optional)
// vi.spyOn(console, 'warn').mockImplementation(() => {})