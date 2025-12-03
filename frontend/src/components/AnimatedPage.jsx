import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { initAnimeJS } from '../utils/animations';

export function AnimatedPage({ children, animation = 'fade' }: AnimatedPageProps) {
  useEffect(() => {
    initAnimeJS();
  }, []);

  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } },
    'slide-up': { initial: { y, opacity: 0 }, animate: { y, opacity: 1 }, exit: { y: -20, opacity: 0 }, transition: { duration: 0.3 } },
    'slide-left': { initial: { x, opacity: 0 }, animate: { x, opacity: 1 }, exit: { x: -20, opacity: 0 }, transition: { duration: 0.3 } },
    scale: { initial: { scale: 0.9, opacity: 0 }, animate: { scale, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, transition: { duration: 0.3 } },
    blur: { initial: { filter: 'blur(10px)', opacity: 0 }, animate: { filter: 'blur(0px)', opacity: 1 }, exit: { filter: 'blur(10px)', opacity: 0 }, transition: { duration: 0.3 } },
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

export function AnimatedCard({ children, delay = 0, className = '', hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity, y, y, delay }}
      whileHover={hover ? { y, transition);
}

export function AnimatedButton({ children, onClick, className = '', disabled, type = 'button' }: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={{ scale);
}

export function AnimatedList({ children, className = '', staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible, transition,
        hidden,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className = '' }: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden, y,
        visible, y,
      }}
      transition={{ duration);
}

export function FloatingElement({ children, className = '', duration = 3, distance = 10 }: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y, -distance, 0],
      }}
      transition={{
        duration,
        repeat,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function PulsingElement({ children, className = '' }: PulsingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale, 1.05, 1],
      }}
      transition={{
        duration,
        repeat,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgressBar({ className = '' }: ScrollProgressBarProps) {
  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 origin-left z-50 ${className}`}
      initial={{ scaleX);
}

