import request from 'supertest';
import app from '../../src/app.js';

describe('End-to-End API Tests', () => {
  describe('Full User and Micropost Workflow', () => {
    it('should complete a full user workflow', async () => {
      // 1. Get all users
      const usersResponse = await request(app)
        .get('/users')
        .expect(200);

      expect(usersResponse.body).toBeInstanceOf(Array);
      expect(usersResponse.body.length).toBeGreaterThan(0);
      
      const userId = usersResponse.body[0].id;

      // 2. Get user's microposts
      const micropostsResponse = await request(app)
        .get(`/users/${userId}/microposts`)
        .expect(200);

      expect(micropostsResponse.body).toBeInstanceOf(Array);

      // 3. Create a new micropost
      const newMicropost = {
        content: 'End-to-end test micropost'
      };

      const createResponse = await request(app)
        .post(`/users/${userId}/microposts`)
        .send(newMicropost)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body).toHaveProperty('userId', userId);
      expect(createResponse.body).toHaveProperty('content', newMicropost.content);

      // 4. Verify the micropost was created
      const updatedMicropostsResponse = await request(app)
        .get(`/users/${userId}/microposts`)
        .expect(200);

      expect(updatedMicropostsResponse.body.length).toBeGreaterThan(micropostsResponse.body.length);
    });

    it('should handle error scenarios gracefully', async () => {
      // Test 404 for non-existent user microposts
      await request(app)
        .get('/users/999/microposts')
        .expect(404);

      // Test 400 for invalid micropost creation
      await request(app)
        .post('/users/1/microposts')
        .send({ content: '' })
        .expect(400);

      // Test 404 for non-existent endpoint
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI at /api-docs', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);

      expect(response.text).toContain('Swagger UI');
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      // Check for security headers added by helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});