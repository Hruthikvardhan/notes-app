import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import NoteGrid from '../components/Notes/NoteGrid';
import api from '../utils/api';

const Notes = () => {
  const { view } = useOutletContext();
  const { notes, pinnedNotes, loading, fetchNotes, fetchPinned, fetchCategories, togglePin, toggleArchive, trashNote } = useNotes();

  useEffect(() => {
    fetchNotes();
    fetchPinned();
    fetchCategories();
  }, [fetchNotes, fetchPinned, fetchCategories]);

  const handleColorChange = async (id, color) => {
    await api.put(`/notes/${id}/color`, { color });
    fetchNotes();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {pinnedNotes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-gray-500 mb-3">Pinned</h2>
          <NoteGrid
            notes={pinnedNotes}
            onPin={togglePin}
            onArchive={toggleArchive}
            onTrash={trashNote}
            onColorChange={handleColorChange}
          />
        </section>
      )}

      <section>
        {pinnedNotes.length > 0 && <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-gray-500 mb-3">Others</h2>}
        <NoteGrid
          notes={notes}
          loading={loading}
          onPin={togglePin}
          onArchive={toggleArchive}
          onTrash={trashNote}
          onColorChange={handleColorChange}
          emptyTitle="Nothing here yet"
          emptyDescription="Tap “New note” in the sidebar to capture your first thought."
        />
      </section>
    </div>
  );
};

export default Notes;
