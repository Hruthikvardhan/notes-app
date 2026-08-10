import React from 'react';
import { IoAdd, IoTrashOutline } from 'react-icons/io5';

const ChecklistNote = ({ items = [], onChange, readOnly = false }) => {
  const completed = items.filter((i) => i.isCompleted).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  const updateItem = (idx, patch) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const addItem = () => onChange([...items, { text: '', isCompleted: false }]);

  return (
    <div>
      {items.length > 0 && (
        <div className="w-full h-1.5 rounded-full bg-ink/10 dark:bg-white/10 mb-3 overflow-hidden">
          <div className="h-full bg-accent-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={(e) => updateItem(idx, { isCompleted: e.target.checked })}
              className="w-4 h-4 accent-accent-500"
            />
            {readOnly ? (
              <span className={item.isCompleted ? 'line-through text-ink/40 dark:text-gray-500' : ''}>{item.text}</span>
            ) : (
              <input
                value={item.text}
                onChange={(e) => updateItem(idx, { text: e.target.value })}
                placeholder="List item"
                className={`flex-1 bg-transparent outline-none text-sm ${item.isCompleted ? 'line-through text-ink/40 dark:text-gray-500' : ''}`}
              />
            )}
            {!readOnly && (
              <button type="button" onClick={() => removeItem(idx)} className="text-ink/30 dark:text-gray-600 hover:text-red-500">
                <IoTrashOutline size={15} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1 text-sm text-ink/50 dark:text-gray-400 hover:text-accent-500"
        >
          <IoAdd size={16} /> Add item
        </button>
      )}
    </div>
  );
};

export default ChecklistNote;
