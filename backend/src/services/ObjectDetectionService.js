import fs from 'fs';
import path from 'path';

export class ObjectDetectionService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY;
    this.apiUrl = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50';
    this.confidenceThreshold = 0.3;
  }

  async detectObjectsFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const imageBuffer = fs.readFileSync(filePath);
    return await this.detectObjects(imageBuffer);
  }

  async detectObjects(imageBuffer) {
    if (!this.apiKey || this.apiKey === 'your_huggingface_api_key_here') {
      console.log('🔍 No Hugging Face API key - using demo mode');
      return this.generateDemoObjects();
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBuffer
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      
      // Filter and format results
      const filteredObjects = results
        .filter(obj => obj.score >= this.confidenceThreshold)
        .map(obj => ({
          label: this.mapLabelToMovingItem(obj.label),
          score: obj.score,
          box: obj.box
        }))
        .filter(obj => obj.label); // Remove unmapped items

      return this.deduplicateObjects(filteredObjects);

    } catch (error) {
      console.error('Object detection API error:', error);
      
      // Fall back to demo mode on API failure
      console.log('🔍 API failed - falling back to demo mode');
      return this.generateDemoObjects();
    }
  }

  generateDemoObjects() {
    // Return demo objects for development/testing
    const demoObjects = [
      { label: 'couch', score: 0.95, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
      { label: 'dining table', score: 0.88, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
      { label: 'chair', score: 0.92, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
      { label: 'tv', score: 0.85, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
      { label: 'refrigerator', score: 0.91, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } }
    ];

    // Randomly select 2-4 items for variety
    const selectedCount = Math.floor(Math.random() * 3) + 2;
    const shuffled = demoObjects.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, selectedCount);
  }

  mapLabelToMovingItem(apiLabel) {
    // Map Hugging Face DETR labels to our moving item catalog
    const labelMappings = {
      // Furniture
      'couch': 'couch',
      'sofa': 'couch',
      'chair': 'chair',
      'dining table': 'dining table',
      'table': 'dining table',
      'bed': 'bed',
      'bench': 'chair',
      
      // Appliances
      'refrigerator': 'refrigerator',
      'microwave': 'microwave',
      'oven': 'oven',
      'toaster': 'toaster',
      'sink': 'sink',
      'toilet': 'toilet',
      
      // Electronics
      'tv': 'tv',
      'television': 'tv',
      'laptop': 'laptop',
      'computer': 'laptop',
      'cell phone': 'laptop',
      'remote': 'laptop',
      
      // Personal items
      'suitcase': 'suitcase',
      'handbag': 'suitcase',
      'backpack': 'suitcase',
      'book': 'book',
      
      // Fragile items
      'vase': 'vase',
      'wine glass': 'wine glass',
      'cup': 'wine glass',
      'bottle': 'wine glass',
      'potted plant': 'potted plant',
      'plant': 'potted plant',
      
      // Kitchen items
      'bowl': 'wine glass',
      'knife': 'wine glass',
      'spoon': 'wine glass',
      'fork': 'wine glass',
      
      // General items that map to existing categories
      'clock': 'vase', // decorative items
      'picture frame': 'vase', // decorative items
      'mirror': 'tv', // large flat items
      'painting': 'tv' // wall mounted items
    };

    const normalizedLabel = apiLabel.toLowerCase();
    return labelMappings[normalizedLabel] || null;
  }

  deduplicateObjects(objects) {
    // Group similar objects and combine them
    const grouped = {};
    
    for (const obj of objects) {
      if (!grouped[obj.label]) {
        grouped[obj.label] = {
          label: obj.label,
          score: obj.score,
          count: 1,
          boxes: [obj.box]
        };
      } else {
        // Keep highest confidence score
        if (obj.score > grouped[obj.label].score) {
          grouped[obj.label].score = obj.score;
        }
        grouped[obj.label].count++;
        grouped[obj.label].boxes.push(obj.box);
      }
    }

    // Convert back to array format
    return Object.values(grouped).map(group => ({
      label: group.label,
      score: group.score,
      quantity: group.count,
      box: group.boxes[0] // Use first box for reference
    }));
  }

  async detectObjectsFromVideo(videoFile) {
    // For video processing, we would typically:
    // 1. Extract key frames using ffmpeg
    // 2. Run object detection on each frame
    // 3. Aggregate results across frames
    
    // For now, return demo objects for video files
    console.log('🎥 Video object detection - using demo mode');
    return this.generateDemoObjects();
  }

  // Health check for the service
  async healthCheck() {
    if (!this.apiKey || this.apiKey === 'your_huggingface_api_key_here') {
      return {
        status: 'demo',
        message: 'Running in demo mode - no API key configured'
      };
    }

    try {
      // Test with a minimal request
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok || response.status === 405) { // 405 is expected for GET on POST endpoint
        return {
          status: 'healthy',
          message: 'Object detection service is available'
        };
      } else {
        return {
          status: 'error',
          message: `API returned status ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `API connection failed: ${error.message}`
      };
    }
  }
}