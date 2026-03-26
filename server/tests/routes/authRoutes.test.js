import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../../index.js';
import User from '../../models/User.js';

describe('Auth Routes', () => {
  let token;
  let userId;

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('newuser@test.com');
      expect(response.body.user.name).toBe('Test User');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return 400 if user already exists', async () => {
      await User.create({
        email: 'existing@test.com',
        password: 'password123',
        name: 'Existing User',
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@test.com',
          password: 'password456',
          name: 'New Name',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should lowercase email during signup', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'TestUser@EXAMPLE.COM',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('testuser@example.com');
    });

    it('should return a valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'tokentest@test.com',
          password: 'password123',
          name: 'Token Test',
        });

      expect(response.status).toBe(201);
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe('tokentest@test.com');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const user = await User.create({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login Test User',
      });
      userId = user._id;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login@test.com');
      expect(response.body.user.name).toBe('Login Test User');
      token = response.body.token;
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should work with uppercase email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'LOGIN@TEST.COM',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
    });

    it('should return a valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe('login@test.com');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      const user = await User.create({
        email: 'me@test.com',
        password: 'password123',
        name: 'Me Test User',
      });
      userId = user._id;
      token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('me@test.com');
      expect(response.body.user.name).toBe('Me Test User');
      expect(response.body.user.id).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: userId, email: 'me@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });
});
