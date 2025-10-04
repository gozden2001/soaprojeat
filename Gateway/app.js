const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Debug middleware for auth routes
app.use('/api/auth', (req, res, next) => {
    console.log(`[DEBUG] Incoming ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Body:`, req.body);
    
    // Remove problematic expect header
    if (req.headers.expect) {
        delete req.headers.expect;
        console.log(`[DEBUG] Removed expect header`);
    }
    
    next();
});

// Debug middleware for follow routes
app.use('/api/follows', (req, res, next) => {
    console.log(`[DEBUG] Follow ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Body:`, req.body);
    
    // Remove problematic expect header
    if (req.headers.expect) {
        delete req.headers.expect;
        console.log(`[DEBUG] Removed expect header`);
    }
    
    next();
});

// Debug middleware for comment routes
app.use('/api/comments', (req, res, next) => {
    console.log(`[DEBUG] Comment ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Body:`, req.body);
    
    // Remove problematic expect header
    if (req.headers.expect) {
        delete req.headers.expect;
        console.log(`[DEBUG] Removed expect header`);
    }
    
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        gateway: 'Tourism API Gateway v1.0.0'
    });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
    res.json({
        gateway: 'Tourism API Gateway v1.0.0',
        description: 'Mikroservicna turistička aplikacija',
        endpoints: {
            auth: {
                base: '/api/auth',
                endpoints: [
                    'POST /api/auth/user/register',
                    'POST /api/auth/user/login', 
                    'GET /api/auth/user/profile',
                    'PUT /api/auth/user/profile'
                ]
            },
            blogs: {
                base: '/api/blogs',
                endpoints: [
                    'GET /api/blogs',
                    'GET /api/blogs/search',
                    'GET /api/blogs/stats',
                    'GET /api/blogs/author/:authorId',
                    'GET /api/blogs/:id',
                    'POST /api/blogs',
                    'PUT /api/blogs/:id',
                    'DELETE /api/blogs/:id'
                ]
            },
            follows: {
                base: '/api/follows',
                endpoints: [
                    'POST /api/follows',
                    'DELETE /api/follows/:userId',
                    'GET /api/follows/:userId/followers',
                    'GET /api/follows/:userId/following',
                    'GET /api/follows/:userId/stats',
                    'GET /api/follows/check/:userId'
                ]
            },
            comments: {
                base: '/api/comments',
                endpoints: [
                    'POST /api/comments/:blogId',
                    'GET /api/comments/:blogId',
                    'PUT /api/comments/comment/:commentId',
                    'DELETE /api/comments/comment/:commentId',
                    'GET /api/comments/user/:userId',
                    'GET /api/comments/stats'
                ]
            }
        }
    });
});

// Authentication Service Proxy
const authProxy = createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/api'  // /api/auth/user/login -> /api/user/login
    },
    timeout: 10000,  // 10 second timeout
    proxyTimeout: 10000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[AUTH PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
        console.log(`[AUTH PROXY] Target: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        
        // Fix JSON body serialization for POST/PUT requests
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            console.log(`[AUTH PROXY] Sending body:`, bodyData);
            
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[AUTH PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[AUTH PROXY] Error:', err.message);
        console.error('[AUTH PROXY] Error code:', err.code);
        res.status(503).json({ 
            error: 'Authentication service unavailable',
            details: err.message,
            code: err.code
        });
    }
});

app.use('/api/auth', authProxy);

// Blog Service Proxy
const blogProxy = createProxyMiddleware({
    target: process.env.BLOG_SERVICE_URL || 'http://blog-service:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/blogs': '/api/blogs'  // Keep the same path
    },
    timeout: 10000,  // 10 second timeout
    proxyTimeout: 10000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[BLOG PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
        console.log(`[BLOG PROXY] Target: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        
        // Fix JSON body serialization for POST/PUT requests
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            console.log(`[BLOG PROXY] Sending body:`, bodyData);
            
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[BLOG PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[BLOG PROXY] Error:', err.message);
        console.error('[BLOG PROXY] Error code:', err.code);
        res.status(503).json({ 
            error: 'Blog service unavailable',
            details: err.message,
            code: err.code
        });
    }
});

app.use('/api/blogs', blogProxy);

