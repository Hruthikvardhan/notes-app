import React, { useEffect, useState, useCallback } from 'react';
import { IoTrashOutline, IoRefreshOutline, IoCloseCircleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import api from '../utils/api';
import EmptyState from '../components/UI/EmptyState';
import Button from '../components/UI/Button';

const Trash = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes/trash');
      setNotes(data.data.notes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const restore = async (id) => {
    await api.put(`/notes/${id}/restore`);
    toast.success('Note restored');
    load();
  };

  const deleteForever = async (id) => {
    await api.delete(`/notes/${id}/permanent`);
    toast.success('Note permanently deleted');
    load();
  };

  const emptyTrash = async () => {
    await Promise.all(notes.map((n) => api.delete(`/notes/${n._id}/permanent`)));
    toast.success('Trash emptied');
    load();
  };

  if (loading) return <p className="text-center text-ink/40 dark:text-gray-500 py-10">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-semibold">Trash</h1>
        {notes.length > 0 && (
          <Button variant="danger" size="sm" onClick={emptyTrash}>
            Empty trash
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={IoTrashOutline} title="Trash is empty" description="Deleted notes stay here for 30 days before they're gone for good." />
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note._id}
              className="flex items-center justify-between p-4 rounded-note border border-ink/10 dark:border-white/10"
              style={{ backgroundColor: note.color }}
            >
              <div>
                <h3 className="font-medium">{note.title}</h3>
                <p className="text-xs opacity-60">{note.daysRemaining} day(s) left before permanent deletion</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => restore(note._id)} className="p-2 rounded-full hover:bg-black/10" title="Restore">
                  <IoRefreshOutline size={18} />
                </button>
                <button onClick={() => deleteForever(note._id)} className="p-2 rounded-full hover:bg-black/10" title="Delete permanently">
                  <IoCloseCircleOutline size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Trash;
