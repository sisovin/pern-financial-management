const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Financial Reports API', () => {
  let token;

  beforeAll(async () => {
    // Create a test user and get a JWT token
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        password: 'testpassword',
        role: 'user',
      },
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });

    token = response.body.token;
  });

  afterAll(async () => {
    // Clean up the test user
    await prisma.user.deleteMany({});
  });

  test('should generate CSV report', async () => {
    const response = await request(app)
      .get('/api/reports/csv')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/csv');
  });

  test('should generate PDF report', async () => {
    const response = await request(app)
      .get('/api/reports/pdf')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
  });
});
