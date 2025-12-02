import { useEffect, useRef, useState } from 'react';
import { animeAnimations } from '../utils/animations';

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  animationType: 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' = 'fade-in',
  delay = 0
) {
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);

          switch (animationType) {
            case 'fade-in':
              animeAnimations.fadeIn(element, delay);
              break;
            case 'slide-left':
              animeAnimations.slideInLeft(element, delay);
              break;
            case 'slide-right':
              animeAnimations.slideInRight(element, delay);
              break;
            case 'scale-up':
              animeAnimations.scaleUp(element, delay);
              break;
          }

          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationType, delay, hasAnimated]);

  return elementRef;
}

/**
 * Hook for stagger animations
 */
export function useStaggerAnimation(delay = 0) {
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const children = container.querySelectorAll('[data-stagger]');
          animeAnimations.stagger(children as any, delay);
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [delay, hasAnimated]);

  return containerRef;
}

/**
 * Hook for number counter animation
 */
export function useCounterAnimation(
  endValue,
  duration = 2000,
  startOnView = true
) {
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    if (startOnView) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            animeAnimations.counter(element, 0, endValue, duration);
            observer.unobserve(element);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      return () => observer.disconnect();
    } else {
      setHasAnimated(true);
      animeAnimations.counter(element, 0, endValue, duration);
    }
  }, [endValue, duration, startOnView, hasAnimated]);

  return elementRef;
}

/**
 * Hook for parallax scroll effect
 */
export function useParallax(speed = 0.5) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      
      element.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return elementRef;
}

/**
 * Hook for scroll progress indicator
 */
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;
      
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
}

/**
 * Hook for reveal on scroll
 */
export function useRevealOnScroll() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { elementRef, isVisible };
}

/**
 * Hook for mouse move parallax effect
 */
export function useMouseParallax(intensity = 20) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      const moveX = deltaX * intensity;
      const moveY = deltaY * intensity;
      
      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return elementRef;
}

