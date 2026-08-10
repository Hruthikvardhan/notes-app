import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
    <h1 className="font-display text-6xl font-semibold text-accent-500 mb-2">404</h1>
    <p className="text-ink/60 dark:text-gray-400 mb-6">This page wandered off and got lost.</p>
    <Link to="/notes" className="text-accent-500 font-medium">
      Back to your notes
    </Link>
  </div>
);

export default NotFound;
