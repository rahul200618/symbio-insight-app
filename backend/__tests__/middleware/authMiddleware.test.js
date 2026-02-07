/**
 * Auth Middleware Tests
 * 
 * Tests for protect and adminOnly middleware
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Set environment
process.env.STORAGE_MODE = 'atlas';
process.env.JWT_SECRET = 'test-secret-key';

const User = require('../../models/UserMongo');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

// Helper to create mock request/response
const createMockReq = (overrides = {}) => ({
  headers: {},
  ...overrides,
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Middleware', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('protect middleware', () => {
    it('should call next() with valid token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Test User',
        email: 'middleware@test.com',
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('middleware@test.com');
    });

    it('should return 401 without token', async () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const req = createMockReq({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = createMockRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Test User',
        email: 'expired@test.com',
        password: hashedPassword,
      });

      // Create an expired token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: fakeId }, process.env.JWT_SECRET);

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('adminOnly middleware', () => {
    it('should call next() for admin users', () => {
      const req = createMockReq({
        user: { role: 'admin', email: 'admin@test.com' },
      });
      const res = createMockRes();
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 for non-admin users', () => {
      const req = createMockReq({
        user: { role: 'user', email: 'user@test.com' },
      });
      const res = createMockRes();
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when no user', () => {
      const req = createMockReq({});
      const res = createMockRes();
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
