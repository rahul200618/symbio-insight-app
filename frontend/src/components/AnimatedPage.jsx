import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { initAnimeJS } from '../utils/animations';



export function AnimatedPage({ children, animation = 'fade' }) {
  useEffect(() => {
    initAnimeJS();
  }, []);

  const variants = {
    fade: {
      initial,
      animate,
      exit,
      transition,
    },
    'slide-up': {
      initial,
      animate,
      exit,
      transition,
    },
    'slide-left': {
      initial,
      animate,
      exit,
      transition,
    },
    scale: {
      initial,
      animate,
      exit,
      transition,
    },
    blur: {
      initial,
      animate,
      exit,
      transition,
    },
  };

  const selectedVariants = variants[animation];

  return (
    <motion.div
      initial={selectedVariants.initial}
      animate={selectedVariants.animate}
      exit={selectedVariants.exit}
      transition={selectedVariants.transition}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}



export function AnimatedCard({ children, delay = 0, className = '', hover = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, transition } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}



export function AnimatedButton({ children, onClick, className = '', disabled, type = 'button' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
}



export function AnimatedList({ children, className = '', staggerDelay = 0.1 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden,
        visible,
      }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}



export function FloatingElement({ children, className = '', duration = 3, distance = 10 }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}



export function PulsingElement({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}



export function ScrollProgressBar({ className = '' }) {
  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 origin-left z-50 ${className}`}
      initial={{ scaleX: 0 }}
      style={{ transformOrigin: '0%' }}
      whileInView={{ scaleX: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
}

