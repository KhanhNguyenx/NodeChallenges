export const swaggerSchemas = {
  // Schemas từ users.route.ts
  UserInput: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', example: 'johndoe' },
      password: { type: 'string', example: 'password123' }
    }
  },
  UserRegisterInput: {
    type: 'object',
    required: ['username', 'password', 'email'],
    properties: {
      username: { type: 'string', example: 'johndoe' },
      password: { type: 'string', example: 'password123' },
      email: { type: 'string', example: 'user@example.com' }
    }
  },
  VerifyOtpInput: {
    type: 'object',
    required: ['email', 'otp'],
    properties: {
      email: { type: 'string', example: 'user@example.com' },
      otp: { type: 'string', example: '123456' }
    }
  },
  User: {
    type: 'object',
    required: ['id', 'username', 'email'],
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      username: { type: 'string', example: 'johndoe' },
      email: { type: 'string', example: 'user@example.com' }
    }
  },
  AuthResponse: {
    type: 'object',
    required: ['message', 'token', 'user'],
    properties: {
      message: { type: 'string', example: 'User login successfully' },
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      user: { $ref: '#/components/schemas/User' }
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' }
    }
  },
  // Schemas từ products.route.ts
  Product: {
    type: 'object',
    required: ['id', 'name', 'slug', 'quantity'],
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      name: { type: 'string', example: 'Laptop XYZ' },
      slug: { type: 'string', example: 'laptop-xyz' },
      quantity: { type: 'integer', example: 100 }
    }
  },
  ProductInput: {
    type: 'object',
    required: ['name', 'slug', 'quantity'],
    properties: {
      name: { type: 'string', example: 'Laptop XYZ' },
      slug: { type: 'string', example: 'laptop-xyz' },
      quantity: { type: 'integer', example: 100 }
    }
  },
  Pagination: {
    type: 'object',
    required: ['total', 'page', 'limit'],
    properties: {
      total: { type: 'integer', example: 50 },
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 }
    }
  }
};