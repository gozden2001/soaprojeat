const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-super-secret-jwt-key-here';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Middleware to verify JWT token and extract user info
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Optionally verify with auth service
      if (AUTH_SERVICE_URL && process.env.VERIFY_WITH_AUTH_SERVICE === 'true') {
        try {
          const response = await axios.get(`${AUTH_SERVICE_URL}/api/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Use data from auth service if available
          req.user = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role
          };
        } catch (authServiceError) {
          console.warn('Auth service verification failed, using JWT data:', authServiceError.message);
          // Fall back to JWT data
          req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
          };
        }
      } else {
        // Use JWT decoded data
        req.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role
        };
      }
      
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication service error.' 
    });
  }
};

// Middleware to check if user has specific role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }
    
    const userRole = req.user.role;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${rolesArray.join(' or ')}` 
      });
    }
    
    next();
  };
};

// Middleware to check if user is tour author
const requireTourOwnership = async (req, res, next) => {
  try {
    const { Tour } = require('../models');
    const tourId = req.params.id;
    const userId = req.user.id;
    
    const tour = await Tour.findByPk(tourId);
    
    if (!tour) {
      return res.status(404).json({ 
        message: 'Tour not found.' 
      });
    }
    
    if (!tour.canBeEditedBy(userId)) {
      return res.status(403).json({ 
        message: 'Access denied. You can only edit your own tours.' 
      });
    }
    
    req.tour = tour; // Add tour to request for use in route handler
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({ 
      message: 'Error checking tour ownership.' 
    });
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  requireTourOwnership
};