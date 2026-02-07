/**
 * AuthContext Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock the auth utils
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockGetMe = vi.fn();

vi.mock('../../utils/auth', () => ({
  login: (...args) => mockLogin(...args),
  signup: (...args) => mockSignup(...args),
  getMe: () => mockGetMe(),
}));

// Test component to access context
function TestConsumer({ onContextReady }) {
  const auth = useAuth();
  if (onContextReady) {
    onContextReady(auth);
  }
  return (
    <div>
      <span data-testid="user">{auth.user ? auth.user.email : 'no user'}</span>
      <span data-testid="loading">{auth.loading ? 'loading' : 'ready'}</span>
      <span data-testid="error">{auth.error || 'no error'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  let originalLocation;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
    mockSignup.mockReset();
    mockGetMe.mockReset();
    // Clear localStorage
    window.localStorage.clear();
    // Save original location
    originalLocation = window.location;
  });

  afterEach(() => {
    // Restore location if modified
    if (window.location !== originalLocation) {
      window.location = originalLocation;
    }
  });

  describe('Initial State', () => {
    it('provides initial state with no user', async () => {
      mockGetMe.mockRejectedValue(new Error('No token'));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });

    it('loads user from token if present', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
      mockGetMe.mockResolvedValue(mockUser);
      window.localStorage.setItem('symbio_nlm_auth_token', 'valid-token');

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('clears invalid token from localStorage', async () => {
      mockGetMe.mockRejectedValue(new Error('Invalid token'));
      window.localStorage.setItem('symbio_nlm_auth_token', 'invalid-token');

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(window.localStorage.getItem('symbio_nlm_auth_token')).toBeNull();
    });
  });

  describe('Login Function', () => {
    it('calls login API and sets user', async () => {
      mockGetMe.mockRejectedValue(new Error('No token'));
      
      const mockUser = { id: '1', email: 'test@example.com', token: 'new-token' };
      mockLogin.mockResolvedValue(mockUser);

      let authContext;
      render(
        <AuthProvider>
          <TestConsumer onContextReady={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        await authContext.login('test@example.com', 'password123');
      });

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(window.localStorage.getItem('symbio_nlm_auth_token')).toBe('new-token');
    });

    it('sets error on login failure', async () => {
      mockGetMe.mockRejectedValue(new Error('No token'));
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      let authContext;
      render(
        <AuthProvider>
          <TestConsumer onContextReady={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        try {
          await authContext.login('test@example.com', 'wrong');
        } catch (e) {
          // Expected
        }
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  describe('Signup Function', () => {
    it('calls signup API and sets user', async () => {
      mockGetMe.mockRejectedValue(new Error('No token'));
      
      const mockUser = { id: '1', email: 'new@example.com', token: 'signup-token' };
      mockSignup.mockResolvedValue(mockUser);

      let authContext;
      render(
        <AuthProvider>
          <TestConsumer onContextReady={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        await authContext.signup('new@example.com', 'password123', 'New User');
      });

      expect(mockSignup).toHaveBeenCalledWith('new@example.com', 'password123', 'New User');
      expect(window.localStorage.getItem('symbio_nlm_auth_token')).toBe('signup-token');
    });

    it('sets error on signup failure', async () => {
      mockGetMe.mockRejectedValue(new Error('No token'));
      mockSignup.mockRejectedValue(new Error('Email already exists'));

      let authContext;
      render(
        <AuthProvider>
          <TestConsumer onContextReady={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        try {
          await authContext.signup('existing@example.com', 'password', 'Name');
        } catch (e) {
          // Expected
        }
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Email already exists');
    });
  });

  describe('Logout Function', () => {
    it('clears user and token on logout', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockGetMe.mockResolvedValue(mockUser);
      window.localStorage.setItem('symbio_nlm_auth_token', 'valid-token');

      // Mock window.location
      delete window.location;
      window.location = { href: '' };

      let authContext;
      render(
        <AuthProvider>
          <TestConsumer onContextReady={(ctx) => (authContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      act(() => {
        authContext.logout();
      });

      expect(window.localStorage.getItem('symbio_nlm_auth_token')).toBeNull();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('useAuth Hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow();

      consoleSpy.mockRestore();
    });

    it('returns context value when used inside provider', async () => {
      mockGetMe.mockRejectedValue(new Error('No token'));

      let contextValue;
      render(
        <AuthProvider>
          <TestConsumer onContextReady={(ctx) => (contextValue = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).toBeDefined();
      });

      expect(contextValue).toHaveProperty('user');
      expect(contextValue).toHaveProperty('loading');
      expect(contextValue).toHaveProperty('error');
      expect(contextValue).toHaveProperty('login');
      expect(contextValue).toHaveProperty('signup');
      expect(contextValue).toHaveProperty('logout');
    });
  });
});
