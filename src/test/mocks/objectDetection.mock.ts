import { vi } from 'vitest'
import { DetectedObject } from '../../services/objectDetection'
import { mockDetectedObjects } from '../test-utils'

// Mock object detection service
export const mockObjectDetectionService = {
  detectObjects: vi.fn<[File], Promise<DetectedObject[]>>(),
  detectObjectsFromVideo: vi.fn<[File], Promise<DetectedObject[]>>(),
}

// Default mock implementations
export const setupObjectDetectionMocks = () => {
  mockObjectDetectionService.detectObjects.mockImplementation(async (file: File) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100))

    // Return different results based on file name for testing
    if (file.name.includes('empty')) {
      return []
    }
    if (file.name.includes('error')) {
      throw new Error('Failed to detect objects')
    }

    return mockDetectedObjects
  })

  mockObjectDetectionService.detectObjectsFromVideo.mockImplementation(async (file: File) => {
    // Simulate longer processing time for video
    await new Promise(resolve => setTimeout(resolve, 200))

    if (file.name.includes('empty')) {
      return []
    }
    if (file.name.includes('error')) {
      throw new Error('Failed to detect objects from video')
    }

    // Return more objects for video (simulating multiple frames)
    return [...mockDetectedObjects, ...mockDetectedObjects.map(obj => ({
      ...obj,
      score: obj.score * 0.9 // Slightly lower confidence for frame 2
    }))]
  })
}

// Simulate API errors
export const setupObjectDetectionErrors = () => {
  mockObjectDetectionService.detectObjects.mockRejectedValue(
    new Error('HTTP error! status: 401')
  )
  mockObjectDetectionService.detectObjectsFromVideo.mockRejectedValue(
    new Error('HTTP error! status: 429')
  )
}

// Simulate rate limiting
export const setupRateLimitErrors = () => {
  mockObjectDetectionService.detectObjects.mockRejectedValue(
    new Error('HTTP error! status: 429')
  )
  mockObjectDetectionService.detectObjectsFromVideo.mockRejectedValue(
    new Error('HTTP error! status: 429')
  )
}

// Simulate no API key
export const setupNoApiKey = () => {
  // This would be handled at the component level by checking environment variables
  mockObjectDetectionService.detectObjects.mockImplementation(() => {
    throw new Error('No API key configured')
  })
}