// middleware/auth.js
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
  
    try {
      // In a real implementation, verify JWT token here
      // For now, we'll extract user info from a mock token
      const userId = token; // Simplified for demo
      req.user = { id: userId };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid authentication token' });
    }
  };
  
  module.exports = { authenticate };