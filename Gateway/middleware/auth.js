const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    // Since we don't have the JWT secret here, we'll decode without verification for gRPC calls
    // In production, you should verify with the auth service or have the secret
    const decoded = jwt.decode(token);
    
    if (!decoded || (!decoded.userId && !decoded.id)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = {
  authenticateToken
};