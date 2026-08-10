import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  IoPin,
  IoPinOutline,
  IoCreateOutline,
  IoColorPaletteOutline,
  IoArchiveOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import Badge from '../UI/Badge';
import ChecklistNote from './ChecklistNote';
import ColorPicker from './ColorPicker';
import { truncate, isColorDark } from '../../utils/helpers';
import { format } from 'date-fns';

const NoteCard = ({ note, onPin, onArchive, onTrash, onColorChange }) => {
  const [showColors, setShowColors] = useState(false);
  const dark = isColorDark(note.color);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-note border border-ink/10 dark:border-white/10 shadow-note hover:shadow-note-hover transition-shadow p-4 ${dark ? 'text-white' : 'text-ink'}`}
      style={{ backgroundColor: note.color }}
    >
      <Link to={`/notes/${note._id}/edit`} className="block">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-semibold leading-snug line-clamp-2">{note.title}</h3>
        </div>

        {note.noteType === 'CHECKLIST' ? (
          <ChecklistNote items={note.checklistItems} onChange={() => {}} readOnly />
        ) : note.images?.length ? (
          <img src={note.images[0].url} alt="" className="rounded-lg w-full h-32 object-cover mb-2" />
        ) : (
          <p className="text-sm opacity-80 whitespace-pre-line">{truncate(note.contentText || note.content, 150)}</p>
        )}

        {(note.tags?.length > 0 || note.category) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {note.category?.name && <Badge color={note.category.color}>{note.category.name}</Badge>}
            {note.tags?.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </div>
        )}

        <p className="text-xs opacity-50 mt-3">{format(new Date(note.createdAt), 'MMM d, yyyy')}</p>
      </Link>

      <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPin?.(note._id)} className="p-1.5 rounded-full hover:bg-black/10" title="Pin">
          {note.isPinned ? <IoPin size={16} /> : <IoPinOutline size={16} />}
        </button>
      </div>

      <div className="flex items-center gap-1 mt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity relative">
        <button onClick={() => setShowColors((s) => !s)} className="p-1.5 rounded-full hover:bg-black/10" title="Color">
          <IoColorPaletteOutline size={16} />
        </button>
        <Link to={`/notes/${note._id}/edit`} className="p-1.5 rounded-full hover:bg-black/10" title="Edit">
          <IoCreateOutline size={16} />
        </Link>
        <button onClick={() => onArchive?.(note._id)} className="p-1.5 rounded-full hover:bg-black/10" title="Archive">
          <IoArchiveOutline size={16} />
        </button>
        <button onClick={() => onTrash?.(note._id)} className="p-1.5 rounded-full hover:bg-black/10" title="Delete">
          <IoTrashOutline size={16} />
        </button>

        {showColors && (
          <div className="absolute bottom-8 left-0 z-10 bg-white dark:bg-surface-darkCard rounded-xl shadow-lg border border-ink/10 dark:border-white/10">
            <ColorPicker
              value={note.color}
              onChange={(c) => {
                onColorChange?.(note._id, c);
                setShowColors(false);
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoteCard;
