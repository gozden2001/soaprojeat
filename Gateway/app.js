const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Debug middleware
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
            'GET /api/auth/user/profile'
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
});