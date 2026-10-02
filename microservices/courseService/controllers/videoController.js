const multer = require('multer');

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
    res.status(410).json({
      success: false,
      error: 'Video uploads now use Firebase Storage from the frontend.'
    });
  }

  async getVideoUrl(req, res) {
    try {
      const { filename } = req.params;
      const { secure = 'false' } = req.query;

      if (secure === 'true') {
        // Generate presigned URL for secure access
        return res.status(410).json({
          success: false,
          error: 'Video URLs are resolved directly by Firebase Storage.'
        });
      } else {
        return res.status(410).json({
          success: false,
          error: 'Video URLs are resolved directly by Firebase Storage.'
        });
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
      
      return res.status(410).json({
        success: false,
        error: 'Video deletion now uses Firebase Storage from the frontend.'
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
