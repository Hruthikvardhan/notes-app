import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600',
  secondary: 'bg-transparent text-ink dark:text-gray-100 border border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5',
  ghost: 'bg-transparent text-ink/70 dark:text-gray-300 hover:bg-ink/5 dark:hover:bg-white/10',
  danger: 'bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', icon: Icon, ...props }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </motion.button>
  );
};

export default Button;
