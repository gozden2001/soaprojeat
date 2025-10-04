// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication & User management for microservices',
    },
    servers: [
      { url: 'http://localhost:8080/auth', description: 'Via API Gateway' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        UserRegister: {
          type: 'object',
          required: ['name','surname','username','email','password','address'],
          properties: {
            name: { type: 'string' },
            surname: { type: 'string' },
            username: { type: 'string', minLength: 6 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            address: {
              type: 'object',
              required: ['latitude','longitude'],
              properties: {
                latitude: { type: 'number', minimum: -90, maximum: 90 },
                longitude:{ type: 'number', minimum: -180, maximum: 180 }
              }
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email','password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // parsira JSDoc komentare iz ruta
};

module.exports = swaggerJSDoc(options);
