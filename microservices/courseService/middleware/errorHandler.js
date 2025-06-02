const multer = require('multer');

const errorHandler = (error, req, res, next) => {
  console.error('Error occurred:', error);

  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 500MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files uploaded.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: `Unexpected field: ${error.field}`
        });
      default:
        return res.status(400).json({
          success: false,
          error: `Upload error: ${error.message}`
        });
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }

  // Handle MinIO specific errors
  if (error.code === 'NoSuchBucket') {
    return res.status(404).json({
      success: false,
      error: 'Storage bucket not found'
    });
  }

  if (error.code === 'AccessDenied') {
    return res.status(403).json({
      success: false,
      error: 'Storage access denied'
    });
  }

  // Handle network/connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Storage service unavailable'
    });
  }

  // Default error response
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorHandler;
