const express = require('express');
const cors = // Simple proxy configuration for AuthenticationService
const authProxy = createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': ''  // Remove /api/auth completely, leave the rest
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[AUTH PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[AUTH PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[AUTH PROXY] Error:', err.message);
        res.status(503).json({ 
            error: 'Authentication service unavailable',
            details: err.message 
        });
    }nst { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie']
}));

// Body parsing middleware
app.use(express.json());

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
        services: {
            auth: 'http://localhost:3001',
            blog: 'http://localhost:3002 (coming soon)',
            tour: 'http://localhost:3003 (coming soon)',
            purchase: 'http://localhost:3004 (coming soon)'
        },
        endpoints: {
            auth: [
                'POST /api/auth/user/register',
                'POST /api/auth/user/login',
                'POST /api/auth/user/logout',
                'GET /api/auth/user/profile',
                'PUT /api/auth/user/profile'
            ]
        }
    });
});

// Simple proxy configuration for AuthenticationService
const authProxy = createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/api'  // Remove /api/auth and keep /api
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[AUTH PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[AUTH PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[AUTH PROXY] Error:', err.message);
        res.status(503).json({ 
            error: 'Authentication service unavailable',
            details: err.message 
        });
    }
});

// Apply auth proxy to all /api/auth routes
app.use('/api/auth', authProxy);

// Placeholder for future services
app.use('/api/blog', (req, res) => {
    res.status(503).json({ error: 'Blog service not yet implemented' });
});

app.use('/api/tour', (req, res) => {
    res.status(503).json({ error: 'Tour service not yet implemented' });
});

app.use('/api/purchase', (req, res) => {
    res.status(503).json({ error: 'Purchase service not yet implemented' });
});

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