// Follow Service Proxy (using same BlogService)
const followProxy = createProxyMiddleware({
    target: process.env.BLOG_SERVICE_URL || 'http://blog-service:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/follows': '/api/follows'
    },
    timeout: 10000,
    proxyTimeout: 10000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[FOLLOW PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
        console.log(`[FOLLOW PROXY] Target: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            console.log(`[FOLLOW PROXY] Sending body:`, bodyData);
            
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[FOLLOW PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[FOLLOW PROXY] Error:', err.message);
        res.status(503).json({ 
            error: 'Follow service unavailable',
            details: err.message,
            code: err.code
        });
    }
});

app.use('/api/follows', followProxy);

// Comment Service Proxy (using same BlogService)
const commentProxy = createProxyMiddleware({
    target: process.env.BLOG_SERVICE_URL || 'http://blog-service:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/comments': '/api/comments'
    },
    timeout: 10000,
    proxyTimeout: 10000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[COMMENT PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
        console.log(`[COMMENT PROXY] Target: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            console.log(`[COMMENT PROXY] Sending body:`, bodyData);
            
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[COMMENT PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[COMMENT PROXY] Error:', err.message);
        res.status(503).json({ 
            error: 'Comment service unavailable',
            details: err.message,
            code: err.code
        });
    }
});

app.use('/api/comments', commentProxy);

// Debug middleware for tour routes
app.use('/api/tours', (req, res, next) => {
    console.log(`[DEBUG] Tour ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Body:`, req.body);
    
    // Remove problematic expect header
    if (req.headers.expect) {
        delete req.headers.expect;
        console.log(`[DEBUG] Removed expect header`);
    }
    
    next();
});

// Tour Service Proxy
const tourProxy = createProxyMiddleware({
    target: process.env.TOUR_SERVICE_URL || 'http://tour-service:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/tours': '/api/tours'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[TOUR-PROXY] ${req.method} ${req.originalUrl} -> ${process.env.TOUR_SERVICE_URL || 'http://tour-service:3003'}${req.url}`);
        
        // Handle JSON body serialization
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[TOUR-PROXY] Response ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error(`[TOUR-PROXY] Error for ${req.method} ${req.originalUrl}:`, err.message);
        res.status(503).json({
            error: 'Tour service unavailable',
            message: 'The tour service is currently unavailable. Please try again later.'
        });
    }
});

app.use('/api/tours', tourProxy);

// Debug middleware for cart routes
app.use('/api/cart', (req, res, next) => {
    console.log(`[DEBUG] Cart ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Body:`, req.body);
    
    // Remove problematic expect header
    if (req.headers.expect) {
        delete req.headers.expect;
        console.log(`[DEBUG] Removed expect header`);
    }
    
    next();
});

// Cart Service Proxy (using same TourService)
const cartProxy = createProxyMiddleware({
    target: process.env.TOUR_SERVICE_URL || 'http://tour-service:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/cart': '/api/cart'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[CART-PROXY] ${req.method} ${req.originalUrl} -> ${process.env.TOUR_SERVICE_URL || 'http://tour-service:3003'}${req.url}`);
        
        // Handle JSON body serialization
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[CART-PROXY] Response ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error(`[CART-PROXY] Error for ${req.method} ${req.originalUrl}:`, err.message);
        res.status(503).json({
            error: 'Cart service unavailable',
            message: 'The shopping cart service is currently unavailable. Please try again later.'
        });
    }
});

app.use('/api/cart', cartProxy);

// Debug middleware for tour-execution routes
app.use('/api/tour-execution', (req, res, next) => {
    console.log(`[DEBUG] TourExecution ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Body:`, req.body);
    
    // Remove problematic expect header
    if (req.headers.expect) {
        delete req.headers.expect;
        console.log(`[DEBUG] Removed expect header`);
    }
    
    next();
});

// Tour Execution Service Proxy (using same TourService)
const tourExecutionProxy = createProxyMiddleware({
    target: process.env.TOUR_SERVICE_URL || 'http://tour-service:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/tour-execution': '/api/tour-execution'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[TOUR-EXECUTION-PROXY] ${req.method} ${req.originalUrl} -> ${process.env.TOUR_SERVICE_URL || 'http://tour-service:3003'}${req.url}`);
        
        // Handle JSON body serialization
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[TOUR-EXECUTION-PROXY] Response ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error(`[TOUR-EXECUTION-PROXY] Error for ${req.method} ${req.originalUrl}:`, err.message);
        res.status(503).json({
            error: 'Tour execution service unavailable',
            message: 'The tour execution service is currently unavailable. Please try again later.'
        });
    }
});

app.use('/api/tour-execution', tourExecutionProxy);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        availableRoutes: [
            'GET /health',
            'GET /api-docs',
            'POST /api/auth/user/register',
            'POST /api/auth/user/login',
            'GET /api/auth/user/profile',
            'GET /api/blogs',
            'GET /api/blogs/search',
            'POST /api/blogs',
            'GET /api/blogs/:id',
            'PUT /api/blogs/:id',
            'DELETE /api/blogs/:id',
            'POST /api/follows',
            'DELETE /api/follows/:userId',
            'GET /api/follows/:userId/followers',
            'GET /api/follows/:userId/following',
            'GET /api/follows/check/:userId',
            'POST /api/comments/:blogId',
            'GET /api/comments/:blogId',
            'PUT /api/comments/comment/:commentId',
            'DELETE /api/comments/comment/:commentId',
            'GET /api/tours',
            'GET /api/tours/my',
            'GET /api/tours/stats',
            'POST /api/tours',
            'GET /api/tours/:id',
            'PUT /api/tours/:id',
            'DELETE /api/tours/:id',
            'PATCH /api/tours/:id/publish',
            'PATCH /api/tours/:id/archive',
            'POST /api/tours/:tourId/keypoints',
            'GET /api/tours/:tourId/keypoints',
            'GET /api/tours/:tourId/keypoints/stats',
            'GET /api/keypoints/:id',
            'PUT /api/keypoints/:id',
            'DELETE /api/keypoints/:id',
            'PUT /api/tours/:tourId/keypoints/reorder',
            'GET /api/cart',
            'POST /api/cart/add',
            'DELETE /api/cart/remove',
            'DELETE /api/cart/clear',
            'GET /api/cart/checkout/summary',
            'POST /api/cart/checkout',
            'GET /api/cart/purchases',
            'GET /api/cart/purchases/check/:tourId',
            'GET /api/cart/validate/:tourId',
            'POST /api/tour-execution/start',
            'GET /api/tour-execution/active/:tourId',
            'PATCH /api/tour-execution/:executionId/position',
            'POST /api/tour-execution/:executionId/check-keypoints',
            'PATCH /api/tour-execution/:executionId/finish',
            'GET /api/tour-execution/history',
            'GET /api/tour-execution/:executionId/stats'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(500).json({
        error: 'Internal gateway error',
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Tourism API Gateway running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/api-docs`);
    console.log(`🔐 Auth service: ${process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'}`);
    console.log(`📝 Blog service: ${process.env.BLOG_SERVICE_URL || 'http://blog-service:3002'}`);
});