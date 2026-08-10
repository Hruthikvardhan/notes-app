import React, { useState, useEffect, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoPin,
  IoPinOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoImageOutline,
} from "react-icons/io5";
import ColorPicker from "./ColorPicker";
import ChecklistNote from "./ChecklistNote";
import Button from "../UI/Button";
import { useNotes } from "../../hooks/useNotes";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useTheme } from "../../hooks/useTheme";
import { NOTE_TYPES } from "../../utils/constants";
import api from "../../utils/api";

const emptyNote = {
  title: "",
  content: "",
  color: "#FFFFFF",
  noteType: NOTE_TYPES.TEXT,
  tags: [],
  checklistItems: [],
  category: "",
  isPinned: false,
  isPublic: false,
};

const NoteEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { createNote, updateNote, categories, fetchCategories } = useNotes();
  const { theme } = useTheme();

  const [note, setNote] = useState(emptyNote);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const { data } = await api.get(`/notes/${id}`);
        setNote(data.data.note);
      } catch {
        toast.error("Could not load note");
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditing, navigate]);

  const persist = useCallback(
    async (current) => {
      if (!current.title?.trim()) return;
      if (isEditing) {
        await updateNote(id, current);
      } else {
        const created = await createNote(current);
        navigate(`/notes/${created._id}/edit`, { replace: true });
      }
    },
    [id, isEditing, createNote, updateNote, navigate],
  );

  const autoSaveStatus = useAutoSave(
    note,
    persist,
    note.title.trim().length > 0,
  );

  const handleManualSave = async () => {
    if (!note.title.trim()) {
      toast.error("Please add a title before saving");
      return;
    }
    try {
      await persist(note);
      toast.success("Note saved");
      if (!isEditing) navigate("/notes");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setNote((n) => ({
        ...n,
        tags: [...new Set([...n.tags, tagInput.trim().toLowerCase()])],
      }));
      setTagInput("");
    }
  };

  const wordCount = note.content
    ? note.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isEditing) {
      if (!isEditing) toast("Save the note once before adding images");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await api.post(`/notes/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNote(data.data.note);
      toast.success("Image added");
    } catch {
      toast.error("Image upload failed");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-ink/50 dark:text-gray-400">Loading note…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <input
        value={note.title}
        onChange={(e) => setNote((n) => ({ ...n, title: e.target.value }))}
        placeholder="Note title"
        className="w-full text-2xl font-display font-semibold bg-transparent outline-none mb-4 placeholder:text-ink/30 dark:text-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500"
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {Object.values(NOTE_TYPES).map((t) => (
          <button
            key={t}
            onClick={() => setNote((n) => ({ ...n, noteType: t }))}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              note.noteType === t
                ? "bg-accent-500 text-white border-accent-500"
                : "border-ink/15 dark:border-white/15 text-ink/60 dark:text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
        <label className="px-3 py-1 rounded-full text-xs font-medium border border-ink/15 dark:border-white/15 text-ink/60 dark:text-gray-400 cursor-pointer flex items-center gap-1">
          <IoImageOutline size={14} /> Upload image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {note.noteType === NOTE_TYPES.CHECKLIST ? (
        <ChecklistNote
          items={note.checklistItems}
          onChange={(items) =>
            setNote((n) => ({ ...n, checklistItems: items }))
          }
        />
      ) : (
        <div data-color-mode={theme === "DARK" ? "dark" : "light"} className="overflow-x-auto">
          <MDEditor
            value={note.content}
            onChange={(val) => setNote((n) => ({ ...n, content: val || "" }))}
            height={320}
            preview="live"
          />
          <p className="text-xs text-ink/40 dark:text-gray-500 mt-1">
            {wordCount} words · {readTime} min read
          </p>
        </div>
      )}

      {note.images?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {note.images.map((img) => (
            <img
              key={img._id}
              src={img.url}
              alt=""
              className="w-24 h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ColorPicker
          value={note.color}
          onChange={(color) => setNote((n) => ({ ...n, color }))}
        />

        <select
          value={note.category?._id || note.category || ""}
          onChange={(e) => setNote((n) => ({ ...n, category: e.target.value }))}
          className="text-sm bg-transparent border border-ink/15 dark:border-white/15 rounded-full px-3 py-1.5 dark:text-gray-200"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setNote((n) => ({ ...n, isPinned: !n.isPinned }))}
          className="p-2 rounded-full border border-ink/15 dark:border-white/15 text-ink/60 dark:text-gray-400"
          title="Pin"
        >
          {note.isPinned ? <IoPin size={16} /> : <IoPinOutline size={16} />}
        </button>

        <button
          onClick={() => setNote((n) => ({ ...n, isPublic: !n.isPublic }))}
          className="p-2 rounded-full border border-ink/15 dark:border-white/15 text-ink/60 dark:text-gray-400"
          title="Public"
        >
          {note.isPublic ? (
            <IoGlobeOutline size={16} />
          ) : (
            <IoLockClosedOutline size={16} />
          )}
        </button>
      </div>

      <input
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={addTag}
        placeholder="Add a tag and press Enter"
        className="w-full mt-4 text-sm bg-transparent border-b border-ink/10 dark:border-white/10 outline-none py-1.5"
      />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {note.tags.map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-ink/5 dark:bg-white/5">
            #{t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <span className="text-xs text-ink/40 dark:text-gray-500">
          {autoSaveStatus === "saving"
            ? "Saving…"
            : autoSaveStatus === "saved"
              ? "All changes saved"
              : ""}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/notes")}>
            Cancel
          </Button>
          <Button onClick={handleManualSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
