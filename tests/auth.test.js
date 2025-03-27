const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Authentication API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('POST /api/auth/2fa', () => {
    it('should enable 2FA for a user', async () => {
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser2',
          password: 'password123',
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser2',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/auth/2fa')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          token: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('2FA enabled successfully');
    });
  });
});
