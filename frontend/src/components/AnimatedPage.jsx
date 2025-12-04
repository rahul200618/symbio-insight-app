import { motion } from 'motion/react';
import { useEffect } from 'react';
import { initAnimeJS } from '../utils/animations';

export function AnimatedPage({ children, animation = 'fade' }) {
  useEffect(() => {
    initAnimeJS();
  }, []);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    'slide-up': {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
      transition: { duration: 0.3 }
    },
    'slide-left': {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 },
      transition: { duration: 0.3 }
    },
    scale: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      transition: { duration: 0.3 }
    },
    blur: {
      initial: { filter: 'blur(10px)', opacity: 0 },
      animate: { filter: 'blur(0px)', opacity: 1 },
      exit: { filter: 'blur(10px)', opacity: 0 },
      transition: { duration: 0.3 }
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
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : undefined}
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        },
        hidden: { opacity: 0 },
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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
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
        y: [-distance, distance, -distance],
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

export function ScrollProgressBar({ className = '', progress = 0 }) {
  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 origin-left z-50 ${className}`}
      style={{ scaleX: progress }}
      initial={{ scaleX: 0 }}
    />
  );
}
