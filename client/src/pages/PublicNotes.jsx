import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import api from '../utils/api';
import { getInitials, isColorDark } from '../utils/helpers';
import { Link } from 'react-router-dom';

const BREAKPOINTS = { default: 4, 1280: 3, 1024: 3, 768: 2, 500: 1 };

const PublicNotes = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get('/notes/public').then(({ data }) => setNotes(data.data.notes));
  }, []);

  return (
    <div className="min-h-screen bg-paper dark:bg-surface-dark p-4 sm:p-6">
      <header className="flex items-center justify-between max-w-6xl mx-auto mb-6 sm:mb-8">
        <h1 className="font-display text-xl sm:text-2xl font-semibold dark:text-gray-100">Public notes</h1>
        <Link to="/login" className="text-sm text-accent-500 font-medium">
          Sign in
        </Link>
      </header>

      <div className="max-w-6xl mx-auto">
        <Masonry breakpointCols={BREAKPOINTS} className="masonry-grid" columnClassName="masonry-grid_column">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`rounded-note p-4 border border-ink/10 dark:border-white/10 shadow-note ${isColorDark(note.color) ? 'text-white' : 'text-ink'}`}
              style={{ backgroundColor: note.color }}
            >
              <h3 className="font-display font-semibold mb-1">{note.title}</h3>
              <p className="text-sm opacity-80 line-clamp-4 whitespace-pre-line">{note.contentText}</p>
              <div className="flex items-center gap-2 mt-3 text-xs opacity-60">
                <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                  {getInitials(note.userId?.name)}
                </span>
                {note.userId?.name}
              </div>
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
};

export default PublicNotes;
