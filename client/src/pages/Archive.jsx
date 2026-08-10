import React, { useEffect, useState, useCallback } from 'react';
import { IoArchiveOutline } from 'react-icons/io5';
import api from '../utils/api';
import NoteGrid from '../components/Notes/NoteGrid';
import toast from 'react-hot-toast';

const Archive = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes/archived');
      setNotes(data.data.notes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unarchive = async (id) => {
    await api.put(`/notes/${id}/archive`);
    toast.success('Note restored to notes');
    load();
  };

  const trash = async (id) => {
    await api.delete(`/notes/${id}`);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-display text-xl font-semibold mb-4">Archived notes</h1>
      <NoteGrid
        notes={notes}
        loading={loading}
        onArchive={unarchive}
        onTrash={trash}
        emptyTitle="Archive is empty"
        emptyDescription="Notes you archive will land here, out of your main view."
      />
      {!loading && notes.length === 0 && <IoArchiveOutline className="hidden" />}
    </div>
  );
};

export default Archive;
