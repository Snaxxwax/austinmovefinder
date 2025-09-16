import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { Quote } from '../models/Quote.js';
import { ObjectDetectionService } from '../services/ObjectDetectionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 26214400, // 25MB default
    files: 10 // Maximum 10 files per request
  }
});

// POST /api/upload/:quote_id - Upload media files for a quote
router.post('/:quote_id', upload.array('media', 10), async (req, res) => {
  try {
    const quoteId = req.params.quote_id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Verify quote exists
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      // Clean up uploaded files if quote doesn't exist
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    const processedFiles = [];
    const detectedObjects = [];

    // Initialize object detection service
    const objectDetectionService = new ObjectDetectionService();

    for (const file of files) {
      try {
        // Add file to database
        const fileRecord = await quote.addMediaFile({
          filename: file.filename,
          original_name: file.originalname,
          file_type: file.mimetype,
          file_size: file.size,
          file_path: file.path
        });

        // Process image files for object detection
        if (file.mimetype.startsWith('image/')) {
          try {
            // Optimize image for better detection
            const optimizedPath = path.join(uploadDir, `optimized_${file.filename}`);
            await sharp(file.path)
              .resize(800, 600, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ quality: 90 })
              .toFile(optimizedPath);

            // Detect objects in the image
            const objects = await objectDetectionService.detectObjectsFromFile(optimizedPath);
            
            // Add detected objects to quote
            for (const obj of objects) {
              await quote.addDetectedItem({
                item_label: obj.label,
                confidence_score: obj.score,
                quantity: 1
              });
            }

            detectedObjects.push(...objects);

            // Clean up optimized file
            fs.unlinkSync(optimizedPath);

          } catch (detectionError) {
            console.error('Object detection failed for file:', file.filename, detectionError);
            // Continue processing other files even if detection fails
          }
        }

        // Process video files (extract frames for detection)
        if (file.mimetype.startsWith('video/')) {
          try {
            // For now, skip video processing - would need ffmpeg
            console.log('Video processing not yet implemented for:', file.filename);
          } catch (videoError) {
            console.error('Video processing failed for file:', file.filename, videoError);
          }
        }

        processedFiles.push({
          id: fileRecord.lastID,
          filename: file.filename,
          original_name: file.originalname,
          file_type: file.mimetype,
          file_size: file.size,
          uploaded_at: new Date().toISOString()
        });

      } catch (fileError) {
        console.error('Error processing file:', file.filename, fileError);
        // Clean up file if processing failed
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Recalculate quote cost if objects were detected
    if (detectedObjects.length > 0) {
      await quote.calculateEstimatedCost();
    }

    res.json({
      success: true,
      data: {
        files_uploaded: processedFiles.length,
        processed_files: processedFiles,
        detected_objects: detectedObjects,
        quote_updated: detectedObjects.length > 0
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up any uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      error: 'File upload failed',
      message: error.message
    });
  }
});

// GET /api/upload/:quote_id/files - Get files for a quote
router.get('/:quote_id/files', async (req, res) => {
  try {
    const quoteId = req.params.quote_id;
    
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    const mediaFiles = await quote.getMediaFiles();

    res.json({
      success: true,
      data: {
        quote_id: quoteId,
        files: mediaFiles
      }
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files',
      message: error.message
    });
  }
});

// GET /api/upload/file/:filename - Serve uploaded file
router.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // Security: prevent directory traversal
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Stream the file
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve file',
      message: error.message
    });
  }
});

// DELETE /api/upload/file/:filename - Delete uploaded file
router.delete('/file/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // Security: prevent directory traversal
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Remove from database first
    await database.run(
      'DELETE FROM media_files WHERE filename = ?',
      [filename]
    );

    // Remove physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `Maximum file size is ${process.env.MAX_FILE_SIZE || 26214400} bytes`
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Maximum 10 files per upload'
      });
    }
  }

  if (error.message === 'Only image and video files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: 'Only image and video files are allowed'
    });
  }

  next(error);
});

export default router;