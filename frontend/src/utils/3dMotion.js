import { useState, useEffect } from 'react';

/**
 * 3D Motion Utilities for Interactive UI Elements
 * Provides reusable 3D transforms, animations, and effects
 */

// 3D Tilt Effect Configuration
export const tiltEffect = {
  initial: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: { scale: 1.05, rotateX: 5, rotateY: 5 },
  tap: { scale: 0.95 }
};

// Floating Animation with 3D depth
export const floatingAnimation = {
  y: [0, -20, 0],
  rotateX: [0, 2, 0],
  rotateY: [0, -2, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Parallax Scroll Effect
export const parallaxVariants = {
  initial: { y: 0, opacity: 0, scale: 0.8 },
  animate: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  exit: { 
    y: 100, 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

// 3D Card Flip Animation
export const cardFlipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  }
};

// Stagger Children Animation with 3D
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 50,
    rotateX: -15,
    scale: 0.9
  },
  show: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Magnetic Button Effect
export const magneticEffect = (x, y, strength = 0.3) => ({
  x: x * strength,
  y: y * strength,
  transition: { type: "spring", stiffness: 150, damping: 15 }
});

// 3D Hover Lift with Shadow
export const hoverLift = {
  rest: {
    y: 0,
    rotateX: 0,
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  },
  hover: {
    y: -12,
    rotateX: 5,
    scale: 1.02,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Perspective Container Settings
export const perspectiveContainer = {
  style: {
    perspective: "1000px",
    perspectiveOrigin: "center center"
  }
};

// Rotate on Scroll Animation
export const rotateOnScroll = (scrollProgress) => ({
  rotateY: scrollProgress * 360,
  scale: 1 + scrollProgress * 0.2,
  transition: { type: "spring", stiffness: 50 }
});

// Depth Layer Animation (Parallax Layers)
export const depthLayers = {
  layer1: { z: 0, scale: 1 },
  layer2: { z: 50, scale: 1.05 },
  layer3: { z: 100, scale: 1.1 },
  layer4: { z: 150, scale: 1.15 }
};

// Glass Morphism with 3D
export const glassMorphism3D = {
  style: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    transform: "translateZ(50px)"
  }
};

// Bounce with 3D Effect
export const bounce3D = {
  y: [0, -30, 0],
  rotateX: [0, 10, 0],
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.6,
    ease: [0.34, 1.56, 0.64, 1]
  }
};

// Pulse with Depth
export const pulseDepth = {
  scale: [1, 1.05, 1],
  z: [0, 30, 0],
  boxShadow: [
    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "0 20px 40px -12px rgba(99, 102, 241, 0.5)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Orbital Rotation
export const orbitalRotation = {
  rotate: [0, 360],
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: "linear"
  }
};

// 3D Text Effect
export const text3D = {
  style: {
    textShadow: "0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25)"
  }
};

// Ripple Effect (for buttons)
export const rippleEffect = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { scale: 2.5, opacity: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Spring Configs
export const springConfigs = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  bouncy: { type: "spring", stiffness: 300, damping: 10 },
  snappy: { type: "spring", stiffness: 400, damping: 17 },
  slow: { type: "spring", stiffness: 80, damping: 20 }
};

// Custom Hook for Mouse Position (for parallax)
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

// Calculate tilt based on mouse position
export const calculateTilt = (e, element, maxTilt = 15) => {
  if (!element) return { rotateX: 0, rotateY: 0 };

  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateY = ((x - centerX) / centerX) * maxTilt;
  const rotateX = ((centerY - y) / centerY) * maxTilt;
  
  return { rotateX, rotateY };
};

// 3D Button Variants
export const button3D = {
  rest: {
    scale: 1,
    boxShadow: "0 10px 30px -15px rgba(99, 102, 241, 0.4)",
    y: 0
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.6)",
    y: -5,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 5px 15px -10px rgba(99, 102, 241, 0.3)",
    y: 0
  }
};

// Scroll-triggered 3D reveal
export const scrollReveal3D = {
  hidden: {
    opacity: 0,
    y: 100,
    rotateX: -30,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};
