import React from 'react';
import SkeletonLoader, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '../../hooks/useTheme';

export const NoteCardSkeleton = () => {
  const { theme } = useTheme();
  const heights = [120, 160, 90, 200, 140];
  const height = heights[Math.floor(Math.random() * heights.length)];

  return (
    <SkeletonTheme baseColor={theme === 'DARK' ? '#2a2f33' : '#eee'} highlightColor={theme === 'DARK' ? '#353b40' : '#f7f7f7'}>
      <div className="rounded-note p-4 border border-ink/10 dark:border-white/10">
        <SkeletonLoader height={18} width="60%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={height} />
      </div>
    </SkeletonTheme>
  );
};

export const NoteGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <NoteCardSkeleton key={i} />
    ))}
  </div>
);
