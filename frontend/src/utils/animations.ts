// Animation utilities using anime.js and Framer Motion
// Import anime.js: import anime from 'animejs'

/**
 * Anime.js wrapper for common animations
 */
export const animeAnimations = {
  /**
   * Fade in animation
   */
  fadeIn: (targets | HTMLElement, delay = 0) => {
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
  slideInLeft: (targets | HTMLElement, delay = 0) => {
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
  slideInRight: (targets | HTMLElement, delay = 0) => {
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
  scaleUp: (targets | HTMLElement, delay = 0) => {
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
  stagger: (targets, delay = 0) => {
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
  bounce: (targets | HTMLElement) => {
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
  pulse: (targets | HTMLElement, loop = true) => {
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
  rotate: (targets | HTMLElement, degrees = 360) => {
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
  float: (targets | HTMLElement) => {
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
  progressBar: (targets | HTMLElement, percentage) => {
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
  counter: (element, from, to, duration = 2000) => {
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
  flip: (targets | HTMLElement) => {
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
  shake: (targets | HTMLElement) => {
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
  spinner: (targets | HTMLElement) => {
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
  wave: (targets) => {
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
  private animatedElements = new Set();

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
                  animeAnimations.fadeIn(entry.target, delay);
                  break;
                case 'slide-left':
                  animeAnimations.slideInLeft(entry.target, delay);
                  break;
                case 'slide-right':
                  animeAnimations.slideInRight(entry.target, delay);
                  break;
                case 'scale-up':
                  animeAnimations.scaleUp(entry.target, delay);
                  break;
                default:
                  animeAnimations.fadeIn(entry.target, delay);
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
  fadeIn,
    animate,
    exit,
    transition,
  },

  slideUp,
    animate,
    exit,
    transition,
  },

  slideLeft,
    animate,
    exit,
    transition,
  },

  scale,
    animate,
    exit,
    transition,
  },

  blur,
    animate,
    exit,
    transition,
  },
};

/**
 * Hover animations (for Framer Motion)
 */
export const hoverEffects = {
  lift },
    whileTap,
  },

  grow },
    whileTap,
  },

  glow,
    },
  },

  rotate },
    whileTap,
  },

  pulse,
    },
  },
};

/**
 * Loading animations
 */
export const loadingAnimations = {
  spinner,
    transition,
  },

  dots,
    transition,
  },

  pulse,
    transition,
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

