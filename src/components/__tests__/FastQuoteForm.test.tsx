import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockQuoteData, createMockFile, waitForFormSubmission } from '../../test/test-utils'
import { FastQuoteForm } from '../FastQuoteForm'
import { mockBackendApi, setupBackendMocks, setupBackendFailures, setupNetworkFailures } from '../../test/mocks/backendApi.mock'
import { setupObjectDetectionMocks } from '../../test/mocks/objectDetection.mock'

// Mock the backend API service
vi.mock('../../services/backendApi', () => ({
  backendApi: mockBackendApi,
  QuoteRequest: {},
  QuoteResponse: {},
}))

// Mock object detection service
vi.mock('../../services/objectDetection', () => ({
  ObjectDetectionService: vi.fn().mockImplementation(() => ({
    detectObjects: vi.fn().mockResolvedValue([]),
    detectObjectsFromVideo: vi.fn().mockResolvedValue([]),
  })),
  DetectedObject: {},
}))

describe('FastQuoteForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    setupBackendMocks()
    setupObjectDetectionMocks()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Form Rendering', () => {
    it('renders all required form fields', () => {
      render(<FastQuoteForm />)

      // Contact fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()

      // Move details
      expect(screen.getByLabelText(/preferred move date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/move type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estimated size/i)).toBeInTheDocument()

      // Addresses
      expect(screen.getByLabelText(/moving from/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/moving to/i)).toBeInTheDocument()

      // Optional fields
      expect(screen.getByLabelText(/special items/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/additional notes/i)).toBeInTheDocument()

      // Submit button
      expect(screen.getByRole('button', { name: /get my austin moving quote/i })).toBeInTheDocument()
    })

    it('displays Austin-specific branding and messaging', () => {
      render(<FastQuoteForm />)

      expect(screen.getByText(/get a fast quote/i)).toBeInTheDocument()
      expect(screen.getByText(/accurate austin moving quote in 2 hours or less/i)).toBeInTheDocument()
      expect(screen.getByText(/ai-powered/i)).toBeInTheDocument()
      expect(screen.getByText(/austin moving pro tips/i)).toBeInTheDocument()
    })

    it('has Austin-specific default values and options', () => {
      render(<FastQuoteForm />)

      const moveTypeSelect = screen.getByLabelText(/move type/i)
      expect(moveTypeSelect).toHaveValue('local')

      const estimatedSizeSelect = screen.getByLabelText(/estimated size/i)
      expect(estimatedSizeSelect).toHaveValue('2br')

      // Check Austin-specific move type options
      expect(screen.getByText(/local austin move/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('prevents submission when required fields are empty', async () => {
      render(<FastQuoteForm />)

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      // Required field validation should prevent submission
      expect(mockBackendApi.createQuote).not.toHaveBeenCalled()
    })

    it('allows submission when all required fields are filled', async () => {
      render(<FastQuoteForm />)

      // Fill required fields
      await user.type(screen.getByLabelText(/full name/i), mockQuoteData.name)
      await user.type(screen.getByLabelText(/email address/i), mockQuoteData.email)
      await user.type(screen.getByLabelText(/phone number/i), mockQuoteData.phone)
      await user.type(screen.getByLabelText(/preferred move date/i), mockQuoteData.moveDate)
      await user.type(screen.getByLabelText(/moving from/i), mockQuoteData.fromAddress)

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitForFormSubmission()

      expect(mockBackendApi.createQuote).toHaveBeenCalledTimes(1)
    })

    it('validates email format', async () => {
      render(<FastQuoteForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')

      // HTML5 validation should handle this
      expect(emailInput).toHaveValue('invalid-email')
      expect(emailInput).toBeInvalid()
    })

    it('validates phone number format', async () => {
      render(<FastQuoteForm />)

      const phoneInput = screen.getByLabelText(/phone number/i)
      await user.type(phoneInput, '(512) 555-1234')

      expect(phoneInput).toHaveValue('(512) 555-1234')
    })
  })

  describe('Form Submission', () => {
    const fillRequiredFields = async () => {
      await user.type(screen.getByLabelText(/full name/i), mockQuoteData.name)
      await user.type(screen.getByLabelText(/email address/i), mockQuoteData.email)
      await user.type(screen.getByLabelText(/phone number/i), mockQuoteData.phone)
      await user.type(screen.getByLabelText(/preferred move date/i), mockQuoteData.moveDate)
      await user.type(screen.getByLabelText(/moving from/i), mockQuoteData.fromAddress)
    }

    it('successfully submits quote when backend is available', async () => {
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/quote submitted successfully/i)).toBeInTheDocument()
      })

      expect(mockBackendApi.createQuote).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: expect.objectContaining({
            name: mockQuoteData.name,
            email: mockQuoteData.email,
            phone: mockQuoteData.phone,
          }),
          quote: expect.objectContaining({
            move_type: 'local',
            from_address: mockQuoteData.fromAddress,
          }),
        })
      )
    })

    it('shows loading state during submission', async () => {
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      expect(screen.getByText(/submitting your quote/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('falls back to EmailJS when backend is unavailable', async () => {
      setupBackendFailures()
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockBackendApi.sendEmailFallback).toHaveBeenCalled()
      })
    })

    it('displays error when both backend and EmailJS fail', async () => {
      setupNetworkFailures()
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument()
        expect(screen.getByText(/call us directly at \(512\) 555-move/i)).toBeInTheDocument()
      })
    })

    it('calls custom onSubmit handler when provided', async () => {
      const onSubmit = vi.fn()
      render(<FastQuoteForm onSubmit={onSubmit} />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: mockQuoteData.name,
            email: mockQuoteData.email,
          }),
          [] // no files
        )
      })
    })
  })

  describe('Backend Status Indicator', () => {
    it('shows full service available when backend is healthy', async () => {
      render(<FastQuoteForm />)

      await waitFor(() => {
        expect(screen.getByText(/full service available/i)).toBeInTheDocument()
        expect(screen.getByText(/instant quotes & email confirmations/i)).toBeInTheDocument()
      })
    })

    it('shows limited service mode when backend is unavailable', async () => {
      setupBackendFailures()
      render(<FastQuoteForm />)

      await waitFor(() => {
        expect(screen.getByText(/limited service mode/i)).toBeInTheDocument()
        expect(screen.getByText(/quotes will be sent via email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Field Interactions', () => {
    it('updates form data when fields change', async () => {
      render(<FastQuoteForm />)

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, 'Jane Smith')
      expect(nameInput).toHaveValue('Jane Smith')

      const moveTypeSelect = screen.getByLabelText(/move type/i)
      await user.selectOptions(moveTypeSelect, 'long-distance')
      expect(moveTypeSelect).toHaveValue('long-distance')

      const estimatedSizeSelect = screen.getByLabelText(/estimated size/i)
      await user.selectOptions(estimatedSizeSelect, '3br')
      expect(estimatedSizeSelect).toHaveValue('3br')
    })

    it('handles special items input', async () => {
      render(<FastQuoteForm />)

      const specialItemsInput = screen.getByLabelText(/special items/i)
      await user.type(specialItemsInput, 'Piano, vintage furniture, artwork')
      expect(specialItemsInput).toHaveValue('Piano, vintage furniture, artwork')
    })

    it('handles additional notes textarea', async () => {
      render(<FastQuoteForm />)

      const notesTextarea = screen.getByLabelText(/additional notes/i)
      await user.type(notesTextarea, 'Third floor apartment, narrow stairs, limited parking')
      expect(notesTextarea).toHaveValue('Third floor apartment, narrow stairs, limited parking')
    })
  })

  describe('Austin-Specific Features', () => {
    it('displays Austin phone number in error messages', async () => {
      setupNetworkFailures()
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/\(512\) 555-move/i)).toBeInTheDocument()
      })
    })

    it('shows Austin-specific moving tips', () => {
      render(<FastQuoteForm />)

      expect(screen.getByText(/show stairs\/elevators \(common in austin apartments\)/i)).toBeInTheDocument()
      expect(screen.getByText(/include narrow doorways \(older austin homes\)/i)).toBeInTheDocument()
      expect(screen.getByText(/capture parking\/access \(especially downtown\/soco\)/i)).toBeInTheDocument()
      expect(screen.getByText(/photo bulky items and hill country home challenges/i)).toBeInTheDocument()
    })

    it('includes Austin-specific move type option', () => {
      render(<FastQuoteForm />)

      const moveTypeSelect = screen.getByLabelText(/move type/i)
      expect(screen.getByText(/local austin move/i)).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('displays success message with Austin contact information', async () => {
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/quote submitted successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/our austin moving specialists will review/i)).toBeInTheDocument()
        expect(screen.getByText(/contact you within 2 hours/i)).toBeInTheDocument()
        expect(screen.getByText(/call us at \(512\) 555-move/i)).toBeInTheDocument()
      })
    })

    it('shows quote ID when available', async () => {
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/quote id: #123/i)).toBeInTheDocument()
      })
    })

    it('hides submit button after successful submission', async () => {
      render(<FastQuoteForm />)

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: /get my austin moving quote/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/quote submitted successfully/i)).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /get my austin moving quote/i })).not.toBeInTheDocument()
    })
  })
})