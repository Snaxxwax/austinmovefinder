import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        {children}
      </HelmetProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data utilities
export const createMockFile = (
  name: string = 'test.jpg',
  type: string = 'image/jpeg',
  size: number = 1024 * 1024 // 1MB
): File => {
  const file = new File(['mock file content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

export const createMockVideoFile = (
  name: string = 'test.mp4',
  size: number = 5 * 1024 * 1024 // 5MB
): File => {
  return createMockFile(name, 'video/mp4', size)
}

// Mock detected objects for AI testing
export const mockDetectedObjects = [
  { label: 'couch', score: 0.95, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
  { label: 'dining table', score: 0.88, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
  { label: 'chair', score: 0.92, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
  { label: 'tv', score: 0.85, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
]

// Mock quote data
export const mockQuoteData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(512) 555-1234',
  moveType: 'local' as const,
  moveDate: '2024-01-15',
  fromAddress: '123 Main St, Austin, TX 78701',
  toAddress: '456 Oak Ave, Austin, TX 78704',
  estimatedSize: '2br' as const,
  specialItems: 'Piano, artwork',
  notes: 'Third floor apartment, no elevator',
}

// Mock backend responses
export const mockQuoteResponse = {
  success: true,
  data: {
    quote: {
      id: 123,
      customer_id: 456,
      move_type: 'local' as const,
      move_date: '2024-01-15',
      from_address: '123 Main St, Austin, TX 78701',
      to_address: '456 Oak Ave, Austin, TX 78704',
      estimated_size: '2br' as const,
      special_items: 'Piano, artwork',
      notes: 'Third floor apartment, no elevator',
      status: 'pending' as const,
      estimated_cost: 1200,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    customer: {
      id: 456,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(512) 555-1234',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    estimated_cost: 1200,
  },
}

// Austin-specific test data
export const austinTestAddresses = [
  '123 Congress Ave, Austin, TX 78701', // Downtown
  '456 South Lamar Blvd, Austin, TX 78704', // South Austin
  '789 Rainey St, Austin, TX 78701', // Rainey District
  '321 East 6th St, Austin, TX 78701', // East 6th
  '654 Barton Springs Rd, Austin, TX 78704', // Zilker area
]

export const austinNeighborhoodNames = [
  'Downtown Austin',
  'South Austin (SoCo)',
  'East Austin',
  'West Lake Hills',
  'North Austin',
  'Cedar Park',
  'Mueller',
  'The Domain',
]

// Wait utilities for async operations
export const waitForFileAnalysis = () => new Promise(resolve => setTimeout(resolve, 100))
export const waitForFormSubmission = () => new Promise(resolve => setTimeout(resolve, 200))