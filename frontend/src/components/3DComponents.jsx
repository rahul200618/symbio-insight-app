import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { calculateTilt } from '../utils/3dMotion';

/**
 * Interactive 3D Card Component with Tilt Effect
 * Reacts to mouse movement with realistic 3D perspective
 */
export function Card3D({ 
  children, 
  className = '', 
  glowColor = 'rgba(99, 102, 241, 0.3)',
  maxTilt = 10,
  scale = 1.02,
  ...props 
}) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const newTilt = calculateTilt(e, cardRef.current, maxTilt);
      setTilt(newTilt);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: isHovered ? scale : 1,
        boxShadow: isHovered 
          ? `0 20px 50px -10px ${glowColor}`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      {...props}
    >
      {children}
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-inherit overflow-hidden"
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${glowColor} 50%, transparent 60%)`,
          backgroundSize: '200% 200%',
          transformStyle: 'preserve-3d'
        }}
        animate={{
          backgroundPosition: isHovered ? '100% 100%' : '0% 0%',
          opacity: isHovered ? 0.3 : 0
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/**
 * Floating 3D Element with gentle bobbing animation
 */
export function Floating3D({ 
  children, 
  delay = 0, 
  duration = 3,
  intensity = 20,
  ...props 
}) {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
        rotateX: [-2, 2, -2],
        rotateY: [-2, 2, -2],
        scale: [1, 1.02, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
      style={{
        transformStyle: 'preserve-3d'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3D Button with depth and interactive press effect
 */
export function Button3D({ 
  children, 
  className = '',
  onClick,
  variant = 'primary',
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white',
    secondary: 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 text-white',
    success: 'bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 text-white',
    danger: 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white'
  };

  return (
    <motion.button
      className={`relative px-6 py-3 rounded-xl font-semibold overflow-hidden ${variants[variant]} ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'translateZ(0)'
      }}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: {
          y: 0,
          scale: 1,
          boxShadow: '0 10px 30px -15px rgba(99, 102, 241, 0.5)',
        },
        hover: {
          y: -5,
          scale: 1.05,
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.7)',
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10
          }
        },
        tap: {
          y: 0,
          scale: 0.95,
          boxShadow: '0 5px 15px -10px rgba(99, 102, 241, 0.4)'
        }
      }}
      onClick={onClick}
      {...props}
    >
      {/* 3D depth layer */}
      <span 
        className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
        style={{ transform: 'translateZ(-10px)' }}
      />
      
      {/* Content */}
      <span className="relative z-10" style={{ transform: 'translateZ(10px)' }}>
        {children}
      </span>

      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{
          transform: 'translateX(-100%) skewX(-15deg)',
        }}
        whileHover={{
          transform: 'translateX(200%) skewX(-15deg)',
          transition: { duration: 0.6, ease: 'easeOut' }
        }}
      />
    </motion.button>
  );
}

/**
 * Glass Morphism Card with 3D depth
 */
export function GlassCard3D({ 
  children, 
  className = '',
  depth = 50,
  ...props 
}) {
  return (
    <motion.div
      className={`relative backdrop-blur-lg bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: `translateZ(${depth}px)`
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.3)',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      {...props}
    >
      {/* Inner glow */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
        style={{ transform: 'translateZ(-20px)' }}
      />
      
      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Parallax Layer Component for depth scrolling
 */
export function ParallaxLayer({ 
  children, 
  depth = 0,
  className = '',
  ...props 
}) {
  const translateZ = depth * 50;

  return (
    <motion.div
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        transform: `translateZ(${translateZ}px) scale(${1 - depth * 0.05})`
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Magnetic Element that follows mouse cursor
 */
export function MagneticElement({ 
  children, 
  strength = 0.3,
  className = '',
  ...props 
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseMove = (e) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      setPosition({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={elementRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3D Icon with rotation on hover
 */
export function Icon3D({ 
  children, 
  rotationDegrees = 20,
  className = '',
  ...props 
}) {
  return (
    <motion.div
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{
        rotateY: rotationDegrees,
        scale: 1.1,
        transition: { type: 'spring', stiffness: 300, damping: 15 }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
