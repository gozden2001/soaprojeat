const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access token is required' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token with AuthenticationService
    const authServiceURL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    const response = await axios.get(`${authServiceURL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000
    });

    if (response.status === 200 && response.data) {
      // Add user info to request
      req.user = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      };
      next();
    } else {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        message: 'Invalid or expired token' 
      });
    }
    
    return res.status(503).json({ 
      message: 'Authentication service unavailable' 
    });
  }
};

// Role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};