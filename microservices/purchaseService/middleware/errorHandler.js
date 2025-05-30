
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);
  
    // Stripe errors
    if (err.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Payment failed',
        message: err.message,
        code: err.code
      });
    }
  
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid payment request',
        message: err.message
      });
    }
  
    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: err.message
      });
    }
  
    // Default error
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorHandler;
  