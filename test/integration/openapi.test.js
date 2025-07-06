import request from 'supertest';
import { OpenAPIBackend } from 'openapi-backend';
import express from 'express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAPI 読み込み
const api = new OpenAPIBackend({ 
  definition: YAML.load(path.resolve(__dirname, '../../openapi/api.yaml')),
  validate: true,
  customizeAjv: (ajv) => {
    addFormats(ajv);
    return ajv;
  }
});

// モック実装
api.register('getUsers', (_, __, res) => {
  const mockUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', createdAt: '2024-01-15T10:00:00Z' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', createdAt: '2024-01-16T14:30:00Z' }
  ];
  res.status(200).json(mockUsers);
});

api.register('getUserMicroposts', (c, __, res) => {
  const userId = parseInt(c.request.params.userId);
  const mockMicroposts = [
    { id: 1, userId: userId, content: 'First micropost', createdAt: '2024-01-15T10:00:00Z' },
    { id: 2, userId: userId, content: 'Second micropost', createdAt: '2024-01-16T14:30:00Z' }
  ];
  res.status(200).json(mockMicroposts);
});

api.register('createUserMicropost', (c, __, res) => {
  const userId = parseInt(c.request.params.userId);
  const { content } = c.request.body;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  const newMicropost = {
    id: Date.now(),
    userId: userId,
    content: content,
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newMicropost);
});

api.register('notFound', (_, __, res) => {
  res.status(404).json({ error: 'Not found' });
});

api.register('validationFail', (c, __, res) => {
  res.status(400).json({ error: c.validation.errors });
});

api.init();

const app = express();
app.use(express.json());
app.use((req, res) => api.handleRequest(req, req, res));

describe('OpenAPI Integration Tests', () => {
  describe('Users API (OpenAPI-driven)', () => {
    it('GET /users should return 200 with user array', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('createdAt');
    });

    it('should follow OpenAPI schema validation', async () => {
      const res = await request(app).get('/users');
      
      res.body.forEach(user => {
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.createdAt).toBe('string');
      });
    });
  });

  describe('Microposts API (OpenAPI-driven)', () => {
    const userId = 1;

    it('GET /users/:userId/microposts should return 200', async () => {
      const res = await request(app).get(`/users/${userId}/microposts`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('userId', userId);
      expect(res.body[0]).toHaveProperty('content');
      expect(res.body[0]).toHaveProperty('createdAt');
    });

    it('POST /users/:userId/microposts should create micropost', async () => {
      const newPost = { content: 'Hello, world!' };
      const res = await request(app)
        .post(`/users/${userId}/microposts`)
        .send(newPost)
        .set('Accept', 'application/json');
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId', userId);
      expect(res.body).toHaveProperty('content', newPost.content);
      expect(res.body).toHaveProperty('createdAt');
    });

    it('POST /users/:userId/microposts should validate content', async () => {
      const invalidPost = { content: '' };
      const res = await request(app)
        .post(`/users/${userId}/microposts`)
        .send(invalidPost)
        .set('Accept', 'application/json');
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent endpoints', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});