import request from 'supertest';
import app from '../../../src/app.js';

describe('Micropost Controller', () => {
  const userId = 1;

  describe('GET /users/:userId/microposts', () => {
    it('should return user microposts with status 200', async () => {
      const response = await request(app)
        .get(`/users/${userId}/microposts`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach(micropost => {
        expect(micropost).toHaveProperty('id');
        expect(micropost).toHaveProperty('userId', userId);
        expect(micropost).toHaveProperty('content');
        expect(micropost).toHaveProperty('createdAt');
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/999/microposts')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /users/:userId/microposts', () => {
    it('should create a new micropost with status 201', async () => {
      const newMicropost = {
        content: 'This is a test micropost'
      };

      const response = await request(app)
        .post(`/users/${userId}/microposts`)
        .send(newMicropost)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('content', newMicropost.content);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for empty content', async () => {
      const invalidMicropost = {
        content: ''
      };

      const response = await request(app)
        .post(`/users/${userId}/microposts`)
        .send(invalidMicropost)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing content', async () => {
      const invalidMicropost = {};

      const response = await request(app)
        .post(`/users/${userId}/microposts`)
        .send(invalidMicropost)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent user', async () => {
      const newMicropost = {
        content: 'This is a test micropost'
      };

      const response = await request(app)
        .post('/users/999/microposts')
        .send(newMicropost)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});