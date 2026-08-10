import React from 'react';
import Masonry from 'react-masonry-css';
import { AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';
import EmptyState from '../UI/EmptyState';
import { NoteGridSkeleton } from '../UI/Skeleton';
import { IoDocumentTextOutline } from 'react-icons/io5';

const BREAKPOINTS = { default: 4, 1280: 3, 1024: 3, 768: 2, 500: 1 };

const NoteGrid = ({ notes, loading, onPin, onArchive, onTrash, onColorChange, emptyTitle = 'No notes yet', emptyDescription = 'Notes you create will show up here.' }) => {
  if (loading) return <NoteGridSkeleton />;

  if (!notes || notes.length === 0) {
    return <EmptyState icon={IoDocumentTextOutline} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Masonry breakpointCols={BREAKPOINTS} className="masonry-grid" columnClassName="masonry-grid_column">
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onPin={onPin}
            onArchive={onArchive}
            onTrash={onTrash}
            onColorChange={onColorChange}
          />
        ))}
      </AnimatePresence>
    </Masonry>
  );
};

export default NoteGrid;
