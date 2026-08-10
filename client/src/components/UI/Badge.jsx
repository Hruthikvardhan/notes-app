import React from 'react';

const Badge = ({ children, color, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ink/5 dark:bg-white/5 dark:bg-white/10 text-ink/70 dark:text-gray-300 ${className}`}
    style={color ? { backgroundColor: `${color}22`, color } : undefined}
  >
    {children}
  </span>
);

export default Badge;
