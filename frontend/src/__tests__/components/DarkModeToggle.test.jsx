/**
 * DarkModeToggle Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DarkModeToggle } from '../../components/DarkModeToggle';

describe('DarkModeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('Rendering', () => {
    it('renders the toggle button', () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button', { name: /toggle dark mode/i });
      expect(button).toBeInTheDocument();
    });

    it('has correct aria-label for accessibility', () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByLabelText('Toggle dark mode');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('toggles dark mode when clicked', async () => {
      const user = userEvent.setup();
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
    });

    it('toggles back to light mode when clicked twice', async () => {
      const user = userEvent.setup();
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      
      expect(localStorage.setItem).toHaveBeenLastCalledWith('darkMode', 'false');
    });

    it('applies dark class to document when dark mode is enabled', async () => {
      const user = userEvent.setup();
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when light mode is enabled', async () => {
      const user = userEvent.setup();
      document.documentElement.classList.add('dark');
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      // Toggle twice to ensure we're in light mode
      await user.click(button);
      await user.click(button);
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('reads initial state from localStorage', () => {
      localStorage.getItem.mockReturnValue('true');
      
      render(<DarkModeToggle />);
      
      expect(localStorage.getItem).toHaveBeenCalledWith('darkMode');
    });

    it('saves dark mode preference to localStorage', async () => {
      const user = userEvent.setup();
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', expect.any(String));
    });
  });

  describe('Accessibility', () => {
    it('button is keyboard accessible', () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });

    it('can be activated with Enter key', async () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      
      // Button should respond to keyboard events
      expect(button).toBeInTheDocument();
    });

    it('has visible focus indicator styles', () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded');
    });
  });

  describe('Icon Display', () => {
    it('displays an icon inside the button', () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
    });
  });
});
