/**
 * Login Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../../components/Login';

// Mock the auth context
const mockLogin = vi.fn();
const mockUseAuth = vi.fn(() => ({
  login: mockLogin,
  loading: false,
  error: null,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Icons
vi.mock('../../components/Icons', () => ({
  Icons: {
    DNA: () => <span data-testid="icon-dna">DNA</span>,
    Eye: () => <span data-testid="icon-eye">Eye</span>,
    EyeOff: () => <span data-testid="icon-eyeoff">EyeOff</span>,
    Mail: () => <span data-testid="icon-mail">Mail</span>,
    Lock: () => <span data-testid="icon-lock">Lock</span>,
    ArrowRight: () => <span data-testid="icon-arrow">Arrow</span>,
    Google: () => <span data-testid="icon-google">Google</span>,
    Loader: () => <span data-testid="icon-loader">Loader</span>,
    AlertCircle: () => <span data-testid="icon-alert">Alert</span>,
    CheckCircle: () => <span data-testid="icon-check">Check</span>,
  },
}));

// Mock forgotPassword utility
vi.mock('../../utils/auth', () => ({
  forgotPassword: vi.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  describe('Rendering', () => {
    it('renders the login form correctly', () => {
      render(<Login />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('renders email and password input fields', () => {
      render(<Login />);
      
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders sign in button', () => {
      render(<Login />);
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('updates email input value', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const emailInput = screen.getByPlaceholderText('your@email.com');
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password input value', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const passwordInput = screen.getByPlaceholderText('••••••••');
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput).toHaveValue('password123');
    });

    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Find and click the toggle button by its aria-label
      const toggleButton = screen.getByLabelText('Show password');
      await user.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Form Submission', () => {
    it('calls login with email and password on submit', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({});
      
      render(<Login />);
      
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('validates required fields before submission', async () => {
      render(<Login />);
      
      // The form has HTML5 validation with required fields
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      // Inputs should have required attribute
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('calls onLoginSuccess callback after successful login', async () => {
      const user = userEvent.setup();
      const onLoginSuccess = vi.fn();
      mockLogin.mockResolvedValue({});
      
      render(<Login onLoginSuccess={onLoginSuccess} />);
      
      await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(onLoginSuccess).toHaveBeenCalled();
      });
    });

    it('handles login error correctly', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue(new Error(errorMessage));
      
      render(<Login />);
      
      await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('calls onSwitchToSignup when signup link is clicked', async () => {
      const user = userEvent.setup();
      const onSwitchToSignup = vi.fn();
      
      render(<Login onSwitchToSignup={onSwitchToSignup} />);
      
      // Find the signup link
      const signupLink = screen.getByText(/sign up/i);
      await user.click(signupLink);
      
      expect(onSwitchToSignup).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible form elements', () => {
      render(<Login />);
      
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      expect(emailInput).toBeVisible();
      expect(passwordInput).toBeVisible();
    });

    it('submit button is focusable', () => {
      render(<Login />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      submitButton.focus();
      
      expect(document.activeElement).toBe(submitButton);
    });
  });
});
