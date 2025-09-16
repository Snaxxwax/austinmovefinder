// Object Detection Service using Hugging Face API
interface DetectedObject {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface HuggingFaceResponse {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

class ObjectDetectionService {
  private readonly API_URL = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50';
  private readonly API_KEY: string;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor(apiKey: string) {
    this.API_KEY = apiKey;
  }

  async detectObjects(imageFile: File): Promise<DetectedObject[]> {
    // Validate file before processing
    this.validateImageFile(imageFile);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔍 Object detection attempt ${attempt}/${this.MAX_RETRIES} for ${imageFile.name}`);

        const imageBuffer = await this.fileToArrayBuffer(imageFile);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/octet-stream',
          },
          body: imageBuffer,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 429) {
            throw new Error(`Rate limit exceeded. Please wait before trying again.`);
          } else if (response.status === 401) {
            throw new Error(`Invalid API key. Please check your Hugging Face API key.`);
          } else if (response.status >= 500) {
            throw new Error(`Server error (${response.status}). The AI service is temporarily unavailable.`);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const results: HuggingFaceResponse[] = await response.json();

        // Check if the response is valid
        if (!Array.isArray(results)) {
          throw new Error('Invalid response format from AI service');
        }

        console.log(`✅ Successfully detected ${results.length} objects on attempt ${attempt}`);

        // Filter and process results
        return this.processDetectionResults(results);

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Object detection attempt ${attempt} failed:`, error);

