import { motion } from 'motion/react';

export function Logo({ size = 'md', animate = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 64,
  };

  const iconSize = iconSizes[size] || 40;

  const LogoContent = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left strand */}
      <motion.path
        d="M12 4 Q8 12, 12 20 Q16 28, 12 36"
        stroke="url(#gradient1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : {}}
        animate={animate ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Right strand */}
      <motion.path
        d="M28 4 Q32 12, 28 20 Q24 28, 28 36"
        stroke="url(#gradient2)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : {}}
        animate={animate ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
      />
      
      {/* Connecting base pairs */}
      <motion.line
        x1="12" y1="8" x2="28" y2="8"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={animate ? { scaleX: 0, opacity: 0 } : {}}
        animate={animate ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
      />
      <motion.circle 
        cx="20" 
        cy="8" 
        r="1.5" 
        fill="white"
        initial={animate ? { scale: 0 } : {}}
        animate={animate ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.7 }}
      />
      
      <motion.line
        x1="12" y1="16" x2="28" y2="16"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={animate ? { scaleX: 0, opacity: 0 } : {}}
        animate={animate ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <motion.circle 
        cx="20" 
        cy="16" 
        r="1.5" 
        fill="white"
        initial={animate ? { scale: 0 } : {}}
        animate={animate ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      
      <motion.line
        x1="12" y1="24" x2="28" y2="24"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={animate ? { scaleX: 0, opacity: 0 } : {}}
        animate={animate ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.7 }}
      />
      <motion.circle 
        cx="20" 
        cy="24" 
        r="1.5" 
        fill="white"
        initial={animate ? { scale: 0 } : {}}
        animate={animate ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.9 }}
      />
      
      <motion.line
        x1="12" y1="32" x2="28" y2="32"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={animate ? { scaleX: 0, opacity: 0 } : {}}
        animate={animate ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.8 }}
      />
      <motion.circle 
        cx="20" 
        cy="32" 
        r="1.5" 
        fill="white"
        initial={animate ? { scale: 0 } : {}}
        animate={animate ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 1.0 }}
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 1)" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg`}
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.5
        }}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg`}>
      <LogoContent />
    </div>
  );
}
