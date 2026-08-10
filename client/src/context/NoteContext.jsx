import React, { createContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

export const NoteContext = createContext(null);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    tag: "",
    color: "",
    type: "",
    sort: "newest",
  });

  const fetchNotes = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const { data } = await api.get("/notes", {
          params: { ...filters, ...params },
        });
        setNotes(data.data.notes);
        return data.data;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load notes");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  const fetchPinned = useCallback(async () => {
    try {
      const { data } = await api.get("/notes/pinned");
      setPinnedNotes(data.data.notes);
    } catch {
      /* silent - pinned strip is non-critical */
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch {
      /* silent */
    }
  }, []);

  const createCategory = async (payload) => {
    const { data } = await api.post("/categories", payload);
    setCategories((prev) =>
      [...prev, data.data.category].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
    toast.success("Category created");
    return data.data.category;
  };

  const createNote = async (payload) => {
    const { data } = await api.post("/notes", payload);
    toast.success("Note created");
    return data.data.note;
  };

  const updateNote = async (id, payload) => {
    const { data } = await api.put(`/notes/${id}`, payload);
    return data.data.note;
  };

  const trashNote = async (id) => {
    setNotes((prev) => prev.filter((n) => n._id !== id)); // optimistic
    try {
      await api.delete(`/notes/${id}`);
      toast.success("Moved to trash");
    } catch (err) {
      toast.error("Failed to delete note");
      fetchNotes();
    }
  };

  const togglePin = async (id) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isPinned: !n.isPinned } : n)),
    ); // optimistic
    try {
      const { data } = await api.put(`/notes/${id}/pin`);
      fetchPinned();
      return data.data.note;
    } catch {
      toast.error("Failed to update pin");
      fetchNotes();
    }
  };

  const toggleArchive = async (id) => {
    setNotes((prev) => prev.filter((n) => n._id !== id)); // optimistic
    try {
      await api.put(`/notes/${id}/archive`);
      toast.success("Note archived");
    } catch {
      toast.error("Failed to archive note");
      fetchNotes();
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        pinnedNotes,
        categories,
        loading,
        filters,
        setFilters,
        fetchNotes,
        fetchPinned,
        fetchCategories,
        createCategory,
        createNote,
        updateNote,
        trashNote,
        togglePin,
        toggleArchive,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
