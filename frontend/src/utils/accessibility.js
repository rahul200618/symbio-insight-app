/**
 * Accessibility Utilities
 * 
 * Helper functions and hooks for improving accessibility
 */

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Trap focus within a container (useful for modals/dialogs)
 * @param {RefObject} containerRef - Reference to the container element
 * @param {boolean} isActive - Whether the trap is active
 */
export function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive]);
}

/**
 * Announce messages to screen readers
 * @returns {Object} - { announce, clear, LiveRegion }
 */
export function useScreenReaderAnnounce() {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  const announce = useCallback((text, priority = 'polite') => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the message
    setMessage(text);

    // Clear after a delay
    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 5000);
  }, []);

  const clear = useCallback(() => {
    setMessage('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const LiveRegion = useCallback(({ priority = 'polite' }) => (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  ), [message]);

  return { announce, clear, LiveRegion };
}

/**
 * Handle keyboard navigation for lists
 * @param {RefObject} containerRef - Reference to the list container
 * @param {string} itemSelector - CSS selector for list items
 */
export function useArrowNavigation(containerRef, itemSelector = '[role="option"], [role="menuitem"]') {
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e) => {
      const items = Array.from(container.querySelectorAll(itemSelector));
      const currentIndex = items.findIndex(item => item === document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          items[(currentIndex + 1) % items.length]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, itemSelector]);
}

/**
 * Escape key handler for closing modals/dialogs
 * @param {Function} onClose - Function to call when Escape is pressed
 * @param {boolean} isActive - Whether the handler is active
 */
export function useEscapeKey(onClose, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isActive]);
}

/**
 * Visually Hidden component for screen readers
 */
export function VisuallyHidden({ children, as: Component = 'span', ...props }) {
  return (
    <Component className="sr-only" {...props}>
      {children}
    </Component>
  );
}

export default {
  useFocusTrap,
  useScreenReaderAnnounce,
  useArrowNavigation,
  useEscapeKey,
  VisuallyHidden,
};
