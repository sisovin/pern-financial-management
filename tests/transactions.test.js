const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Transactions API', () => {
  let token;

  beforeAll(async () => {
    // Create a test user and get a JWT token
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        password: 'testpassword',
      },
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });

    token = response.body.token;
  });

  afterAll(async () => {
    // Clean up the test user and transactions
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/transactions/income', () => {
    it('should create an income transaction', async () => {
      const response = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('type', 'income');
      expect(response.body).toHaveProperty('amount', 100);
    });
  });

  describe('POST /api/transactions/expenses', () => {
    it('should create an expense transaction', async () => {
      const response = await request(app)
        .post('/api/transactions/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 50 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('type', 'expense');
      expect(response.body).toHaveProperty('amount', 50);
    });
  });

  describe('POST /api/transactions/savings', () => {
    it('should create a saving transaction', async () => {
      const response = await request(app)
        .post('/api/transactions/savings')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 200 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('type', 'saving');
      expect(response.body).toHaveProperty('amount', 200);
    });
  });

  describe('GET /api/transactions/income', () => {
    it('should fetch all income transactions', async () => {
      const response = await request(app)
        .get('/api/transactions/income')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/transactions/expenses', () => {
    it('should fetch all expense transactions', async () => {
      const response = await request(app)
        .get('/api/transactions/expenses')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/transactions/savings', () => {
    it('should fetch all saving transactions', async () => {
      const response = await request(app)
        .get('/api/transactions/savings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });
});