        // Don't retry certain errors
        if (error instanceof Error && (
          error.message.includes('Invalid API key') ||
          error.message.includes('Rate limit') ||
          error.message.includes('File too large') ||
          error.message.includes('Invalid file format')
        )) {
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.MAX_RETRIES) {
          console.log(`⏳ Waiting ${this.RETRY_DELAY}ms before retry...`);
          await this.delay(this.RETRY_DELAY * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    throw new Error(`Failed to detect objects after ${this.MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  async detectObjectsFromVideo(videoFile: File): Promise<DetectedObject[]> {
    try {
      console.log(`🎥 Starting video analysis for ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB)`);

      // Validate video file
      this.validateVideoFile(videoFile);

      // Extract frames from video
      const frames = await this.extractVideoFrames(videoFile, 3); // Extract 3 frames

      if (frames.length === 0) {
        throw new Error('Failed to extract frames from video');
      }

      console.log(`📸 Extracted ${frames.length} frames from video`);

      // Process each frame
      const allDetections: DetectedObject[] = [];

      for (let i = 0; i < frames.length; i++) {
        try {
          console.log(`🔍 Analyzing frame ${i + 1}/${frames.length}`);
          const frameBlob = await this.canvasToBlob(frames[i]);
          const frameFile = new File([frameBlob], `frame_${i}.jpg`, { type: 'image/jpeg' });
          const detections = await this.detectObjects(frameFile);
          allDetections.push(...detections);
          console.log(`✅ Frame ${i + 1} analysis complete: ${detections.length} objects found`);
        } catch (frameError) {
          console.warn(`⚠️ Failed to analyze frame ${i + 1}:`, frameError);
          // Continue with other frames
        }
      }

      console.log(`🎯 Video analysis complete: ${allDetections.length} total detections before deduplication`);

      // Deduplicate similar objects
      const finalDetections = this.deduplicateDetections(allDetections);
      console.log(`✅ Final result: ${finalDetections.length} unique objects detected`);

      return finalDetections;
    } catch (error) {
      console.error('❌ Video object detection failed:', error);
      throw new Error(`Failed to detect objects in video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private processDetectionResults(results: HuggingFaceResponse[]): DetectedObject[] {
    // Expanded list of relevant household and moving items
    const relevantLabels = [
      // Furniture
      'chair', 'couch', 'bed', 'dining table', 'bench', 'sofa',
      // Appliances
      'toilet', 'tv', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
      // Electronics
      'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'computer',
      // Personal items
      'book', 'clock', 'vase', 'scissors', 'suitcase', 'backpack',
      // Kitchen items
      'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
      // Household
      'teddy bear', 'hair drier', 'toothbrush', 'potted plant',
      // Sports/Recreation
      'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
      'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
      // Additional moving items
      'handbag', 'tie', 'umbrella', 'bottle', 'person' // person can indicate room scale
    ];

    const filteredResults = results
      .filter(result => {
        const isRelevant = relevantLabels.includes(result.label.toLowerCase());
        const meetsConfidenceThreshold = result.score > 0.25; // Slightly lower threshold

        if (isRelevant && meetsConfidenceThreshold) {
          console.log(`✅ Detected: ${result.label} (confidence: ${(result.score * 100).toFixed(1)}%)`);
          return true;
        }

        return false;
      })
      .map(result => ({
        label: result.label.toLowerCase(), // Normalize labels
        score: result.score,
        box: result.box
      }))
      .sort((a, b) => b.score - a.score); // Sort by confidence

    console.log(`🎯 Processed ${results.length} raw detections -> ${filteredResults.length} relevant items`);
    return filteredResults;
  }

  private async extractVideoFrames(videoFile: File, maxFrames: number = 3): Promise<HTMLCanvasElement[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: HTMLCanvasElement[] = [];

      // Set timeout for video loading
      const timeout = setTimeout(() => {
        video.src = '';
        reject(new Error('Video frame extraction timed out'));
      }, 15000); // 15 second timeout

      const cleanup = () => {
        clearTimeout(timeout);
        if (video.src) {
          URL.revokeObjectURL(video.src);
        }
      };

      video.onloadedmetadata = () => {
        try {
          console.log(`📹 Video metadata loaded: ${video.videoWidth}x${video.videoHeight}, duration: ${video.duration}s`);

          // Reasonable size limits for processing
          const maxWidth = 1920;
          const maxHeight = 1080;

          let { videoWidth, videoHeight } = video;

          // Scale down if too large
          if (videoWidth > maxWidth || videoHeight > maxHeight) {
            const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight);
            videoWidth = Math.floor(videoWidth * ratio);
            videoHeight = Math.floor(videoHeight * ratio);
          }

          canvas.width = videoWidth;
          canvas.height = videoHeight;

          const duration = video.duration;
          if (duration <= 0 || isNaN(duration)) {
            throw new Error('Invalid video duration');
          }

          const interval = duration / (maxFrames + 1); // Add 1 to avoid last frame issues
          let currentTime = interval; // Start after first interval
          let frameCount = 0;

          const captureFrame = () => {
            if (frameCount >= maxFrames) {
              cleanup();
              resolve(frames);
              return;
            }

            // Ensure we don't exceed video duration
            if (currentTime >= duration) {
              cleanup();
              resolve(frames);
              return;
            }

            video.currentTime = Math.min(currentTime, duration - 0.1);

            video.onseeked = () => {
              try {
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                  // Create new canvas for this frame
                  const frameCanvas = document.createElement('canvas');
                  frameCanvas.width = canvas.width;
                  frameCanvas.height = canvas.height;
                  const frameCtx = frameCanvas.getContext('2d');

                  if (frameCtx) {
                    frameCtx.drawImage(canvas, 0, 0);
                    frames.push(frameCanvas);
                    console.log(`📸 Captured frame ${frameCount + 1} at ${currentTime.toFixed(2)}s`);
                  }
                }

                frameCount++;
                currentTime += interval;

                // Small delay to prevent browser lock-up
                setTimeout(captureFrame, 100);
              } catch (error) {
                console.error('Error capturing frame:', error);
                frameCount++;
                currentTime += interval;
                setTimeout(captureFrame, 100);
              }
            };
          };

          captureFrame();
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Failed to load video file'));
      };

      video.onabort = () => {
        cleanup();
        reject(new Error('Video loading was aborted'));
      };

      try {
        video.src = URL.createObjectURL(videoFile);
        video.load();
      } catch (error) {
        cleanup();
        reject(new Error('Failed to create video URL'));
      }
    });
  }

  private async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.8);
    });
  }

  private deduplicateDetections(detections: DetectedObject[]): DetectedObject[] {
    const seenLabels = new Map<string, DetectedObject>();

    for (const detection of detections) {
      const existing = seenLabels.get(detection.label);

      if (!existing || detection.score > existing.score) {
        seenLabels.set(detection.label, detection);
      }
    }

    const deduplicated = Array.from(seenLabels.values())
      .sort((a, b) => b.score - a.score);

    console.log(`🔄 Deduplicated ${detections.length} detections -> ${deduplicated.length} unique items`);
    return deduplicated;
  }

  private validateImageFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Invalid file format. Supported formats: ${allowedTypes.join(', ')}`);
    }
  }

  private validateVideoFile(file: File): void {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];

    if (file.size > maxSize) {
      throw new Error(`Video file too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.some(type => file.type.toLowerCase().includes(type.split('/')[1]))) {
      throw new Error(`Invalid video format. Supported formats: MP4, WebM, MOV, AVI`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { ObjectDetectionService, type DetectedObject };