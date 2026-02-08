import { OpenAPIValidator } from 'express-openapi-validator';
import { Express, Request, Response, NextFunction } from 'express';

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'App API',
    version: '1.0.0',
    description: 'API documentation for all applications',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development server' },
    { url: 'https://api.example.com', description: 'Production server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'user', 'viewer'] },
          companyId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthToken: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'number' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          rememberMe: { type: 'boolean' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          items: { type: 'array' },
          page: { type: 'number' },
          limit: { type: 'number' },
          total: { type: 'number' },
          totalPages: { type: 'number' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthToken' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'User registration',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthToken' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'number' } },
          { name: 'limit', in: 'query', schema: { type: 'number' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/contacts': {
      get: {
        tags: ['Contacts'],
        summary: 'List contacts',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of contacts',
          },
        },
      },
      post: {
        tags: ['Contacts'],
        summary: 'Create contact',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': {
            description: 'Contact created',
          },
        },
      },
    },
    '/api/deals': {
      get: {
        tags: ['Deals'],
        summary: 'List deals',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of deals',
          },
        },
      },
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'List tickets',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'List of tickets',
          },
        },
      },
    },
    '/api/invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'List invoices',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of invoices',
          },
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of projects',
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');

  const specs = swaggerJsdoc({
    definition: openApiSpec,
    apis: ['./src/app/api/**/*.ts', './src/pages/api/**/*.ts'],
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  return specs;
}

export { openApiSpec as swaggerSpec };
