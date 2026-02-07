/**
 * Auth Utility Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, getMe, forgotPassword } from '../../utils/auth';

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    global.fetch = vi.fn();
  });

  describe('signup', () => {
    it('calls API with correct data', async () => {
      const mockResponse = { id: '1', email: 'test@example.com', token: 'token123' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await signup('test@example.com', 'password123', 'Test User');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/signup'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failed registration', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      });

      await expect(signup('existing@example.com', 'password', 'Name'))
        .rejects.toThrow('Email already exists');
    });

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(signup('test@example.com', 'password', 'Name'))
        .rejects.toThrow('Cannot connect to server');
    });
  });

  describe('login', () => {
    it('calls API with email and password', async () => {
      const mockResponse = { id: '1', email: 'test@example.com', token: 'token123' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await login('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error on invalid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(login('test@example.com', 'password'))
        .rejects.toThrow('Cannot connect to server');
    });
  });

  describe('getMe', () => {
    it('throws error when no token exists', async () => {
      await expect(getMe()).rejects.toThrow('No token found');
    });

    it('calls API with authorization header', async () => {
      window.localStorage.setItem('symbio_nlm_auth_token', 'valid-token');
      const mockUser = { id: '1', email: 'test@example.com' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      await getMe();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/me'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
      );
    });

    it('returns user data on success', async () => {
      window.localStorage.setItem('symbio_nlm_auth_token', 'valid-token');
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await getMe();
      expect(result).toEqual(mockUser);
    });

    it('throws error on failed fetch', async () => {
      window.localStorage.setItem('symbio_nlm_auth_token', 'invalid-token');
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Token expired' }),
      });

      await expect(getMe()).rejects.toThrow('Token expired');
    });
  });

  describe('forgotPassword', () => {
    it('calls API with email', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Email sent' }),
      });

      await forgotPassword('test@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });

    it('returns success message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Password reset email sent' }),
      });

      const result = await forgotPassword('test@example.com');
      expect(result.message).toBe('Password reset email sent');
    });
  });
});
