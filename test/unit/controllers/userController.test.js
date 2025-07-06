import request from 'supertest';
import app from '../../../src/app.js';

describe('User Controller', () => {
  describe('GET /users', () => {
    it('should return all users with status 200', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(3);
      
      // Check structure of first user
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).toHaveProperty('createdAt');
      
      // Check specific data
      expect(response.body.data[0].name).toBe('Alice Johnson');
      expect(response.body.data[0].email).toBe('alice@example.com');
    });

    it('should return users with valid email format', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      response.body.data.forEach(user => {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should return users with valid date format', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      response.body.data.forEach(user => {
        expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      });
    });

    it('should return users with positive integer IDs', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      response.body.data.forEach(user => {
        expect(user.id).toBeGreaterThan(0);
        expect(Number.isInteger(user.id)).toBe(true);
      });
    });

    it('should return users with non-empty names', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      response.body.data.forEach(user => {
        expect(user.name).toBeTruthy();
        expect(user.name.length).toBeGreaterThan(0);
      });
    });
  });
});