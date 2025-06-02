const multer = require('multer');
const minioService = require('../services/minioService.js');

class VideoController {
  constructor() {
    // Configure multer for memory storage
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only video files are allowed.'));
        }
      }
    });

    this.uploadVideoMiddleware = this.upload.single('video');
  }

  async uploadVideo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      const { courseId, lessonId } = req.body;
      
      if (!courseId || !lessonId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Course ID and Lesson ID are required' 
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      const uniqueFileName = `course-${courseId}/lesson-${lessonId}/${timestamp}-${originalName}`;

      // Set metadata
      const metadata = {
        'Content-Type': req.file.mimetype,
        'X-Amz-Meta-Original-Name': originalName,
        'X-Amz-Meta-Upload-Date': new Date().toISOString(),
        'X-Amz-Meta-Course-Id': courseId,
        'X-Amz-Meta-Lesson-Id': lessonId
      };

      // Upload to MinIO
      const result = await minioService.uploadVideo(
        req.file.buffer,
        uniqueFileName,
        metadata
      );

      res.status(200).json({
        success: true,
        data: {
          ...result,
          originalName,
          courseId,
          lessonId
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Upload failed' 
      });
    }
  }

  async getVideoUrl(req, res) {
    try {
      const { filename } = req.params;
      const { secure = 'false' } = req.query;

      if (secure === 'true') {
        // Generate presigned URL for secure access
        const presignedUrl = await minioService.getPresignedUrl(filename);
        res.json({ success: true, url: presignedUrl });
      } else {
        // Return direct URL
        const url = minioService.getVideoUrl(filename);
        res.json({ success: true, url });
      }

    } catch (error) {
      console.error('Error getting video URL:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get video URL' 
      });
    }
  }

  async deleteVideo(req, res) {
    try {
      const { filename } = req.params;
      
      await minioService.deleteVideo(filename);
      
      res.json({ 
        success: true, 
        message: 'Video deleted successfully' 
      });

    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete video' 
      });
    }
  }
}

module.exports = new VideoController();
