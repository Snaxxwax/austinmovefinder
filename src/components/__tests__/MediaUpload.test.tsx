import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockFile, createMockVideoFile } from '../../test/test-utils'
import { MediaUpload } from '../MediaUpload'

describe('MediaUpload', () => {
  const user = userEvent.setup()
  const mockOnFilesChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: 'data:image/jpeg;base64,mockdata',
      onload: null,
      onerror: null,
    }
    vi.mocked(global.FileReader).mockImplementation(() => mockFileReader as unknown as FileReader)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Component Rendering', () => {
    it('renders upload area with Austin-specific branding', () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
      expect(screen.getByText(/or drag and drop/i)).toBeInTheDocument()
      expect(screen.getByText(/images and videos up to 50mb each/i)).toBeInTheDocument()
      expect(screen.getByText(/austin moving tips/i)).toBeInTheDocument()
    })

    it('displays Austin-specific upload tips', () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      expect(screen.getByText(/show stairs\/elevators in apartments/i)).toBeInTheDocument()
      expect(screen.getByText(/include tight spaces like east austin doors/i)).toBeInTheDocument()
      expect(screen.getByText(/capture hill country home access/i)).toBeInTheDocument()
    })

    it('accepts custom props', () => {
      render(
        <MediaUpload
          onFilesChange={mockOnFilesChange}
          maxFiles={3}
          maxSizePerFile={25}
          acceptedTypes={['image/*']}
        />
      )

      expect(screen.getByText(/images and videos up to 25mb each \(max 3 files\)/i)).toBeInTheDocument()
    })

    it('shows analyzing state when isAnalyzing is true', () => {
      render(
        <MediaUpload
          onFilesChange={mockOnFilesChange}
          isAnalyzing={true}
        />
      )

      expect(screen.getByText(/analyzing your items with ai/i)).toBeInTheDocument()
    })

    it('displays analysis error when provided', () => {
      const errorMessage = 'Failed to analyze media'
      render(
        <MediaUpload
          onFilesChange={mockOnFilesChange}
          analysisError={errorMessage}
        />
      )

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText(/need help\? call \(512\) 555-move/i)).toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('handles single file upload', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024)
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader behavior
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
        }
      }, 10)

      await user.upload(input, file)

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([file])
      })
    })

    it('handles multiple file upload', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} maxFiles={3} />)

      const files = [
        createMockFile('test1.jpg', 'image/jpeg'),
        createMockFile('test2.png', 'image/png'),
        createMockVideoFile('test.mp4'),
      ]
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader for multiple files
      files.forEach((_, index) => {
        const mockFileReader = vi.mocked(global.FileReader).mock.results[index]?.value
        if (mockFileReader) {
          setTimeout(() => {
            if (mockFileReader.onload) {
              mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
            }
          }, 10 * (index + 1))
        }
      })

      await user.upload(input, files)

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith(files)
      })
    })

    it('handles drag and drop upload', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('dropped.jpg', 'image/jpeg')
      const uploadArea = screen.getByText(/click to upload/i).closest('div')!

      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
        }
      }, 10)

      fireEvent.drop(uploadArea, {
        dataTransfer: {
          files: [file],
        },
      })

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([file])
      })
    })
  })

  describe('File Validation', () => {
    it('rejects files exceeding size limit', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} maxSizePerFile={1} />)

      const largeFile = createMockFile('large.jpg', 'image/jpeg', 2 * 1024 * 1024) // 2MB
      const input = screen.getByLabelText(/click to upload/i)

      await user.upload(input, largeFile)

      await waitFor(() => {
        expect(screen.getByText(/file "large.jpg" is too large/i)).toBeInTheDocument()
      })

      expect(mockOnFilesChange).not.toHaveBeenCalled()
    })

    it('rejects unsupported file types', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} acceptedTypes={['image/*']} />)

      const textFile = createMockFile('document.txt', 'text/plain')
      const input = screen.getByLabelText(/click to upload/i)

      await user.upload(input, textFile)

      await waitFor(() => {
        expect(screen.getByText(/file "document.txt" is not a supported format/i)).toBeInTheDocument()
      })

      expect(mockOnFilesChange).not.toHaveBeenCalled()
    })

    it('enforces maximum file count', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} maxFiles={2} />)

      const files = [
        createMockFile('file1.jpg'),
        createMockFile('file2.jpg'),
        createMockFile('file3.jpg'),
      ]
      const input = screen.getByLabelText(/click to upload/i)

      await user.upload(input, files)

      await waitFor(() => {
        expect(screen.getByText(/maximum 2 files allowed/i)).toBeInTheDocument()
      })

      expect(mockOnFilesChange).not.toHaveBeenCalled()
    })
  })

  describe('File Preview and Management', () => {
    it('displays file previews after upload', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const imageFile = createMockFile('photo.jpg', 'image/jpeg')
      const videoFile = createMockVideoFile('video.mp4')
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader
      const files = [imageFile, videoFile];
      files.forEach((_, index) => {
        const mockFileReader = vi.mocked(global.FileReader).mock.results[index]?.value
        if (mockFileReader) {
          setTimeout(() => {
            if (mockFileReader.onload) {
              mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
            }
          }, 10 * (index + 1))
        }
      })

      await user.upload(input, [imageFile, videoFile])

      await waitFor(() => {
        expect(screen.getByText('photo.jpg')).toBeInTheDocument()
        expect(screen.getByText('video.mp4')).toBeInTheDocument()
      })
    })

    it('allows file removal', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('removeme.jpg', 'image/jpeg')
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
        }
      }, 10)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('removeme.jpg')).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', { name: /remove file/i })
      await user.click(removeButton)

      expect(mockOnFilesChange).toHaveBeenLastCalledWith([])
      expect(screen.queryByText('removeme.jpg')).not.toBeInTheDocument()
    })

    it('shows file size information', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('sized.jpg', 'image/jpeg', 1.5 * 1024 * 1024) // 1.5MB
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
        }
      }, 10)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/1\.5 mb/i)).toBeInTheDocument()
      })
    })
  })

  describe('Upload Progress', () => {
    it('shows progress indicator during file processing', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('processing.jpg', 'image/jpeg')
      const input = screen.getByLabelText(/click to upload/i)

      // Don't trigger onload immediately to see progress
      await user.upload(input, file)

      // Should show progress initially
      expect(screen.getByText('processing.jpg')).toBeInTheDocument()

      // Trigger FileReader completion
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
      }

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([file])
      })
    })
  })

  describe('Upload Summary', () => {
    it('displays upload summary when files are present', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const files = [
        createMockFile('file1.jpg'),
        createMockFile('file2.mp4', 'video/mp4'),
      ]
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader for multiple files
      files.forEach((_, index) => {
        const mockFileReader = vi.mocked(global.FileReader).mock.results[index]?.value
        if (mockFileReader) {
          setTimeout(() => {
            if (mockFileReader.onload) {
              mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
            }
          }, 10 * (index + 1))
        }
      })

      await user.upload(input, files)

      await waitFor(() => {
        expect(screen.getByText(/2 files ready for analysis/i)).toBeInTheDocument()
      })
    })

    it('shows Austin-specific tips for additional uploads', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('single.jpg')
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
        }
      }, 10)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/add 2 more photos for a more accurate austin moving quote/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles FileReader errors gracefully', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('error.jpg')
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader error
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror({ target: mockFileReader, type: 'error' } as ProgressEvent<FileReader>)
        }
      }, 10)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/failed to process some files/i)).toBeInTheDocument()
      })
    })

    it('shows contact information in error messages', () => {
      const errorMessage = 'Something went wrong'
      render(
        <MediaUpload
          onFilesChange={mockOnFilesChange}
          analysisError={errorMessage}
        />
      )

      expect(screen.getByText(/need help\? call \(512\) 555-move/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const input = screen.getByLabelText(/click to upload/i)
      expect(input).toHaveAttribute('type', 'file')
      expect(input).toHaveAttribute('multiple')
      expect(input).toHaveAttribute('accept')
    })

    it('provides remove button with accessible label', async () => {
      render(<MediaUpload onFilesChange={mockOnFilesChange} />)

      const file = createMockFile('accessible.jpg')
      const input = screen.getByLabelText(/click to upload/i)

      // Mock FileReader
      const mockFileReader = vi.mocked(global.FileReader).mock.results[0].value
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: mockFileReader } as ProgressEvent<FileReader>)
        }
      }, 10)

      await user.upload(input, file)

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /remove file/i })
        expect(removeButton).toBeInTheDocument()
        expect(removeButton).toHaveAttribute('aria-label', 'Remove file')
      })
    })
  })
})