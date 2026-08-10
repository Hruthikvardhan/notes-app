import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4">
    {Icon && (
      <div className="mb-4 w-16 h-16 rounded-full bg-accent-50 dark:bg-white/5 flex items-center justify-center text-accent-500">
        <Icon size={28} />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
    {description && <p className="text-sm text-ink/60 dark:text-gray-400 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
