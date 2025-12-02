// Animation utilities using anime.js and Framer Motion
// Import anime.js: import anime from 'animejs'

/**
 * Anime.js wrapper for common animations
 */
export const animeAnimations = {
  /**
   * Fade in animation
   */
  fadeIn: (targets: string | HTMLElement, delay = 0) => {
    if (typeof window === 'undefined') return;
    
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay,
      easing: 'easeOutCubic',
    });
  },

  /**
   * Slide in from left
   */
  slideInLeft: (targets: string | HTMLElement, delay = 0) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      opacity: [0, 1],
      translateX: [-50, 0],
      duration: 600,
      delay,
      easing: 'easeOutQuad',
    });
  },

  /**
   * Slide in from right
   */
  slideInRight: (targets: string | HTMLElement, delay = 0) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      opacity: [0, 1],
      translateX: [50, 0],
      duration: 600,
      delay,
      easing: 'easeOutQuad',
    });
  },

  /**
   * Scale up animation
   */
  scaleUp: (targets: string | HTMLElement, delay = 0) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 500,
      delay,
      easing: 'easeOutBack',
    });
  },

  /**
   * Stagger animation for multiple elements
   */
  stagger: (targets: string, delay = 0) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      delay: anime.stagger(100, { start: delay }),
      easing: 'easeOutQuad',
    });
  },

  /**
   * Bounce animation
   */
  bounce: (targets: string | HTMLElement) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      translateY: [
        { value: -10, duration: 300 },
        { value: 0, duration: 300 },
        { value: -5, duration: 200 },
        { value: 0, duration: 200 },
      ],
      easing: 'easeOutElastic(1, .6)',
    });
  },

  /**
   * Pulse animation
   */
  pulse: (targets: string | HTMLElement, loop = true) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      scale: [1, 1.05, 1],
      duration: 1000,
      loop,
      easing: 'easeInOutQuad',
    });
  },

  /**
   * Rotate animation
   */
  rotate: (targets: string | HTMLElement, degrees = 360) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      rotate: [0, degrees],
      duration: 1000,
      easing: 'easeInOutQuad',
    });
  },

  /**
   * Float animation (continuous)
   */
  float: (targets: string | HTMLElement) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      translateY: [-10, 10],
      duration: 2000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine',
    });
  },

  /**
   * Progress bar animation
   */
  progressBar: (targets: string | HTMLElement, percentage: number) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      width: [`0%`, `${percentage}%`],
      duration: 1500,
      easing: 'easeOutQuart',
    });
  },

  /**
   * Number counter animation
   */
  counter: (element: HTMLElement, from: number, to: number, duration = 2000) => {
    const anime = (window as any).anime;
    if (!anime) return;

    const obj = { value: from };
    return anime({
      targets: obj,
      value: to,
      duration,
      easing: 'easeOutQuad',
      update: () => {
        element.textContent = Math.round(obj.value).toString();
      },
    });
  },

  /**
   * Card flip animation
   */
  flip: (targets: string | HTMLElement) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      rotateY: [0, 180],
      duration: 600,
      easing: 'easeInOutQuad',
    });
  },

  /**
   * Shake animation (for errors)
   */
  shake: (targets: string | HTMLElement) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      translateX: [
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: 0, duration: 100 },
      ],
      easing: 'easeInOutQuad',
    });
  },

  /**
   * Loading spinner
   */
  spinner: (targets: string | HTMLElement) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      rotate: 360,
      duration: 1000,
      loop: true,
      easing: 'linear',
    });
  },

  /**
   * Wave animation for text
   */
  wave: (targets: string) => {
    const anime = (window as any).anime;
    if (!anime) return;

    return anime({
      targets,
      translateY: [
        { value: -5, duration: 250 },
        { value: 0, duration: 250 },
      ],
      delay: anime.stagger(50),
      loop: true,
      easing: 'easeInOutSine',
    });
  },
};

/**
 * Scroll animation observer
 */
export class ScrollAnimationObserver {
  private observer: IntersectionObserver | null = null;
  private animatedElements = new Set<Element>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
              this.animatedElements.add(entry.target);
              const animationType = entry.target.getAttribute('data-animation');
              const delay = parseInt(entry.target.getAttribute('data-delay') || '0');

              switch (animationType) {
                case 'fade-in':
                  animeAnimations.fadeIn(entry.target as HTMLElement, delay);
                  break;
                case 'slide-left':
                  animeAnimations.slideInLeft(entry.target as HTMLElement, delay);
                  break;
                case 'slide-right':
                  animeAnimations.slideInRight(entry.target as HTMLElement, delay);
                  break;
                case 'scale-up':
                  animeAnimations.scaleUp(entry.target as HTMLElement, delay);
                  break;
                default:
                  animeAnimations.fadeIn(entry.target as HTMLElement, delay);
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );
    }
  }

  observe(element: Element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Page transition animations
 */
export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 },
  },

  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
    transition: { duration: 0.5 },
  },
};

/**
 * Hover animations (for Framer Motion)
 */
export const hoverEffects = {
  lift: {
    whileHover: { y: -5, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
  },

  grow: {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95 },
  },

  glow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
      transition: { duration: 0.2 },
    },
  },

  rotate: {
    whileHover: { rotate: 5, transition: { duration: 0.2 } },
    whileTap: { rotate: -5 },
  },

  pulse: {
    whileHover: {
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 0.8 },
    },
  },
};

/**
 * Loading animations
 */
export const loadingAnimations = {
  spinner: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },

  dots: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Initialize anime.js from CDN
 */
export function initAnimeJS() {
  if (typeof window === 'undefined') return;
  
  // Check if already loaded
  if ((window as any).anime) return;

  // Load anime.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
  script.async = true;
  document.head.appendChild(script);
}
